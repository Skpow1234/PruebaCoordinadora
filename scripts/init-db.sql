-- Create database
CREATE DATABASE IF NOT EXISTS logistics_db;
USE logistics_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'transporter') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    package_details JSON NOT NULL,
    destination_address JSON NOT NULL,
    status ENUM('pending', 'in_transit', 'delivered') NOT NULL DEFAULT 'pending',
    carrier_id VARCHAR(36),
    route_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_carrier_id (carrier_id),
    INDEX idx_created_at (created_at)
);

-- Create carriers table
CREATE TABLE IF NOT EXISTS carriers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_capacity DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_location JSON NOT NULL,
    end_location JSON NOT NULL,
    distance DECIMAL(10,2) NOT NULL,
    estimated_duration INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active)
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id VARCHAR(36) PRIMARY KEY,
    time_range JSON NOT NULL,
    metrics JSON NOT NULL,
    carrier_performance JSON,
    route_analytics JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
);

-- Create cache table
CREATE TABLE IF NOT EXISTS cache (
    key VARCHAR(255) PRIMARY KEY,
    value JSON NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_expires_at (expires_at)
);

-- Insert default admin user
INSERT INTO users (id, email, password, role)
VALUES (
    UUID(),
    'admin@logistics.com',
    '$2b$10$YourHashedPasswordHere', -- Replace with actual hashed password
    'admin'
)
ON DUPLICATE KEY UPDATE role = 'admin';

-- Create indexes for performance
CREATE INDEX idx_shipments_status_carrier ON shipments(status, carrier_id);
CREATE INDEX idx_shipments_user_status ON shipments(user_id, status);
CREATE INDEX idx_shipments_created_status ON shipments(created_at, status);
CREATE INDEX idx_analytics_time_range ON analytics((CAST(time_range->>'$.start' AS DATETIME)));
CREATE INDEX idx_analytics_metrics ON analytics((CAST(metrics->>'$.totalShipments' AS INT))); 