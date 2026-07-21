-- =====================================================
-- Migration 048: Rebrand newsletter from "One Health" to "AfricaVET"
-- Updates settings, default list, and all templates
-- =====================================================

SET NAMES utf8mb4;

-- =====================================================
-- 1. Fix newsletter settings
-- =====================================================
UPDATE newsletter_settings SET value = '"AfricaVET"' WHERE `key` = 'sender_name';
UPDATE newsletter_settings SET value = '"newsletter@africavet.com"' WHERE `key` = 'sender_email';
UPDATE newsletter_settings SET value = '"contact@africavet.com"' WHERE `key` = 'reply_to';

-- =====================================================
-- 2. Fix default list description
-- =====================================================
UPDATE newsletter_lists
SET description = 'Liste principale de la newsletter AfricaVET - Actualités, analyses et ressources sur la santé animale en Afrique'
WHERE slug = 'newsletter-generale';

-- =====================================================
-- 3. Fix default template subjects
-- =====================================================
UPDATE newsletter_templates
SET subject_fr = 'Newsletter AfricaVET - {{date}}',
    subject_en = 'AfricaVET Newsletter - {{date}}'
WHERE slug = 'template-standard';

-- =====================================================
-- 4. Replace "One Health Cameroun/Cameroon" in ALL template HTML content
-- =====================================================

-- Fix French content
UPDATE newsletter_templates
SET content_html_fr = REPLACE(content_html_fr, 'One Health Cameroun', 'AfricaVET')
WHERE content_html_fr LIKE '%One Health Cameroun%';

UPDATE newsletter_templates
SET content_html_fr = REPLACE(content_html_fr, 'One Health Cameroon', 'AfricaVET')
WHERE content_html_fr LIKE '%One Health Cameroon%';

UPDATE newsletter_templates
SET content_html_fr = REPLACE(content_html_fr, 'one-health-cameroun', 'africavet')
WHERE content_html_fr LIKE '%one-health-cameroun%';

UPDATE newsletter_templates
SET content_html_fr = REPLACE(content_html_fr, 'onehealth.cm', 'africavet.com')
WHERE content_html_fr LIKE '%onehealth.cm%';

UPDATE newsletter_templates
SET content_html_fr = REPLACE(content_html_fr, 'One Health', 'AfricaVET')
WHERE content_html_fr LIKE '%One Health%';

-- Fix English content
UPDATE newsletter_templates
SET content_html_en = REPLACE(content_html_en, 'One Health Cameroun', 'AfricaVET')
WHERE content_html_en LIKE '%One Health Cameroun%';

UPDATE newsletter_templates
SET content_html_en = REPLACE(content_html_en, 'One Health Cameroon', 'AfricaVET')
WHERE content_html_en LIKE '%One Health Cameroon%';

UPDATE newsletter_templates
SET content_html_en = REPLACE(content_html_en, 'one-health-cameroon', 'africavet')
WHERE content_html_en LIKE '%one-health-cameroon%';

UPDATE newsletter_templates
SET content_html_en = REPLACE(content_html_en, 'onehealth.cm', 'africavet.com')
WHERE content_html_en LIKE '%onehealth.cm%';

UPDATE newsletter_templates
SET content_html_en = REPLACE(content_html_en, 'One Health', 'AfricaVET')
WHERE content_html_en LIKE '%One Health%';

-- Fix subjects
UPDATE newsletter_templates
SET subject_fr = REPLACE(subject_fr, 'One Health', 'AfricaVET')
WHERE subject_fr LIKE '%One Health%';

UPDATE newsletter_templates
SET subject_en = REPLACE(subject_en, 'One Health', 'AfricaVET')
WHERE subject_en LIKE '%One Health%';

-- Fix preview text
UPDATE newsletter_templates
SET preview_text_fr = REPLACE(preview_text_fr, 'One Health', 'AfricaVET')
WHERE preview_text_fr LIKE '%One Health%';

UPDATE newsletter_templates
SET preview_text_en = REPLACE(preview_text_en, 'One Health', 'AfricaVET')
WHERE preview_text_en LIKE '%One Health%';

-- =====================================================
-- 5. Update template header gradient to AfricaVET brand colors
--    Old: #27AE60 → #00BCD4 (green to cyan)
--    New: #7ac142 → #354e84 (AfricaVET green to blue)
-- =====================================================
UPDATE newsletter_templates
SET content_html_fr = REPLACE(content_html_fr, '#27AE60 0%, #00BCD4 100%', '#7ac142 0%, #354e84 100%')
WHERE content_html_fr LIKE '%#27AE60 0%, #00BCD4 100%%';

UPDATE newsletter_templates
SET content_html_en = REPLACE(content_html_en, '#27AE60 0%, #00BCD4 100%', '#7ac142 0%, #354e84 100%')
WHERE content_html_en LIKE '%#27AE60 0%, #00BCD4 100%%';

-- =====================================================
-- 6. Update template names for clarity
-- =====================================================
UPDATE newsletter_templates SET name = 'Actualités AfricaVET' WHERE slug = 'actualites-modernes';
UPDATE newsletter_templates SET name = 'Digest Hebdomadaire' WHERE slug = 'digest-classique';
UPDATE newsletter_templates SET name = 'Bulletin Santé Animale' WHERE slug = 'bulletin-sante';
UPDATE newsletter_templates SET name = 'Invitation Événement' WHERE slug = 'invitation-evenement';
UPDATE newsletter_templates SET name = 'Résumé Hebdomadaire' WHERE slug = 'resume-hebdomadaire';
UPDATE newsletter_templates SET name = 'Annonce Officielle' WHERE slug = 'annonce-officielle';
UPDATE newsletter_templates SET name = 'Mise à jour Recherche' WHERE slug = 'mise-a-jour-recherche';
UPDATE newsletter_templates SET name = 'Formation & Atelier' WHERE slug = 'formation-atelier';
UPDATE newsletter_templates SET name = 'Focus Partenaire' WHERE slug = 'focus-partenaire';
UPDATE newsletter_templates SET name = 'Success Story' WHERE slug = 'success-story';
UPDATE newsletter_templates SET name = 'Alerte Sanitaire' WHERE slug = 'bulletin-alerte';
UPDATE newsletter_templates SET name = 'Rapport Mensuel' WHERE slug = 'rapport-mensuel';
UPDATE newsletter_templates SET name = 'Nouvelles Communauté' WHERE slug = 'nouvelles-communaute';
UPDATE newsletter_templates SET name = 'Lancement Produit' WHERE slug = 'lancement-produit';
UPDATE newsletter_templates SET name = 'Minimal Élégant' WHERE slug = 'minimal-elegant';
