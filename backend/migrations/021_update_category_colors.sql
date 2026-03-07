-- Migration: Update Category Colors
-- Date: 2026-02-15
-- Description: Met à jour les couleurs des catégories existantes

-- =====================================================
-- Mise à jour des couleurs par catégorie
-- =====================================================

UPDATE categories SET color = '#8B4513' WHERE slug = 'elevage' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#1E90FF' WHERE slug = 'peches' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#228B22' WHERE slug = 'faune' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#00AB6C' WHERE slug = 'one-health' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#9B59B6' WHERE slug = 'sante-animale' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#E74C3C' WHERE slug = 'antibioresistance' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#1091FF' WHERE slug IN ('news', 'actualites') AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#C0392B' WHERE slug = 'zoonoses' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#2ECC71' WHERE slug = 'publications' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#3498DB' WHERE slug = 'securite-sanitaire' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#8B5CF6' WHERE slug = 'opportunites' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#E67E22' WHERE slug = 'veterinaires' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#E91E63' WHERE slug = 'videos' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#FF5722' WHERE slug = 'covid-19' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#FF9800' WHERE slug = 'mpox' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#F44336' WHERE slug = 'rage' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#00BCD4' WHERE slug IN ('formations', 'analysis') AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#607D8B' WHERE slug = 'article' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#9C27B0' WHERE slug = 'interview' AND (color IS NULL OR color = '#007A33');
UPDATE categories SET color = '#4CAF50' WHERE slug = 'event' AND (color IS NULL OR color = '#007A33');

-- =====================================================
-- Vérification
-- =====================================================
-- SELECT id, slug, name_fr, color FROM categories ORDER BY id;
