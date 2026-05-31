-- Migration: Seed One Health Summer Institute advertisement
-- Date: 2026-05-31
-- Description: Ajouter la publicite One Health Summer Institute dans le header

INSERT INTO advertisements (
    name, placement_id, provider_id, type,
    image_url, target_url, alt_text,
    status, priority, weight,
    advertiser_name, notes
) VALUES (
    'One Health Summer Institute',
    (SELECT id FROM ad_placements WHERE slug = 'header-banner'),
    (SELECT id FROM ad_providers WHERE slug = 'custom'),
    'image',
    '/uploads/ads/one-health-summer-institute.jpg',
    'https://oh-si.org',
    'One Health Summer Institute - OH-SI',
    'active',
    10,
    100,
    'OH-SI',
    'Publicite header - ouvre oh-si.org dans un nouvel onglet'
);
