package models

import (
	"database/sql"
	"time"
)

type Link struct {
	ID            int64        `json:"id"`
	Code          string       `json:"code"`
	OriginalURL   string       `json:"original_url"`
	InstagramMode bool         `json:"instagram_mode"`
	CreatedAt     time.Time    `json:"created_at"`
	DeletedAt     sql.NullTime `json:"-"` // Soft delete, don't expose in JSON
}
