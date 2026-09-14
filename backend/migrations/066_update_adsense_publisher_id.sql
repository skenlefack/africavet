-- =====================================================
-- Migration 066: Set Google AdSense publisher ID
-- =====================================================

UPDATE ad_providers
SET config = '{"publisher_id": "pub-1938227483931090"}'
WHERE slug = 'google-adsense';
