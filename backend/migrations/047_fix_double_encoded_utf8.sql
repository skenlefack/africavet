-- =====================================================
-- Migration 047: Fix double-encoded UTF-8 data
-- Data was imported via a latin1 connection into utf8mb4 tables,
-- causing characters like é to be stored as Ã©.
-- Uses double-encoding markers (Ã©, Ã¨, Ã , etc.) to identify corrupted rows.
-- =====================================================

SET NAMES utf8mb4;

-- Helper: pattern to detect double-encoded UTF-8
-- These are the most common French accented chars when double-encoded:
-- é→Ã©  è→Ã¨  ê→Ãª  ë→Ã«  à→Ã   â→Ã¢  î→Ã®  ï→Ã¯  ô→Ã´  ù→Ã¹  û→Ã»
-- ç→Ã§  É→Ã‰  È→Ãˆ  œ→Å"  Ô→Ã"  Î→ÃŽ

-- =====================================================
-- 1. Fix categories
-- =====================================================
UPDATE categories SET name_fr = CONVERT(BINARY CONVERT(name_fr USING latin1) USING utf8mb4)
WHERE name_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE categories SET name_en = CONVERT(BINARY CONVERT(name_en USING latin1) USING utf8mb4)
WHERE name_en REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE categories SET description_fr = CONVERT(BINARY CONVERT(description_fr USING latin1) USING utf8mb4)
WHERE description_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE categories SET description_en = CONVERT(BINARY CONVERT(description_en USING latin1) USING utf8mb4)
WHERE description_en REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE categories SET name = CONVERT(BINARY CONVERT(name USING latin1) USING utf8mb4)
WHERE name REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- Sync name with name_fr for any remaining mismatches
UPDATE categories SET name = name_fr
WHERE name_fr IS NOT NULL AND name != name_fr AND name_fr NOT REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE categories SET description = CONVERT(BINARY CONVERT(description USING latin1) USING utf8mb4)
WHERE description REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE categories SET meta_title = CONVERT(BINARY CONVERT(meta_title USING latin1) USING utf8mb4)
WHERE meta_title REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE categories SET meta_description = CONVERT(BINARY CONVERT(meta_description USING latin1) USING utf8mb4)
WHERE meta_description REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- =====================================================
-- 2. Fix posts
-- =====================================================
UPDATE posts SET title = CONVERT(BINARY CONVERT(title USING latin1) USING utf8mb4)
WHERE title REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET title_fr = CONVERT(BINARY CONVERT(title_fr USING latin1) USING utf8mb4)
WHERE title_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET title_en = CONVERT(BINARY CONVERT(title_en USING latin1) USING utf8mb4)
WHERE title_en REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET excerpt = CONVERT(BINARY CONVERT(excerpt USING latin1) USING utf8mb4)
WHERE excerpt REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET excerpt_fr = CONVERT(BINARY CONVERT(excerpt_fr USING latin1) USING utf8mb4)
WHERE excerpt_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET excerpt_en = CONVERT(BINARY CONVERT(excerpt_en USING latin1) USING utf8mb4)
WHERE excerpt_en REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET content = CONVERT(BINARY CONVERT(content USING latin1) USING utf8mb4)
WHERE content REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET content_fr = CONVERT(BINARY CONVERT(content_fr USING latin1) USING utf8mb4)
WHERE content_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET content_en = CONVERT(BINARY CONVERT(content_en USING latin1) USING utf8mb4)
WHERE content_en REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET meta_title = CONVERT(BINARY CONVERT(meta_title USING latin1) USING utf8mb4)
WHERE meta_title REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET meta_title_fr = CONVERT(BINARY CONVERT(meta_title_fr USING latin1) USING utf8mb4)
WHERE meta_title_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET meta_description = CONVERT(BINARY CONVERT(meta_description USING latin1) USING utf8mb4)
WHERE meta_description REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET meta_description_fr = CONVERT(BINARY CONVERT(meta_description_fr USING latin1) USING utf8mb4)
WHERE meta_description_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET country = CONVERT(BINARY CONVERT(country USING latin1) USING utf8mb4)
WHERE country REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET region = CONVERT(BINARY CONVERT(region USING latin1) USING utf8mb4)
WHERE region REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET reviewer_name = CONVERT(BINARY CONVERT(reviewer_name USING latin1) USING utf8mb4)
WHERE reviewer_name REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE posts SET reviewer_title = CONVERT(BINARY CONVERT(reviewer_title USING latin1) USING utf8mb4)
WHERE reviewer_title REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- =====================================================
-- 3. Fix tags
-- =====================================================
UPDATE tags SET name = CONVERT(BINARY CONVERT(name USING latin1) USING utf8mb4)
WHERE name REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- =====================================================
-- 4. Fix menus / menu_items
-- =====================================================
UPDATE menus SET name = CONVERT(BINARY CONVERT(name USING latin1) USING utf8mb4)
WHERE name REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE menu_items SET title = CONVERT(BINARY CONVERT(title USING latin1) USING utf8mb4)
WHERE title REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- =====================================================
-- 5. Fix users
-- =====================================================
UPDATE users SET first_name = CONVERT(BINARY CONVERT(first_name USING latin1) USING utf8mb4)
WHERE first_name REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE users SET last_name = CONVERT(BINARY CONVERT(last_name USING latin1) USING utf8mb4)
WHERE last_name REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- =====================================================
-- 6. Fix homepage_sections (uses JSON columns content_fr/content_en)
-- JSON data requires special handling - skip for now as JSON encoding is different
-- =====================================================

-- =====================================================
-- 7. Fix settings
-- =====================================================
UPDATE settings SET setting_value = CONVERT(BINARY CONVERT(setting_value USING latin1) USING utf8mb4)
WHERE setting_value REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- =====================================================
-- 8. Fix comments
-- =====================================================
UPDATE comments SET content = CONVERT(BINARY CONVERT(content USING latin1) USING utf8mb4)
WHERE content REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE comments SET author_name = CONVERT(BINARY CONVERT(author_name USING latin1) USING utf8mb4)
WHERE author_name REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- =====================================================
-- 9. Fix media
-- =====================================================
UPDATE media SET alt_text = CONVERT(BINARY CONVERT(alt_text USING latin1) USING utf8mb4)
WHERE alt_text REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE media SET caption = CONVERT(BINARY CONVERT(caption USING latin1) USING utf8mb4)
WHERE caption REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';
