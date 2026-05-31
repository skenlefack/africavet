-- Migration 032: Create base tables for Annuaire Panafricain (organizations & human_resources)
-- These tables were previously created manually and are needed by the mapping routes

-- ============================================================
-- ORGANIZATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    acronym VARCHAR(50),
    type VARCHAR(100) DEFAULT 'other',
    description TEXT,
    mission TEXT,
    logo VARCHAR(500),
    website VARCHAR(500),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    country_code CHAR(3),
    region VARCHAR(100),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    whatsapp VARCHAR(50),
    services JSON,
    species_treated JSON,
    specialties JSON,
    emergency_available TINYINT(1) DEFAULT 0,
    available_24_7 TINYINT(1) DEFAULT 0,
    opening_hours JSON,
    languages_spoken JSON,
    license_number VARCHAR(100),
    coverage_area VARCHAR(255),
    founded_year INT,
    staff_count INT,
    veterinarians_count INT,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INT DEFAULT 0,
    show_email TINYINT(1) DEFAULT 1,
    show_phone TINYINT(1) DEFAULT 1,
    is_active TINYINT(1) DEFAULT 1,
    is_verified TINYINT(1) DEFAULT 0,
    submitted_by INT NULL,
    submission_status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'approved',
    submitted_at DATETIME NULL,
    validated_by INT NULL,
    validated_at DATETIME NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_org_type (type),
    INDEX idx_org_country (country),
    INDEX idx_org_country_code (country_code),
    INDEX idx_org_city (city),
    INDEX idx_org_active (is_active),
    INDEX idx_org_submission (submission_status, submitted_by)
);

-- ============================================================
-- HUMAN_RESOURCES TABLE (Experts)
-- ============================================================
CREATE TABLE IF NOT EXISTS human_resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    category VARCHAR(100),
    specialization VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    photo VARCHAR(500),
    biography TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    country_code CHAR(3),
    region VARCHAR(100),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    organization_id INT NULL,
    years_experience INT,
    expertise_summary TEXT,
    expertise_domains JSON,
    qualifications JSON,
    publications JSON,
    languages_spoken JSON,
    show_email TINYINT(1) DEFAULT 1,
    show_phone TINYINT(1) DEFAULT 1,
    is_active TINYINT(1) DEFAULT 1,
    is_verified TINYINT(1) DEFAULT 0,
    submitted_by INT NULL,
    submission_status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'approved',
    submitted_at DATETIME NULL,
    validated_by INT NULL,
    validated_at DATETIME NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hr_category (category),
    INDEX idx_hr_country (country),
    INDEX idx_hr_country_code (country_code),
    INDEX idx_hr_city (city),
    INDEX idx_hr_active (is_active),
    INDEX idx_hr_submission (submission_status, submitted_by)
);

-- ============================================================
-- DOCUMENT_DOWNLOADS TABLE (if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_downloads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    user_id INT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dd_document (document_id),
    INDEX idx_dd_user (user_id)
);
