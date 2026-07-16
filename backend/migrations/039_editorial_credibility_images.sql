-- Migration 039: Editorial credibility fields + image variants
-- Sprint 5: Organisations & Auteurs

-- =========================================
-- 1. EDITORIAL CREDIBILITY ON POSTS
-- =========================================

ALTER TABLE posts
  ADD COLUMN sources JSON DEFAULT NULL COMMENT 'Array of {organization, title, date, url}' AFTER meta_keywords,
  ADD COLUMN reviewer_name VARCHAR(200) DEFAULT NULL AFTER sources,
  ADD COLUMN reviewer_title VARCHAR(200) DEFAULT NULL COMMENT 'e.g. Vétérinaire épidémiologiste' AFTER reviewer_name,
  ADD COLUMN reviewer_organization VARCHAR(200) DEFAULT NULL AFTER reviewer_title,
  ADD COLUMN health_disclaimer TINYINT(1) DEFAULT 0 COMMENT 'Show health content disclaimer' AFTER reviewer_organization,
  ADD COLUMN last_verified_at DATETIME DEFAULT NULL AFTER health_disclaimer,
  ADD COLUMN image_credit VARCHAR(200) DEFAULT NULL AFTER featured_image,
  ADD COLUMN image_source VARCHAR(500) DEFAULT NULL AFTER image_credit;

-- =========================================
-- 2. IMAGE VARIANTS TRACKING
-- =========================================

ALTER TABLE media
  ADD COLUMN webp_path VARCHAR(500) DEFAULT NULL AFTER path,
  ADD COLUMN thumbnail_path VARCHAR(500) DEFAULT NULL AFTER webp_path,
  ADD COLUMN variants JSON DEFAULT NULL COMMENT 'Array of {width, height, path, format}' AFTER thumbnail_path;
