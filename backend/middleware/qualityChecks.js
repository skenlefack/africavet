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

  const errors = [];
  const d = req.body;

  if (!d.title_fr || !d.title_fr.trim()) errors.push('Titre (FR) requis');
  if (!d.organization_name || !d.organization_name.trim()) errors.push('Organisation requise');
  if (!d.country || !d.country.trim()) errors.push('Pays requis');
  if (!d.description_fr || !d.description_fr.trim()) errors.push('Description (FR) requise');

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

module.exports = { validateOpportunityPublish, validatePostPublish, getOpportunityCompleteness };
