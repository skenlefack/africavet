-- Migration 040: Cleanup legacy WordPress categories
-- Mark obsolete WP-era categories as inactive

-- These slugs come from the old WordPress menu that mixed formats, subjects, and audiences
-- They are replaced by the new taxonomy_type-based system (migration 036)

UPDATE categories SET status = 'inactive'
WHERE slug IN (
  'blog',
  'news',
  'health',
  'vets',
  'sujets',
  'jobs',
  'call-grants',
  'markets-procurement',
  'revues',
  'mpox',
  'outils',
  'publications',
  'bourses'
) AND taxonomy_type = 'subject';

-- Keep the main thematic categories active:
-- elevage, peches, faune, one-health, sante-animale, antibioresistance
-- These are properly integrated into the new taxonomy system
