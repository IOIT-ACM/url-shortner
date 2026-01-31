package handlers

import (
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

type URLMetadata struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"`
	Favicon     string `json:"favicon"`
}

func resolveURL(base, ref string) string {
	u, err := url.Parse(ref)
	if err != nil {
		return ref
	}
	if u.IsAbs() {
		return ref
	}
	baseURL, err := url.Parse(base)
	if err != nil {
		return ref
	}
	return baseURL.ResolveReference(u).String()
}

func ExtractMetadata(urlStr string) (*URLMetadata, bool) {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Get(urlStr)
	if err != nil {
		return nil, false
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 400 {
		return nil, false
	}

	bodyBytes, _ := io.ReadAll(io.LimitReader(resp.Body, 1024*512))
	body := string(bodyBytes)

	meta := &URLMetadata{}

	titleReg := regexp.MustCompile(`(?i)<title[^>]*>(.*?)</title>`)
	if match := titleReg.FindStringSubmatch(body); len(match) > 1 {
		meta.Title = strings.TrimSpace(match[1])
	}

	ogTitleReg := regexp.MustCompile(`(?i)<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']`)
	if match := ogTitleReg.FindStringSubmatch(body); len(match) > 1 {
		meta.Title = match[1]
	}

	descReg := regexp.MustCompile(`(?i)<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']`)
	if match := descReg.FindStringSubmatch(body); len(match) > 1 {
		meta.Description = match[1]
	}
	ogDescReg := regexp.MustCompile(`(?i)<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']`)
	if match := ogDescReg.FindStringSubmatch(body); len(match) > 1 {
		meta.Description = match[1]
	}

	ogImgReg := regexp.MustCompile(`(?i)<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']`)
	if match := ogImgReg.FindStringSubmatch(body); len(match) > 1 {
		meta.Image = resolveURL(urlStr, match[1])
	}

	favReg := regexp.MustCompile(`(?i)<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']`)
	if match := favReg.FindStringSubmatch(body); len(match) > 1 {
		meta.Favicon = resolveURL(urlStr, match[1])
	} else {
		parsed, _ := url.Parse(urlStr)
		meta.Favicon = parsed.Scheme + "://" + parsed.Host + "/favicon.ico"
	}

	return meta, true
}

func VerifyURLReachability(urlStr string) bool {
	client := &http.Client{
		Timeout: 3 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	resp, err := client.Head(urlStr)
	if err == nil && resp.StatusCode >= 200 && resp.StatusCode < 400 {
		return true
	}
	resp, err = client.Get(urlStr)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode >= 200 && resp.StatusCode < 400
}
