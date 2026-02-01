package handlers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ioit-acm/links/encoding"
	"github.com/ioit-acm/links/models"
	"github.com/ioit-acm/links/store"
)

type Handler struct {
	store   *store.Store
	baseURL string
}

func NewHandler(store *store.Store, baseURL string) *Handler {
	return &Handler{
		store:   store,
		baseURL: strings.TrimRight(baseURL, "/"),
	}
}

type ShortenRequest struct {
	URL           string `json:"url" binding:"required"`
	InstagramMode bool   `json:"instagram_mode"`
}

type ShortenResponse struct {
	Code          string       `json:"code"`
	ShortURL      string       `json:"short_url"`
	OriginalURL   string       `json:"original_url"`
	InstagramMode bool         `json:"instagram_mode"`
	CreatedAt     string       `json:"created_at"`
	Metadata      *URLMetadata `json:"metadata,omitempty"`
}

func (h *Handler) ShortenURL(c *gin.Context) {
	var req ShortenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if !isAllowedDomain(req.URL) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "URL domain not authorised to shorten by IOIT ACM Admins.",
		})
		return
	}

	metadata, reachable := ExtractMetadata(req.URL)
	if !reachable {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "The provided URL is unreachable or returned an error.",
		})
		return
	}

	existing, err := h.store.GetLinkByUrl(req.URL, req.InstagramMode)
	if err == nil {
		c.JSON(http.StatusOK, ShortenResponse{
			Code:          existing.Code,
			ShortURL:      h.baseURL + "/" + existing.Code,
			OriginalURL:   existing.OriginalURL,
			InstagramMode: existing.InstagramMode,
			CreatedAt:     existing.CreatedAt.Format(time.RFC3339),
			Metadata:      metadata,
		})
		return
	}

	useCollisionFree := os.Getenv("USE_COLLISION_FREE") == "true"

	if useCollisionFree {
		link := &models.Link{
			OriginalURL:   req.URL,
			InstagramMode: req.InstagramMode,
		}

		if err := h.store.CreateLinkWithoutCode(link); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save link"})
			return
		}

		obfuscatedID := encoding.ObfuscateID(link.ID)
		code := encoding.EncodeBase62(obfuscatedID)

		if err := h.store.SetCodeForID(link.ID, code); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set code"})
			return
		}

		c.JSON(http.StatusOK, ShortenResponse{
			Code:          code,
			ShortURL:      h.baseURL + "/" + code,
			OriginalURL:   link.OriginalURL,
			InstagramMode: link.InstagramMode,
			CreatedAt:     time.Now().Format(time.RFC3339),
			Metadata:      metadata,
		})
		return
	}

	var code string
	for i := 0; i < 3; i++ {
		code, err = generateCode()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate code"})
			return
		}
		_, err = h.store.GetLinkByCode(code)
		if err == store.ErrNotFound {
			break
		}
		code = ""
	}

	if code == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate unique code"})
		return
	}

	link := &models.Link{
		Code:          code,
		OriginalURL:   req.URL,
		InstagramMode: req.InstagramMode,
	}

	if err := h.store.CreateLink(link); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save link"})
		return
	}

	c.JSON(http.StatusOK, ShortenResponse{
		Code:          link.Code,
		ShortURL:      h.baseURL + "/" + link.Code,
		OriginalURL:   link.OriginalURL,
		InstagramMode: link.InstagramMode,
		CreatedAt:     time.Now().Format(time.RFC3339),
		Metadata:      metadata,
	})
}

func (h *Handler) Redirect(c *gin.Context) {
	code := c.Param("code")
	link, err := h.store.GetLinkByCode(code)
	if err != nil {
		if err == store.ErrNotFound {
			c.HTML(http.StatusNotFound, "404.html", gin.H{"Code": code})
			return
		}
		c.Status(http.StatusInternalServerError)
		return
	}

	if link.InstagramMode {
		c.Header("Cache-Control", "no-store, no-cache, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.HTML(http.StatusOK, "redirect.html", gin.H{
			"OriginalURL": link.OriginalURL,
		})
		return
	}

	c.Redirect(http.StatusMovedPermanently, link.OriginalURL)
}

func (h *Handler) ListLinks(c *gin.Context) {
	links, total, err := h.store.GetAllLinks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch links"})
		return
	}

	response := make([]ShortenResponse, len(links))
	for i, l := range links {
		response[i] = ShortenResponse{
			Code:          l.Code,
			ShortURL:      h.baseURL + "/" + l.Code,
			OriginalURL:   l.OriginalURL,
			InstagramMode: l.InstagramMode,
			CreatedAt:     l.CreatedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, gin.H{"links": response, "total": total})
}
