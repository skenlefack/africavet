-- Migration 036: Taxonomy Refactoring
-- Adds taxonomy_type to categories, country/region to posts,
-- seeds sub-categories per audit recommendations

-- =========================================
-- 1. ADD taxonomy_type TO categories
-- =========================================

ALTER TABLE categories
  ADD COLUMN taxonomy_type ENUM(
    'subject',
    'content_format',
    'region',
    'country',
    'organization',
    'audience',
    'species',
    'disease'
  ) NOT NULL DEFAULT 'subject' AFTER status;

CREATE INDEX idx_cat_taxonomy ON categories(taxonomy_type);
CREATE INDEX idx_cat_taxonomy_parent ON categories(taxonomy_type, parent_id);

-- =========================================
-- 2. ADD country/region TO posts
-- =========================================

ALTER TABLE posts
  ADD COLUMN country VARCHAR(100) DEFAULT NULL AFTER type,
  ADD COLUMN region VARCHAR(100) DEFAULT NULL AFTER country;

CREATE INDEX idx_posts_country ON posts(country);
CREATE INDEX idx_posts_region ON posts(region);

-- =========================================
-- 3. SEED: Sub-categories for "Santé animale"
-- =========================================

SET @sante_id = (SELECT id FROM categories WHERE slug = 'sante-animale' LIMIT 1);

INSERT IGNORE INTO categories (name, name_fr, name_en, slug, parent_id, taxonomy_type, icon, color, sort_order, status) VALUES
('Maladies transfrontalières', 'Maladies transfrontalières', 'Transboundary Diseases', 'maladies-transfrontalieres', @sante_id, 'subject', 'fa-globe', '#9B59B6', 1, 'active'),
('Maladies des ruminants', 'Maladies des ruminants', 'Ruminant Diseases', 'maladies-ruminants', @sante_id, 'subject', 'fa-cow', '#9B59B6', 2, 'active'),
('Maladies aviaires', 'Maladies aviaires', 'Avian Diseases', 'maladies-aviaires', @sante_id, 'subject', 'fa-dove', '#9B59B6', 3, 'active'),
('Maladies porcines', 'Maladies porcines', 'Swine Diseases', 'maladies-porcines', @sante_id, 'subject', 'fa-piggy-bank', '#9B59B6', 4, 'active'),
('Santé des animaux aquatiques', 'Santé des animaux aquatiques', 'Aquatic Animal Health', 'sante-animaux-aquatiques', @sante_id, 'subject', 'fa-fish', '#9B59B6', 5, 'active'),
('Médicaments vétérinaires', 'Médicaments vétérinaires', 'Veterinary Medicines', 'medicaments-veterinaires', @sante_id, 'subject', 'fa-pills', '#9B59B6', 6, 'active'),
('Services vétérinaires', 'Services vétérinaires', 'Veterinary Services', 'services-veterinaires', @sante_id, 'subject', 'fa-stethoscope', '#9B59B6', 7, 'active');

-- =========================================
-- 4. SEED: Sub-categories for "One Health"
-- =========================================

SET @oh_id = (SELECT id FROM categories WHERE slug = 'one-health' LIMIT 1);

INSERT IGNORE INTO categories (name, name_fr, name_en, slug, parent_id, taxonomy_type, icon, color, sort_order, status) VALUES
('Zoonoses', 'Zoonoses', 'Zoonoses', 'zoonoses-oh', @oh_id, 'subject', 'fa-virus', '#00AB6C', 1, 'active'),
('Sécurité sanitaire des aliments', 'Sécurité sanitaire des aliments', 'Food Safety', 'securite-sanitaire-aliments', @oh_id, 'subject', 'fa-utensils', '#00AB6C', 2, 'active'),
('Environnement et climat', 'Environnement et climat', 'Environment & Climate', 'environnement-climat', @oh_id, 'subject', 'fa-leaf', '#00AB6C', 3, 'active'),
('Préparation aux épidémies', 'Préparation aux épidémies', 'Epidemic Preparedness', 'preparation-epidemies', @oh_id, 'subject', 'fa-shield-virus', '#00AB6C', 4, 'active'),
('Santé publique vétérinaire', 'Santé publique vétérinaire', 'Veterinary Public Health', 'sante-publique-veterinaire', @oh_id, 'subject', 'fa-hospital', '#00AB6C', 5, 'active');

-- =========================================
-- 5. SEED: Sub-categories for "Élevage"
-- =========================================

SET @elevage_id = (SELECT id FROM categories WHERE slug = 'elevage' LIMIT 1);

INSERT IGNORE INTO categories (name, name_fr, name_en, slug, parent_id, taxonomy_type, icon, color, sort_order, status) VALUES
('Bovins et petits ruminants', 'Bovins et petits ruminants', 'Cattle & Small Ruminants', 'bovins-petits-ruminants', @elevage_id, 'subject', 'fa-cow', '#8B4513', 1, 'active'),
('Aviculture', 'Aviculture', 'Poultry Farming', 'aviculture', @elevage_id, 'subject', 'fa-egg', '#8B4513', 2, 'active'),
('Pastoralisme', 'Pastoralisme', 'Pastoralism', 'pastoralisme', @elevage_id, 'subject', 'fa-mountain-sun', '#8B4513', 3, 'active'),
('Productions animales', 'Productions animales', 'Animal Production', 'productions-animales', @elevage_id, 'subject', 'fa-industry', '#8B4513', 4, 'active');

-- =========================================
-- 6. SEED: Sub-categories for "Pêche"
-- =========================================

SET @peches_id = (SELECT id FROM categories WHERE slug = 'peches' LIMIT 1);

INSERT IGNORE INTO categories (name, name_fr, name_en, slug, parent_id, taxonomy_type, icon, color, sort_order, status) VALUES
('Aquaculture', 'Aquaculture', 'Aquaculture', 'aquaculture', @peches_id, 'subject', 'fa-shrimp', '#1E90FF', 1, 'active'),
('Pêche artisanale', 'Pêche artisanale', 'Artisanal Fishing', 'peche-artisanale', @peches_id, 'subject', 'fa-anchor', '#1E90FF', 2, 'active'),
('Pêche industrielle', 'Pêche industrielle', 'Industrial Fishing', 'peche-industrielle', @peches_id, 'subject', 'fa-ship', '#1E90FF', 3, 'active');

-- =========================================
-- 7. SEED: Sub-categories for "Faune"
-- =========================================

SET @faune_id = (SELECT id FROM categories WHERE slug = 'faune' LIMIT 1);

INSERT IGNORE INTO categories (name, name_fr, name_en, slug, parent_id, taxonomy_type, icon, color, sort_order, status) VALUES
('Conservation', 'Conservation', 'Conservation', 'conservation', @faune_id, 'subject', 'fa-tree', '#228B22', 1, 'active'),
('Bien-être animal', 'Bien-être animal', 'Animal Welfare', 'bien-etre-animal', @faune_id, 'subject', 'fa-heart', '#228B22', 2, 'active'),
('Interface faune-bétail', 'Interface faune-bétail', 'Wildlife-Livestock Interface', 'interface-faune-betail', @faune_id, 'subject', 'fa-paw', '#228B22', 3, 'active');

-- =========================================
-- 8. SEED: "Actualités" top-level + sub-categories
-- =========================================

INSERT IGNORE INTO categories (name, name_fr, name_en, slug, taxonomy_type, icon, color, sort_order, status) VALUES
('Actualités', 'Actualités', 'News', 'actualites', 'subject', 'fa-newspaper', '#3463B5', 0, 'active');

SET @actu_id = (SELECT id FROM categories WHERE slug = 'actualites' LIMIT 1);

INSERT IGNORE INTO categories (name, name_fr, name_en, slug, parent_id, taxonomy_type, icon, color, sort_order, status) VALUES
('Actualités institutionnelles', 'Actualités institutionnelles', 'Institutional News', 'actualites-institutionnelles', @actu_id, 'subject', 'fa-building', '#3463B5', 1, 'active'),
('Politiques publiques', 'Politiques publiques', 'Public Policies', 'politiques-publiques', @actu_id, 'subject', 'fa-landmark', '#3463B5', 2, 'active'),
('Alertes sanitaires', 'Alertes sanitaires', 'Health Alerts', 'alertes-sanitaires', @actu_id, 'subject', 'fa-triangle-exclamation', '#3463B5', 3, 'active'),
('Économie et marchés', 'Économie et marchés', 'Economy & Markets', 'economie-marches', @actu_id, 'subject', 'fa-chart-line', '#3463B5', 4, 'active'),
('Innovation', 'Innovation', 'Innovation', 'innovation', @actu_id, 'subject', 'fa-lightbulb', '#3463B5', 5, 'active');

-- =========================================
-- 9. SEED: "Ressources" top-level + sub-categories
-- =========================================

INSERT IGNORE INTO categories (name, name_fr, name_en, slug, taxonomy_type, icon, color, sort_order, status) VALUES
('Ressources', 'Ressources', 'Resources', 'ressources', 'subject', 'fa-book-open', '#2C3E50', 0, 'active');

SET @ress_id = (SELECT id FROM categories WHERE slug = 'ressources' LIMIT 1);

INSERT IGNORE INTO categories (name, name_fr, name_en, slug, parent_id, taxonomy_type, icon, color, sort_order, status) VALUES
('Guides', 'Guides', 'Guides', 'guides', @ress_id, 'subject', 'fa-book', '#2C3E50', 1, 'active'),
('Fiches techniques', 'Fiches techniques', 'Technical Sheets', 'fiches-techniques', @ress_id, 'subject', 'fa-file-lines', '#2C3E50', 2, 'active'),
('Publications scientifiques', 'Publications scientifiques', 'Scientific Publications', 'publications-scientifiques', @ress_id, 'subject', 'fa-flask', '#2C3E50', 3, 'active'),
('Rapports', 'Rapports', 'Reports', 'rapports', @ress_id, 'subject', 'fa-file-pdf', '#2C3E50', 4, 'active'),
('Outils numériques', 'Outils numériques', 'Digital Tools', 'outils-numeriques', @ress_id, 'subject', 'fa-laptop', '#2C3E50', 5, 'active'),
('Vidéos', 'Vidéos', 'Videos', 'videos-ressources', @ress_id, 'subject', 'fa-video', '#2C3E50', 6, 'active'),
('Infographies', 'Infographies', 'Infographics', 'infographies', @ress_id, 'subject', 'fa-chart-pie', '#2C3E50', 7, 'active');

-- =========================================
-- 10. SEED: African regions (taxonomy_type = 'region')
-- =========================================

INSERT IGNORE INTO categories (name, name_fr, name_en, slug, taxonomy_type, icon, color, sort_order, status) VALUES
('Afrique de l''Ouest', 'Afrique de l''Ouest', 'West Africa', 'afrique-ouest', 'region', 'fa-map', '#E67E22', 1, 'active'),
('Afrique centrale', 'Afrique centrale', 'Central Africa', 'afrique-centrale', 'region', 'fa-map', '#27AE60', 2, 'active'),
('Afrique de l''Est', 'Afrique de l''Est', 'East Africa', 'afrique-est', 'region', 'fa-map', '#3498DB', 3, 'active'),
('Afrique australe', 'Afrique australe', 'Southern Africa', 'afrique-australe', 'region', 'fa-map', '#8E44AD', 4, 'active'),
('Afrique du Nord', 'Afrique du Nord', 'North Africa', 'afrique-nord', 'region', 'fa-map', '#E74C3C', 5, 'active');
