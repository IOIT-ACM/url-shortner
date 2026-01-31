package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/ioit-acm/links/handlers"
	"github.com/ioit-acm/links/middleware"
	"github.com/ioit-acm/links/store"
	"github.com/joho/godotenv"
	"golang.org/x/time/rate"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from system environment variables")
	}

	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")
	baseURL := os.Getenv("BASE_URL")

	if dbUser == "" {
		dbUser = "root"
	}
	if dbHost == "" {
		dbHost = "127.0.0.1"
	}
	if dbPort == "" {
		dbPort = "3306"
	}
	if dbName == "" {
		dbName = "links_db"
	}
	if baseURL == "" {
		baseURL = "http://localhost:5937"
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPass, dbHost, dbPort, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	linkStore := store.NewStore(db)
	h := handlers.NewHandler(linkStore, baseURL)

	r := gin.Default()
	r.LoadHTMLGlob("templates/*")
	r.Static("/static", "./frontend/dist/static")
	r.Static("/assets", "./frontend/dist/assets")

	limiter := middleware.NewIPRateLimiter(rate.Limit(1), 5)

	api := r.Group("/api")
	api.Use(middleware.RateLimitMiddleware(limiter))
	{
		api.POST("/shorten", h.ShortenURL)
		api.GET("/links", h.ListLinks)
	}

	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not Found"})
			return
		}
		if _, err := os.Stat("./frontend/dist" + path); err == nil {
			c.File("./frontend/dist" + path)
			return
		}
		code := strings.TrimPrefix(path, "/")
		if len(code) > 0 && !strings.Contains(code, "/") && !strings.Contains(code, ".") {
			_, err := linkStore.GetLinkByCode(code)
			if err == nil {
				c.Params = append(c.Params, gin.Param{Key: "code", Value: code})
				h.Redirect(c)
				return
			}
		}
		c.File("./frontend/dist/index.html")
	})

	srv := &http.Server{
		Addr:    ":5937",
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}
}
