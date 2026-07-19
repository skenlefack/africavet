-- Migration 043: Add missing columns to organizations table
-- These columns are used by the POST /organizations route but were never added to the schema

ALTER TABLE organizations ADD COLUMN parent_organization_id INT NULL AFTER website;

ALTER TABLE organizations ADD COLUMN social_links JSON NULL AFTER specialties;

ALTER TABLE organizations ADD COLUMN domains JSON NULL AFTER social_links;

ALTER TABLE organizations ADD COLUMN geolocation JSON NULL AFTER domains;

ALTER TABLE organizations ADD COLUMN founded_year INT NULL AFTER coverage_area;

ALTER TABLE organizations ADD COLUMN description_en TEXT NULL AFTER description;

ALTER TABLE human_resources ADD COLUMN biography_en TEXT NULL AFTER biography;

ALTER TABLE human_resources ADD COLUMN address TEXT NULL AFTER region;

ALTER TABLE quizzes ADD COLUMN negative_marking BOOLEAN DEFAULT FALSE AFTER allow_retake;

ALTER TABLE quizzes ADD COLUMN require_passing_to_proceed BOOLEAN DEFAULT FALSE AFTER negative_marking;

ALTER TABLE vet_alerts ADD COLUMN severity_level VARCHAR(50) DEFAULT 'informational';

ALTER TABLE vet_alerts ADD COLUMN broadcast_status VARCHAR(50) DEFAULT 'inactive';

ALTER TABLE vet_alerts ADD COLUMN verification_status VARCHAR(50) DEFAULT 'unverified';

ALTER TABLE vet_alerts ADD COLUMN responsible_authority VARCHAR(255) NULL;

ALTER TABLE vet_alerts ADD COLUMN contact_info TEXT NULL;

ALTER TABLE vet_alerts ADD COLUMN affected_regions TEXT NULL;

ALTER TABLE vet_alerts ADD COLUMN auto_expire_at DATETIME NULL;
