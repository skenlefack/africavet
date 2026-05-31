-- Migration 030: Enhance Annuaire Panafricain
-- Adds missing columns for advanced search, country tracking, and frontend compatibility

-- ============================================================
-- ORGANIZATIONS: Add missing columns
-- ============================================================

ALTER TABLE organizations ADD COLUMN country VARCHAR(100) NULL AFTER city;

ALTER TABLE organizations ADD COLUMN country_code CHAR(3) NULL AFTER country;

ALTER TABLE organizations ADD COLUMN whatsapp VARCHAR(50) NULL AFTER contact_phone;

ALTER TABLE organizations ADD COLUMN available_24_7 TINYINT(1) DEFAULT 0;

ALTER TABLE organizations ADD COLUMN license_number VARCHAR(100) NULL;

ALTER TABLE organizations ADD COLUMN coverage_area VARCHAR(255) NULL;

ALTER TABLE organizations ADD COLUMN show_email TINYINT(1) DEFAULT 1;

ALTER TABLE organizations ADD COLUMN show_phone TINYINT(1) DEFAULT 1;

-- ============================================================
-- HUMAN_RESOURCES: Add missing columns
-- ============================================================

ALTER TABLE human_resources ADD COLUMN country VARCHAR(100) NULL AFTER city;

ALTER TABLE human_resources ADD COLUMN country_code CHAR(3) NULL AFTER country;

ALTER TABLE human_resources ADD COLUMN show_email TINYINT(1) DEFAULT 1;

ALTER TABLE human_resources ADD COLUMN show_phone TINYINT(1) DEFAULT 1;

ALTER TABLE human_resources ADD COLUMN specialization VARCHAR(255) NULL;

-- ============================================================
-- FULLTEXT INDEXES for search
-- ============================================================

ALTER TABLE organizations ADD FULLTEXT INDEX ft_org_search (name, description, city);

ALTER TABLE human_resources ADD FULLTEXT INDEX ft_hr_search (first_name, last_name, biography);

-- ============================================================
-- Regular indexes for filtering
-- ============================================================

ALTER TABLE organizations ADD INDEX idx_org_country_code (country_code);

ALTER TABLE organizations ADD INDEX idx_org_country (country);

ALTER TABLE human_resources ADD INDEX idx_hr_country_code (country_code);

ALTER TABLE human_resources ADD INDEX idx_hr_country (country);
