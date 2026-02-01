package handlers

import (
	"net/url"
	"strings"
)

var AllowedDomains = []string{
	"unstop.com",
	"docs.google.com",
	"drive.google.com",
	"forms.gle",
	"youtube.com",
	"youtu.be",
	"calendar.google.com",
	"linkedin.com",
	"twitter.com",
	"x.com",
	"github.com",
	"notion.so",
	"figma.com",
	"ioittenet.com",
	"instagram.com",
	"ioit.acm.org",
}

var RestrictedDomains = []string{
	"links.ioit.acm.org",
	"localhost",
	"127.0.0.1",
}

func isAllowedDomain(urlStr string) bool {
	u, err := url.Parse(urlStr)
	if err != nil {
		return false
	}

	if u.Scheme != "http" && u.Scheme != "https" {
		return false
	}

	host := strings.ToLower(u.Host)
	if host == "" {
		return false
	}

	for _, domain := range AllowedDomains {
		if host == domain || strings.HasSuffix(host, "."+domain) {
			return true
		}
	}

	return false
}

func IsInternalDomain(urlStr, baseURL string) bool {
	u, err := url.Parse(urlStr)
	if err != nil {
		return false
	}

	host := strings.ToLower(u.Host)

	base, err := url.Parse(baseURL)
	if err == nil {
		baseHost := strings.ToLower(base.Host)
		if host == baseHost || strings.HasSuffix(host, "."+baseHost) {
			return true
		}
	}

	for _, restricted := range RestrictedDomains {
		if host == restricted || strings.HasSuffix(host, "."+restricted) {
			return true
		}
	}

	return false
}
