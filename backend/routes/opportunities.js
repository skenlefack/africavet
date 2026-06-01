/**
 * Opportunities API Routes
 * Jobs, Tenders, and Market opportunities for veterinary professionals
 */

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth: authenticate, optionalAuth, authorize } = require('../middleware/auth');
const isAdmin = authorize(['admin']);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/opportunities';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});

// =========================================
// PUBLIC ROUTES
// =========================================

/**
 * GET /api/opportunities
 * List all published opportunities with filters
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      type,           // job, tender, market
      status,         // draft, pending, published, closed, cancelled
      category,       // category slug
      country,
      region,
      remote,         // 1 or 0
      featured,       // 1 or 0
      urgent,         // 1 or 0
      search,
      job_type,       // full_time, part_time, etc.
      page = 1,
      limit = 12,
      sort = 'newest'
    } = req.query;

    // If admin query (has auth token and admin/editor role), show all statuses
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'editor');
    const statusFilter = isAdmin && !req.query.public ? '1=1' : "o.status = 'published'";

    let query = `
      SELECT o.*,
        org.name as org_name,
        org.logo as org_logo
      FROM opportunities o
      LEFT JOIN organizations org ON o.organization_id = org.id
      WHERE ${statusFilter}
    `;

    const params = [];

    // Status filter (admin only)
    if (isAdmin && status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    // Type filter
    if (type) {
      query += ' AND o.opportunity_type = ?';
      params.push(type);
    }

    // Location filters
    if (country) {
      query += ' AND o.country = ?';
      params.push(country);
    }
    if (region) {
      query += ' AND o.region = ?';
      params.push(region);
    }
    if (remote === '1') {
      query += ' AND o.is_remote = 1';
    }

    // Featured/Urgent filters
    if (featured === '1') {
      query += ' AND o.is_featured = 1';
    }
    if (urgent === '1') {
      query += ' AND o.is_urgent = 1';
    }

    // Job type filter
    if (job_type) {
      query += ' AND o.job_type = ?';
      params.push(job_type);
    }

    // Search
    if (search) {
      query += ` AND (
        o.title_fr LIKE ? OR o.title_en LIKE ?
        OR o.description_fr LIKE ? OR o.description_en LIKE ?
        OR o.organization_name LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Deadline not passed (only for public view)
    if (!isAdmin) {
      query += ' AND (o.deadline IS NULL OR o.deadline >= NOW())';
    }

    // Sorting
    switch (sort) {
      case 'deadline':
        query += ' ORDER BY o.deadline ASC';
        break;
      case 'salary_high':
        query += ' ORDER BY o.salary_max DESC';
        break;
      case 'popular':
        query += ' ORDER BY o.views_count DESC';
        break;
      case 'oldest':
        query += ' ORDER BY o.created_at ASC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY o.is_featured DESC, o.is_urgent DESC, o.created_at DESC';
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [opportunities] = await db.query(query, params);

    // Get total count - build same WHERE conditions
    let countQuery = `SELECT COUNT(*) as total FROM opportunities o WHERE ${statusFilter}`;
    const countParams = [];
    if (isAdmin && status) { countQuery += ' AND o.status = ?'; countParams.push(status); }
    if (!isAdmin) { countQuery += ' AND (o.deadline IS NULL OR o.deadline >= NOW())'; }
    if (type) { countQuery += ' AND o.opportunity_type = ?'; countParams.push(type); }
    if (country) { countQuery += ' AND o.country = ?'; countParams.push(country); }
    if (search) { countQuery += ' AND (o.title_fr LIKE ? OR o.title_en LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: opportunities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/opportunities/categories
 * Get all opportunity categories
 */
router.get('/categories', optionalAuth, async (req, res) => {
  try {
    const { type } = req.query;

    let query = `
      SELECT * FROM opportunity_categories
      WHERE is_active = 1
    `;
    const params = [];

    if (type) {
      query += ` AND (opportunity_type = ? OR opportunity_type = 'all')`;
      params.push(type);
    }

    query += ' ORDER BY display_order ASC';

    const [categories] = await db.query(query, params);

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/opportunities/stats
 * Get opportunity statistics
 */
router.get('/stats', optionalAuth, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT
        opportunity_type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' AND (deadline IS NULL OR deadline >= NOW()) THEN 1 ELSE 0 END) as active
      FROM opportunities
      GROUP BY opportunity_type
    `);

    const [totals] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' AND (deadline IS NULL OR deadline >= NOW()) THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured,
        SUM(CASE WHEN is_urgent = 1 THEN 1 ELSE 0 END) as urgent,
        SUM(applications_count) as total_applications
      FROM opportunities
    `);

    const [recentApplications] = await db.query(`
      SELECT COUNT(*) as count
      FROM opportunity_applications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    res.json({
      success: true,
      data: {
        by_type: stats,
        totals: totals[0],
        recent_applications: recentApplications[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/opportunities/:id
 * Get single opportunity detail
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get opportunity
    const [opportunities] = await db.query(`
      SELECT o.*,
        org.name as org_name,
        org.logo as org_logo,
        org.website as org_website
      FROM opportunities o
      LEFT JOIN organizations org ON o.organization_id = org.id
      WHERE o.id = ? AND (o.status = 'published' OR o.submitted_by = ?)
    `, [id, req.user?.id || 0]);

    if (opportunities.length === 0) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    const opportunity = opportunities[0];

    // Get categories
    const [categories] = await db.query(`
      SELECT oc.* FROM opportunity_categories oc
      JOIN opportunity_category_links ocl ON oc.id = ocl.category_id
      WHERE ocl.opportunity_id = ?
    `, [id]);

    opportunity.categories = categories;

    // Increment view count
    await db.query('UPDATE opportunities SET views_count = views_count + 1 WHERE id = ?', [id]);

    res.json({ success: true, data: opportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/opportunities
 * Create a new opportunity (requires authentication)
 */
router.post('/', authenticate, upload.single('logo'), async (req, res) => {
  try {
    const {
      opportunity_type,
      title_fr,
      title_en,
      description_fr,
      description_en,
      organization_name,
      contact_name,
      contact_email,
      contact_phone,
      website_url,
      country,
      region,
      city,
      address,
      is_remote,
      job_type,
      experience_required,
      education_required,
      salary_min,
      salary_max,
      salary_currency,
      salary_period,
      skills_required,
      benefits,
      tender_reference,
      tender_type,
      budget_min,
      budget_max,
      budget_currency,
      submission_method,
      eligibility_criteria,
      required_documents,
      market_category,
      quantity,
      unit_price,
      start_date,
      deadline,
      categories,
      tags,
      attachments
    } = req.body;

    // Validate required fields
    if (!opportunity_type || !title_fr) {
      return res.status(400).json({
        success: false,
        message: 'opportunity_type and title_fr are required'
      });
    }

    const organization_logo = req.file ? `/uploads/opportunities/${req.file.filename}` : null;

    // Insert opportunity
    const [result] = await db.query(`
      INSERT INTO opportunities (
        opportunity_type, title_fr, title_en, description_fr, description_en,
        organization_name, organization_logo, contact_name, contact_email, contact_phone, website_url,
        country, region, city, address, is_remote,
        job_type, experience_required, education_required, salary_min, salary_max, salary_currency, salary_period,
        skills_required, benefits,
        tender_reference, tender_type, budget_min, budget_max, budget_currency,
        submission_method, eligibility_criteria, required_documents,
        market_category, quantity, unit_price,
        start_date, deadline,
        tags, attachments, submitted_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      opportunity_type, title_fr, title_en || null, description_fr || null, description_en || null,
      organization_name || null, organization_logo, contact_name || null, contact_email || null, contact_phone || null, website_url || null,
      country || 'Cameroun', region || null, city || null, address || null, is_remote ? 1 : 0,
      job_type || null, experience_required || null, education_required || null, salary_min || null, salary_max || null, salary_currency || 'XAF', salary_period || 'month',
      skills_required ? JSON.stringify(skills_required) : null, benefits ? JSON.stringify(benefits) : null,
      tender_reference || null, tender_type || null, budget_min || null, budget_max || null, budget_currency || 'XAF',
      submission_method || null, eligibility_criteria || null, required_documents ? JSON.stringify(required_documents) : null,
      market_category || null, quantity || null, unit_price || null,
      start_date || null, deadline || null,
      tags ? JSON.stringify(tags) : null, attachments || null, req.user.id
    ]);

    const opportunityId = result.insertId;

    // Link categories
    if (categories && Array.isArray(categories)) {
      for (const categoryId of categories) {
        await db.query(
          'INSERT INTO opportunity_category_links (opportunity_id, category_id) VALUES (?, ?)',
          [opportunityId, categoryId]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Opportunity submitted successfully',
      data: { id: opportunityId }
    });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/opportunities/:id/apply
 * Apply to an opportunity
 */
router.post('/:id/apply', optionalAuth, upload.single('cv'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      applicant_name,
      applicant_email,
      applicant_phone,
      cover_letter,
      motivation_letter,
      experience_years,
      current_position,
      current_organization,
      availability_date,
      salary_expectation,
      notes
    } = req.body;

    // Check if opportunity exists and is open
    const [opportunities] = await db.query(
      'SELECT * FROM opportunities WHERE id = ? AND status = "published"',
      [id]
    );

    if (opportunities.length === 0) {
      return res.status(404).json({ success: false, message: 'Opportunity not found or closed' });
    }

    const opportunity = opportunities[0];

    // Check deadline
    if (opportunity.deadline && new Date(opportunity.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    // Check for duplicate application
    const [existing] = await db.query(
      'SELECT id FROM opportunity_applications WHERE opportunity_id = ? AND applicant_email = ?',
      [id, applicant_email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already applied to this opportunity' });
    }

    const cv_file = req.file ? `/uploads/opportunities/${req.file.filename}` : null;

    // Create application
    const [result] = await db.query(`
      INSERT INTO opportunity_applications (
        opportunity_id, user_id, applicant_name, applicant_email, applicant_phone,
        cv_file, cover_letter, motivation_letter,
        experience_years, current_position, current_organization,
        availability_date, salary_expectation, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, req.user?.id || null, applicant_name, applicant_email, applicant_phone || null,
      cv_file, cover_letter || null, motivation_letter || null,
      experience_years || null, current_position || null, current_organization || null,
      availability_date || null, salary_expectation || null, notes || null
    ]);

    // Update application count
    await db.query(
      'UPDATE opportunities SET applications_count = applications_count + 1 WHERE id = ?',
      [id]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =========================================
// ADMIN ROUTES
// =========================================

/**
 * GET /api/opportunities/admin/pending
 * Get pending opportunities for review
 */
router.get('/admin/pending', authenticate, isAdmin, async (req, res) => {
  try {
    const [opportunities] = await db.query(`
      SELECT o.*, u.name as submitter_name, u.email as submitter_email
      FROM opportunities o
      LEFT JOIN users u ON o.submitted_by = u.id
      WHERE o.status = 'pending'
      ORDER BY o.created_at DESC
    `);

    res.json({ success: true, data: opportunities });
  } catch (error) {
    console.error('Error fetching pending opportunities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/opportunities/:id/approve
 * Approve an opportunity
 */
router.put('/:id/approve', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`
      UPDATE opportunities
      SET status = 'published', approved_by = ?, approved_at = NOW()
      WHERE id = ?
    `, [req.user.id, id]);

    res.json({ success: true, message: 'Opportunity approved' });

    // Trigger matching asynchronously
    setImmediate(async () => {
      try {
        const { processOpportunityMatches } = require('../services/opportunityMatchingService');
        const result = await processOpportunityMatches(req.params.id);
        console.log(`Opportunity ${req.params.id} matching: ${result.matchesFound} matches, ${result.notificationsSent} notifications, ${result.emailsSent} emails`);
      } catch (err) {
        console.error('Opportunity matching error:', err);
      }
    });
  } catch (error) {
    console.error('Error approving opportunity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/opportunities/:id/reject
 * Reject an opportunity
 */
router.put('/:id/reject', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await db.query(`
      UPDATE opportunities
      SET status = 'cancelled', rejection_reason = ?
      WHERE id = ?
    `, [reason || null, id]);

    res.json({ success: true, message: 'Opportunity rejected' });
  } catch (error) {
    console.error('Error rejecting opportunity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/opportunities/:id
 * Update an opportunity
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership or admin
    const [opportunities] = await db.query(
      'SELECT submitted_by FROM opportunities WHERE id = ?',
      [id]
    );

    if (opportunities.length === 0) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    if (opportunities[0].submitted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const allowedFields = [
      'title_fr', 'title_en', 'description_fr', 'description_en',
      'organization_name', 'contact_name', 'contact_email', 'contact_phone',
      'country', 'region', 'city', 'address', 'is_remote',
      'job_type', 'experience_required', 'salary_min', 'salary_max',
      'deadline', 'is_featured', 'is_urgent', 'status', 'attachments'
    ];

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);

    await db.query(
      `UPDATE opportunities SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: 'Opportunity updated' });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * DELETE /api/opportunities/:id
 * Delete an opportunity
 */
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM opportunities WHERE id = ?', [id]);

    res.json({ success: true, message: 'Opportunity deleted' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/opportunities/:id/applications
 * Get applications for an opportunity (owner/admin only)
 */
router.get('/:id/applications', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership or admin
    const [opportunities] = await db.query(
      'SELECT submitted_by FROM opportunities WHERE id = ?',
      [id]
    );

    if (opportunities.length === 0) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    if (opportunities[0].submitted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const [applications] = await db.query(`
      SELECT oa.*, u.name as user_name, u.email as user_email
      FROM opportunity_applications oa
      LEFT JOIN users u ON oa.user_id = u.id
      WHERE oa.opportunity_id = ?
      ORDER BY oa.created_at DESC
    `, [id]);

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
