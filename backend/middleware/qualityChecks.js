/**
 * Pre-publication Quality Checks
 * Validates content before allowing status='published'
 */

/**
 * Validate opportunity before publication
 */
function validateOpportunityPublish(req, res, next) {
  // Only check when publishing
  if (req.body.status !== 'published') return next();

  // For updates (PUT), skip validation of fields not present in body
  // because they're already stored in the database
  const isUpdate = req.method === 'PUT' && req.params.id;

  const errors = [];
  const d = req.body;

  if (d.title_fr !== undefined && !d.title_fr?.trim()) errors.push('Titre (FR) requis');
  else if (!isUpdate && !d.title_fr?.trim()) errors.push('Titre (FR) requis');

  if (d.organization_name !== undefined && !d.organization_name?.trim()) errors.push('Organisation requise');
  else if (!isUpdate && !d.organization_name?.trim()) errors.push('Organisation requise');

  if (d.country !== undefined && !d.country?.trim()) errors.push('Pays requis');
  else if (!isUpdate && !d.country?.trim()) errors.push('Pays requis');

  if (d.description_fr !== undefined && !d.description_fr?.trim()) errors.push('Description (FR) requise');
  else if (!isUpdate && !d.description_fr?.trim()) errors.push('Description (FR) requise');

  // Job-specific
  if (d.opportunity_type === 'job') {
    if (!d.deadline && d.offer_status !== 'continuous') errors.push('Date limite requise (ou statut "candidatures continues")');
  }

  // Tender-specific
  if (d.opportunity_type === 'tender') {
    if (!d.tender_reference) errors.push('Référence appel d\'offres requise');
    if (!d.deadline) errors.push('Date limite requise');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Contrôle qualité : informations manquantes avant publication',
      errors
    });
  }

  next();
}

/**
 * Validate post before publication
 */
function validatePostPublish(req, res, next) {
  if (req.body.status !== 'published') return next();

  const errors = [];
  const d = req.body;

  const titleFr = d.title_fr || d.title;
  if (!titleFr || !titleFr.trim()) errors.push('Titre requis');

  const contentFr = d.content_fr || d.content;
  if (!contentFr || !contentFr.trim()) errors.push('Contenu requis');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Contrôle qualité : informations manquantes avant publication',
      errors
    });
  }

  next();
}

/**
 * Calculate completeness score for an opportunity (0-100)
 */
function getOpportunityCompleteness(opp) {
  const checks = [
    { field: 'title_fr', weight: 15, label: 'Titre FR' },
    { field: 'title_en', weight: 5, label: 'Titre EN' },
    { field: 'description_fr', weight: 15, label: 'Description FR' },
    { field: 'organization_name', weight: 10, label: 'Organisation' },
    { field: 'country', weight: 10, label: 'Pays' },
    { field: 'deadline', weight: 10, label: 'Date limite' },
    { field: 'contact_email', weight: 5, label: 'Email contact' },
    { field: 'application_url', weight: 10, label: 'Lien candidature' },
    { field: 'source_url', weight: 5, label: 'Lien source' },
    { field: 'tender_reference', weight: 5, label: 'Référence' },
    { field: 'experience_required', weight: 5, label: 'Expérience' },
    { field: 'education_required', weight: 5, label: 'Formation' },
  ];

  let score = 0;
  const missing = [];

  for (const check of checks) {
    const val = opp[check.field];
    if (val && String(val).trim()) {
      score += check.weight;
    } else {
      missing.push(check.label);
    }
  }

  return { score, missing };
}

/**
 * Calculate completeness score for a post (0-100)
 * 10 criteria, 10 points each
 */
function getPostCompleteness(post) {
  let score = 0;
  const details = [];

  // 1. Title FR present
  const titleFr = post.title_fr || post.title || '';
  if (titleFr.trim()) { score += 10; details.push({ label: 'Titre FR', ok: true }); }
  else { details.push({ label: 'Titre FR', ok: false }); }

  // 2. Description/content present
  const contentFr = post.content_fr || post.content || '';
  if (contentFr.trim()) { score += 10; details.push({ label: 'Contenu', ok: true }); }
  else { details.push({ label: 'Contenu', ok: false }); }

  // 3. Country or region set
  if ((post.country && post.country.trim()) || (post.region && post.region.trim())) {
    score += 10; details.push({ label: 'Pays/Region', ok: true });
  } else { details.push({ label: 'Pays/Region', ok: false }); }

  // 4. Content language set
  if (post.content_language) { score += 10; details.push({ label: 'Langue', ok: true }); }
  else { details.push({ label: 'Langue', ok: false }); }

  // 5. Meta title 50-60 chars
  const metaTitle = post.meta_title_fr || post.meta_title || '';
  if (metaTitle.length >= 50 && metaTitle.length <= 60) {
    score += 10; details.push({ label: 'Meta title 50-60 car.', ok: true });
  } else { details.push({ label: 'Meta title 50-60 car.', ok: false }); }

  // 6. Meta description 140-160 chars
  const metaDesc = post.meta_description_fr || post.meta_description || '';
  if (metaDesc.length >= 140 && metaDesc.length <= 160) {
    score += 10; details.push({ label: 'Meta description 140-160 car.', ok: true });
  } else { details.push({ label: 'Meta description 140-160 car.', ok: false }); }

  // 7. Sources present
  const sources = post.sources;
  const hasSources = sources && ((typeof sources === 'string' && sources.trim()) || (Array.isArray(sources) && sources.length > 0));
  if (hasSources) { score += 10; details.push({ label: 'Sources', ok: true }); }
  else { details.push({ label: 'Sources', ok: false }); }

  // 8. Image credit (if image exists)
  if (!post.featured_image || !post.featured_image.trim()) {
    score += 10; details.push({ label: 'Credit image (sans image)', ok: true });
  } else if (post.image_credit && post.image_credit.trim()) {
    score += 10; details.push({ label: 'Credit image', ok: true });
  } else { details.push({ label: 'Credit image', ok: false }); }

  // 9. Category assigned
  const hasCat = (post.category_ids && post.category_ids.length > 0) || post.category_id;
  if (hasCat) { score += 10; details.push({ label: 'Categorie', ok: true }); }
  else { details.push({ label: 'Categorie', ok: false }); }

  // 10. Content >= 500 words
  const plainText = (contentFr || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  if (wordCount >= 500) { score += 10; details.push({ label: '500+ mots', ok: true }); }
  else { details.push({ label: '500+ mots (' + wordCount + ')', ok: false }); }

  return { score, details, wordCount };
}

module.exports = { validateOpportunityPublish, validatePostPublish, getOpportunityCompleteness, getPostCompleteness };
