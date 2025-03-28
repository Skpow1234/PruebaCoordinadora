CREATE TABLE IF NOT EXISTS trackings (
  id VARCHAR(36) PRIMARY KEY,
  shipment_id VARCHAR(36) NOT NULL,
  current_location JSON NOT NULL,
  status VARCHAR(50) NOT NULL,
  events JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shipment_id (shipment_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
); 