-- Migration 038: Translation status tracking + Audit log enhancements
-- Sprint 3: Bilinguisme & Sécurité

-- =========================================
-- 1. TRANSLATION STATUS ON POSTS
-- =========================================

ALTER TABLE posts
  ADD COLUMN translation_status_fr ENUM('original', 'translated', 'auto', 'to_review', 'validated', 'obsolete') DEFAULT 'original' AFTER region,
  ADD COLUMN translation_status_en ENUM('not_started', 'translated', 'auto', 'to_review', 'validated', 'obsolete') DEFAULT 'not_started' AFTER translation_status_fr,
  ADD COLUMN original_language ENUM('fr', 'en') DEFAULT 'fr' AFTER translation_status_en,
  ADD COLUMN translation_updated_at DATETIME DEFAULT NULL AFTER original_language;

-- =========================================
-- 2. TRANSLATION STATUS ON OPPORTUNITIES
-- =========================================

ALTER TABLE opportunities
  ADD COLUMN translation_status_fr ENUM('original', 'translated', 'auto', 'to_review', 'validated', 'obsolete') DEFAULT 'original' AFTER meta_description,
  ADD COLUMN translation_status_en ENUM('not_started', 'translated', 'auto', 'to_review', 'validated', 'obsolete') DEFAULT 'not_started' AFTER translation_status_fr,
  ADD COLUMN original_language ENUM('fr', 'en') DEFAULT 'fr' AFTER translation_status_en;

-- =========================================
-- 3. ENHANCE AUDIT LOG TABLE
-- =========================================

-- The activity_log table already exists but is underused.
-- Add old_values/new_values columns for change tracking.

ALTER TABLE activity_log
  ADD COLUMN old_values JSON DEFAULT NULL AFTER details,
  ADD COLUMN new_values JSON DEFAULT NULL AFTER old_values;

-- Set existing posts with EN content as translated
UPDATE posts SET translation_status_en = 'translated'
WHERE title_en IS NOT NULL AND title_en != '' AND title_en != title_fr;

-- Set existing opportunities with EN content as translated
UPDATE opportunities SET translation_status_en = 'translated'
WHERE title_en IS NOT NULL AND title_en != '' AND title_en != title_fr;
