-- Migration 054: Add post metadata fields for completeness tracking
-- Phase 1: CMS Mandatory Fields

-- content_language: the primary language of this posts content
ALTER TABLE posts
  ADD COLUMN content_language ENUM('fr','en','bilingual') DEFAULT 'fr' AFTER original_language;

-- Review workflow fields
ALTER TABLE posts
  ADD COLUMN reviewer_id INT DEFAULT NULL AFTER content_language,
  ADD COLUMN reviewed_at DATETIME DEFAULT NULL AFTER reviewer_id,
  ADD COLUMN review_notes TEXT DEFAULT NULL AFTER reviewed_at;

-- Add foreign key for reviewer_id (references users table)
ALTER TABLE posts
  ADD CONSTRAINT fk_posts_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL;
