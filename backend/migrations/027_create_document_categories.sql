-- Migration: Create Document Categories Table
-- Date: 2026-03-28
-- Description: Categories hierarchiques pour le gestionnaire de documents de l'Annuaire AfricaVET

-- =====================================================
-- Table: document_categories
-- =====================================================
CREATE TABLE IF NOT EXISTS document_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT DEFAULT NULL,
    name_fr VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    icon VARCHAR(50) DEFAULT 'fa-folder',
    color VARCHAR(7) DEFAULT '#1B5E20',
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_document_categories_slug (slug),
    KEY idx_document_categories_parent (parent_id),
    CONSTRAINT fk_document_categories_parent FOREIGN KEY (parent_id) REFERENCES document_categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Seed : Categories de niveau 1
-- =====================================================
INSERT INTO document_categories (id, parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(1,  NULL, 'Législation & Réglementation',         'Legislation & Regulation',           'legislation-reglementation',         'fa-gavel',         '#1B5E20', 1),
(2,  NULL, 'Santé Animale & Épidémiologie',        'Animal Health & Epidemiology',       'sante-animale-epidemiologie',        'fa-heartbeat',     '#B71C1C', 2),
(3,  NULL, 'Pharmacopée & Médicaments Vétérinaires','Pharmacopoeia & Veterinary Drugs',  'pharmacopee-medicaments',            'fa-pills',         '#4A148C', 3),
(4,  NULL, 'Sécurité Sanitaire des Aliments',      'Food Safety',                        'securite-sanitaire-aliments',        'fa-utensils',      '#E65100', 4),
(5,  NULL, 'Productions Animales',                  'Animal Production',                  'productions-animales',              'fa-cow',           '#006064', 5),
(6,  NULL, 'Faune Sauvage & Biodiversité',         'Wildlife & Biodiversity',            'faune-sauvage-biodiversite',         'fa-paw',           '#33691E', 6),
(7,  NULL, 'Formation & Recherche',                 'Training & Research',                'formation-recherche',               'fa-graduation-cap','#0D47A1', 7),
(8,  NULL, 'Rapports Institutionnels',              'Institutional Reports',              'rapports-institutionnels',          'fa-building',      '#263238', 8),
(9,  NULL, 'One Health / Une Seule Santé',          'One Health',                         'one-health',                        'fa-globe',         '#00695C', 9),
(10, NULL, 'Ressources Pratiques',                  'Practical Resources',                'ressources-pratiques',              'fa-toolbox',       '#F57F17', 10);

-- =====================================================
-- Seed : Sous-categories de niveau 2
-- =====================================================

-- 1. Législation & Réglementation
INSERT INTO document_categories (parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(1, 'Codes sanitaires nationaux',       'National Sanitary Codes',       'codes-sanitaires-nationaux',       'fa-book',       '#1B5E20', 1),
(1, 'Réglementations OIE/OMSA',         'OIE/WOAH Regulations',         'reglementations-oie-omsa',         'fa-landmark',   '#1B5E20', 2),
(1, 'Accords commerciaux SPS',          'SPS Trade Agreements',          'accords-commerciaux-sps',          'fa-handshake',  '#1B5E20', 3),
(1, 'Textes réglementaires UA-BIRA',    'AU-IBAR Regulatory Texts',     'textes-reglementaires-ua-bira',    'fa-file-alt',   '#1B5E20', 4);

-- 2. Santé Animale & Épidémiologie
INSERT INTO document_categories (parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(2, 'Rapports épidémiologiques',        'Epidemiological Reports',       'rapports-epidemiologiques',        'fa-chart-bar',  '#B71C1C', 1),
(2, 'Protocoles de surveillance',       'Surveillance Protocols',        'protocoles-surveillance',          'fa-eye',        '#B71C1C', 2),
(2, 'Fiches maladies prioritaires',     'Priority Disease Sheets',       'fiches-maladies-prioritaires',     'fa-virus',      '#B71C1C', 3),
(2, 'Plans d''urgence sanitaire',       'Health Emergency Plans',        'plans-urgence-sanitaire',          'fa-ambulance',  '#B71C1C', 4);

-- 3. Pharmacopée & Médicaments Vétérinaires
INSERT INTO document_categories (parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(3, 'Listes de médicaments autorisés',  'Authorized Drug Lists',         'listes-medicaments-autorises',     'fa-list',       '#4A148C', 1),
(3, 'Protocoles thérapeutiques',        'Therapeutic Protocols',         'protocoles-therapeutiques',        'fa-syringe',    '#4A148C', 2),
(3, 'Résistance antimicrobienne (RAM)', 'Antimicrobial Resistance (AMR)','resistance-antimicrobienne-ram',   'fa-shield-alt', '#4A148C', 3),
(3, 'Pharmacovigilance',                'Pharmacovigilance',             'pharmacovigilance',                'fa-microscope', '#4A148C', 4);

-- 4. Sécurité Sanitaire des Aliments
INSERT INTO document_categories (parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(4, 'Normes d''inspection (HACCP, Codex)', 'Inspection Standards (HACCP, Codex)', 'normes-inspection-haccp-codex', 'fa-clipboard-check', '#E65100', 1),
(4, 'Guides de bonnes pratiques d''hygiène','Good Hygiene Practice Guides',       'guides-bonnes-pratiques-hygiene','fa-hand-sparkles',  '#E65100', 2),
(4, 'Contrôle des résidus',                'Residue Control',                     'controle-residus',              'fa-flask',          '#E65100', 3),
(4, 'Certification export',                'Export Certification',                'certification-export',          'fa-certificate',    '#E65100', 4);

-- 5. Productions Animales
INSERT INTO document_categories (parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(5, 'Guides d''élevage par espèce',     'Species Farming Guides',        'guides-elevage-espece',            'fa-book-open',  '#006064', 1),
(5, 'Alimentation & nutrition animale', 'Animal Feed & Nutrition',       'alimentation-nutrition-animale',   'fa-seedling',   '#006064', 2),
(5, 'Amélioration génétique',           'Genetic Improvement',           'amelioration-genetique',           'fa-dna',        '#006064', 3),
(5, 'Bien-être animal',                 'Animal Welfare',                'bien-etre-animal',                 'fa-heart',      '#006064', 4);

-- 6. Faune Sauvage & Biodiversité
INSERT INTO document_categories (parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(6, 'Conservation des espèces',          'Species Conservation',          'conservation-especes',             'fa-leaf',       '#33691E', 1),
(6, 'Interface faune-bétail',            'Wildlife-Livestock Interface',  'interface-faune-betail',           'fa-exchange-alt','#33691E', 2),
(6, 'Réglementations CITES',             'CITES Regulations',             'reglementations-cites',            'fa-balance-scale','#33691E', 3);

-- 7. Formation & Recherche
INSERT INTO document_categories (parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(7, 'Curricula vétérinaires',            'Veterinary Curricula',          'curricula-veterinaires',           'fa-chalkboard', '#0D47A1', 1),
(7, 'Publications scientifiques',        'Scientific Publications',       'publications-scientifiques',       'fa-newspaper',  '#0D47A1', 2),
(7, 'Manuels de formation continue',     'Continuing Education Manuals',  'manuels-formation-continue',       'fa-book-reader','#0D47A1', 3),
(7, 'Rapports de recherche',             'Research Reports',              'rapports-recherche',               'fa-search',     '#0D47A1', 4);

-- 8. Rapports Institutionnels
INSERT INTO document_categories (parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(8, 'Rapports annuels des services vétérinaires', 'Annual Veterinary Services Reports', 'rapports-annuels-services-vet',     'fa-file-medical', '#263238', 1),
(8, 'Évaluations PVS (OIE)',                      'PVS Evaluations (OIE)',              'evaluations-pvs-oie',               'fa-star',         '#263238', 2),
(8, 'Plans stratégiques nationaux',                'National Strategic Plans',           'plans-strategiques-nationaux',       'fa-map',          '#263238', 3),
(8, 'Rapports d''organisations internationales',   'International Organization Reports', 'rapports-organisations-internationales','fa-globe-africa','#263238', 4);

-- 9. One Health / Une Seule Santé
INSERT INTO document_categories (parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(9, 'Zoonoses',                           'Zoonoses',                      'zoonoses',                         'fa-virus',      '#00695C', 1),
(9, 'Santé environnementale',             'Environmental Health',          'sante-environnementale',           'fa-tree',       '#00695C', 2),
(9, 'Collaboration intersectorielle',     'Cross-Sectoral Collaboration',  'collaboration-intersectorielle',   'fa-users',      '#00695C', 3);

-- 10. Ressources Pratiques
INSERT INTO document_categories (parent_id, name_fr, name_en, slug, icon, color, sort_order) VALUES
(10, 'Formulaires & modèles administratifs', 'Administrative Forms & Templates', 'formulaires-modeles-administratifs', 'fa-file-invoice', '#F57F17', 1),
(10, 'Guides de procédures',                 'Procedure Guides',                 'guides-procedures',                  'fa-tasks',        '#F57F17', 2),
(10, 'Outils de diagnostic terrain',         'Field Diagnostic Tools',           'outils-diagnostic-terrain',          'fa-stethoscope',  '#F57F17', 3),
(10, 'Matériel de sensibilisation',          'Awareness Materials',              'materiel-sensibilisation',           'fa-bullhorn',     '#F57F17', 4);
