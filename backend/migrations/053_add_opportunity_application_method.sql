-- Migration 053: Add application_method to opportunities
-- Allows choosing between internal application form or external URL

ALTER TABLE opportunities
  ADD COLUMN application_method ENUM('internal', 'external') DEFAULT 'internal' AFTER application_url;
