-- Migration 058: Add editorial format taxonomy to posts
-- Phase 8: Editorial Format Taxonomy

ALTER TABLE posts
  ADD COLUMN editorial_format ENUM(
    'actualite',
    'analyse',
    'reportage',
    'entretien',
    'guide_pratique',
    'data_story',
    'dossier',
    'opportunite',
    'tribune',
    'synthese'
  ) DEFAULT 'actualite' AFTER review_notes;
