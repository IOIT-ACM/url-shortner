package store

import (
	"database/sql"
	"errors"

	"github.com/ioit-acm/links/models"
)

var ErrNotFound = errors.New("record not found")

type Store struct {
	db *sql.DB
}

func NewStore(db *sql.DB) *Store {
	return &Store{db: db}
}

func (s *Store) CreateLink(link *models.Link) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO links (code, original_url, instagram_mode) VALUES (?, ?, ?)`
	result, err := tx.Exec(query, link.Code, link.OriginalURL, link.InstagramMode)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	link.ID = id

	statsQuery := `UPDATE link_stats SET total_count = total_count + 1 WHERE id = 1`
	if _, err := tx.Exec(statsQuery); err != nil {
		return err
	}

	return tx.Commit()
}

func (s *Store) CreateLinkWithoutCode(link *models.Link) error {
	query := `INSERT INTO links (original_url, instagram_mode, code) VALUES (?, ?, NULL)`
	result, err := s.db.Exec(query, link.OriginalURL, link.InstagramMode)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	link.ID = id
	return nil
}

func (s *Store) SetCodeForID(id int64, code string) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE links SET code = ? WHERE id = ?`
	_, err = tx.Exec(query, code, id)
	if err != nil {
		return err
	}

	statsQuery := `UPDATE link_stats SET total_count = total_count + 1 WHERE id = 1`
	if _, err := tx.Exec(statsQuery); err != nil {
		return err
	}

	return tx.Commit()
}

func (s *Store) GetLinkByCode(code string) (*models.Link, error) {
	query := `SELECT id, code, original_url, instagram_mode, created_at FROM links WHERE code = ? AND deleted_at IS NULL`
	row := s.db.QueryRow(query, code)

	var link models.Link
	err := row.Scan(&link.ID, &link.Code, &link.OriginalURL, &link.InstagramMode, &link.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &link, nil
}

func (s *Store) GetLinkByUrl(url string, instaMode bool) (*models.Link, error) {
	query := `SELECT id, code, original_url, instagram_mode, created_at FROM links WHERE original_url = ? AND instagram_mode = ? AND deleted_at IS NULL LIMIT 1`
	row := s.db.QueryRow(query, url, instaMode)

	var link models.Link
	err := row.Scan(&link.ID, &link.Code, &link.OriginalURL, &link.InstagramMode, &link.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &link, nil
}

func (s *Store) GetAllLinks() ([]models.Link, int64, error) {
	query := `
		SELECT id, code, original_url, instagram_mode, created_at
		FROM links
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT 10
	`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var links []models.Link
	for rows.Next() {
		var link models.Link
		if err := rows.Scan(&link.ID, &link.Code, &link.OriginalURL, &link.InstagramMode, &link.CreatedAt); err != nil {
			return nil, 0, err
		}
		links = append(links, link)
	}

	var total int64
	err = s.db.QueryRow("SELECT total_count FROM link_stats WHERE id = 1").Scan(&total)
	if err != nil {
		return links, 0, nil
	}

	return links, total, nil
}
