-- Migration 043: Add missing columns to organizations table
-- These columns are used by the POST /organizations route but were never added to the schema

ALTER TABLE organizations ADD COLUMN parent_organization_id INT NULL AFTER website;

ALTER TABLE organizations ADD COLUMN social_links JSON NULL AFTER specialties;

ALTER TABLE organizations ADD COLUMN domains JSON NULL AFTER social_links;

ALTER TABLE organizations ADD COLUMN geolocation JSON NULL AFTER domains;

ALTER TABLE organizations ADD COLUMN founded_year INT NULL AFTER coverage_area;
