-- Migration: Update Ad Placements for Homepage
-- Date: 2026-02-15
-- Description: Mise à jour des emplacements publicitaires Homepage

-- =====================================================
-- Mise à jour: Header Banner (à côté du logo) - 650x85px
-- =====================================================
UPDATE ad_placements
SET width = 650, height = 85,
    location = 'Bannière à côté du logo AfricaVET (650x85px)'
WHERE slug = 'header-banner';

-- =====================================================
-- Nouvel emplacement: Sidebar après Les Plus Vus - 300x250px
-- =====================================================
INSERT INTO ad_placements (name, name_fr, slug, location, width, height, max_ads, is_active)
VALUES (
    'Sidebar Most Viewed',
    'Sidebar Après Plus Vus',
    'sidebar-mostview',
    'Colonne droite - sous la section Les Plus Vus (300x250px)',
    300,
    250,
    2,
    1
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    name_fr = VALUES(name_fr),
    location = VALUES(location),
    width = VALUES(width),
    height = VALUES(height);

-- =====================================================
-- Vérification des emplacements
-- =====================================================
-- SELECT * FROM ad_placements WHERE slug IN ('header-banner', 'sidebar-mostview');
