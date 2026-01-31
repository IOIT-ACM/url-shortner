CREATE TABLE IF NOT EXISTS links (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  instagram_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_links_code (code),
  INDEX idx_links_created_at (created_at DESC)
);

CREATE TABLE IF NOT EXISTS link_stats (
  id INT PRIMARY KEY,
  total_count BIGINT DEFAULT 0
);

INSERT INTO link_stats (id, total_count) VALUES (1, 0) ON DUPLICATE KEY UPDATE id=id;