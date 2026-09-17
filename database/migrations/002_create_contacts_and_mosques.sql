-- Migration: 002_create_contacts_and_mosques.sql
CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100) NULL, -- Madrasah, University, Mosque Committee, Foundation, etc.
    contact_person VARCHAR(150) NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(191) NULL,
    address TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_org_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contacts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    designation VARCHAR(150) NULL,
    phone VARCHAR(50) NULL,
    whatsapp VARCHAR(50) NULL,
    email VARCHAR(191) NULL,
    address TEXT NULL,
    reference VARCHAR(200) NULL,
    notes TEXT NULL,
    is_important TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    INDEX idx_contact_name (name),
    INDEX idx_contact_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mosques (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NULL,
    district VARCHAR(100) NULL,
    thana VARCHAR(100) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    maps_url TEXT NULL,
    contact_person VARCHAR(150) NULL,
    phone VARCHAR(50) NULL,
    whatsapp VARCHAR(50) NULL,
    email VARCHAR(191) NULL,
    reference VARCHAR(200) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mosque_name (name),
    INDEX idx_mosque_district (district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
