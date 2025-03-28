CREATE TABLE IF NOT EXISTS analytics (
  id VARCHAR(36) PRIMARY KEY,
  time_range JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS cache (
  `key` VARCHAR(255) PRIMARY KEY,
  value JSON NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_expires_at (expires_at)
); 