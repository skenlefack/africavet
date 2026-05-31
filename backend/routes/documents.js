const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { auth, authorize, requirePermission, optionalAuth } = require('../middleware/auth');

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const uploadDir = path.join(__dirname, '..', 'uploads', 'library');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-rar-compressed',
    'application/vnd.rar',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Formats acceptés : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR, images'), false);
  }
};

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueId}-${safeName}`);
  }
});

const upload = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Helper: get file type from extension
const getFileType = (filename) => {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  return ext || 'other';
};

// =====================================================
// PUBLIC ROUTES - DOCUMENTS
// =====================================================

// @route   GET /api/documents
// @desc    List published documents with filters, search, pagination
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      country,
      language,
      year,
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = ["d.status = 'published'", 'd.is_active = 1'];
    let params = [];

    if (category) {
      whereConditions.push('(dc.slug = ? OR dc.id = ?)');
      params.push(category, category);
    }

    if (country) {
      whereConditions.push('d.country_code = ?');
      params.push(country);
    }

    if (language) {
      whereConditions.push('d.language = ?');
      params.push(language);
    }

    if (year) {
      whereConditions.push('d.year_published = ?');
      params.push(parseInt(year));
    }

    if (search) {
      whereConditions.push('MATCH(d.title_fr, d.title_en, d.description_fr, d.description_en) AGAINST(? IN BOOLEAN MODE)');
      params.push(search);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Count
    const [countResult] = await db.query(
      `SELECT COUNT(DISTINCT d.id) as total FROM documents d
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Sort
    const allowedSorts = ['created_at', 'title_fr', 'download_count', 'year_published'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [documents] = await db.query(
      `SELECT d.id, d.title_fr, d.title_en, d.description_fr, d.description_en,
              d.file_type, d.file_size, d.country_code, d.language, d.year_published,
              d.author, d.tags, d.download_count, d.is_featured, d.thumbnail_path,
              d.created_at,
              dc.id as category_id, dc.name_fr as category_name_fr, dc.name_en as category_name_en,
              dc.slug as category_slug, dc.icon as category_icon, dc.color as category_color,
              u.username as uploaded_by_username
       FROM documents d
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       LEFT JOIN users u ON d.uploaded_by = u.id
       ${whereClause}
       ORDER BY d.${sortField} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/documents/featured
// @desc    Get featured documents
// @access  Public
router.get('/featured', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [documents] = await db.query(
      `SELECT d.id, d.title_fr, d.title_en, d.description_fr, d.description_en,
              d.file_type, d.file_size, d.country_code, d.language, d.year_published,
              d.author, d.download_count, d.thumbnail_path, d.created_at,
              dc.name_fr as category_name_fr, dc.name_en as category_name_en,
              dc.slug as category_slug, dc.icon as category_icon, dc.color as category_color
       FROM documents d
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       WHERE d.is_featured = 1 AND d.status = 'published' AND d.is_active = 1
       ORDER BY d.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get featured documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/documents/recent
// @desc    Get most recent documents
// @access  Public
router.get('/recent', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [documents] = await db.query(
      `SELECT d.id, d.title_fr, d.title_en, d.file_type, d.file_size,
              d.download_count, d.thumbnail_path, d.created_at,
              dc.name_fr as category_name_fr, dc.name_en as category_name_en,
              dc.slug as category_slug, dc.icon as category_icon, dc.color as category_color
       FROM documents d
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       WHERE d.status = 'published' AND d.is_active = 1
       ORDER BY d.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get recent documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/documents/stats
// @desc    Public statistics (total docs, total downloads, by category)
// @access  Public
router.get('/stats', auth, async (req, res) => {
  try {
    const [totalDocs] = await db.query(
      "SELECT COUNT(*) as total FROM documents WHERE status = 'published' AND is_active = 1"
    );

    const [totalDownloads] = await db.query(
      "SELECT COALESCE(SUM(download_count), 0) as total FROM documents WHERE status = 'published' AND is_active = 1"
    );

    const [byCategory] = await db.query(
      `SELECT dc.id, dc.name_fr, dc.name_en, dc.slug, dc.icon, dc.color,
              COUNT(d.id) as document_count
       FROM document_categories dc
       LEFT JOIN documents d ON dc.id = d.category_id AND d.status = 'published' AND d.is_active = 1
       WHERE dc.parent_id IS NULL AND dc.is_active = 1
       GROUP BY dc.id
       ORDER BY dc.sort_order`
    );

    const [byCountry] = await db.query(
      `SELECT country_code, COUNT(*) as document_count
       FROM documents
       WHERE status = 'published' AND is_active = 1 AND country_code IS NOT NULL
       GROUP BY country_code
       ORDER BY document_count DESC`
    );

    res.json({
      success: true,
      data: {
        totalDocuments: totalDocs[0].total,
        totalDownloads: totalDownloads[0].total,
        byCategory,
        byCountry
      }
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/documents/countries
// @desc    List distinct country codes with document count
// @access  Public
router.get('/countries', auth, async (req, res) => {
  try {
    const [countries] = await db.query(
      `SELECT country_code, COUNT(*) as document_count
       FROM documents
       WHERE status = 'published' AND is_active = 1 AND country_code IS NOT NULL AND country_code != ''
       GROUP BY country_code
       ORDER BY document_count DESC`
    );

    res.json({ success: true, data: countries });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/documents/categories/tree
// @desc    Get full category tree (parent + children)
// @access  Public
router.get('/categories/tree', auth, async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT id, parent_id, name_fr, name_en, slug, description_fr, description_en,
              icon, color, sort_order, is_active
       FROM document_categories
       WHERE is_active = 1
       ORDER BY sort_order, name_fr`
    );

    // Count documents per category
    const [counts] = await db.query(
      `SELECT category_id, COUNT(*) as document_count
       FROM documents
       WHERE status = 'published' AND is_active = 1
       GROUP BY category_id`
    );
    const countMap = {};
    counts.forEach(c => { countMap[c.category_id] = c.document_count; });

    // Build tree
    const roots = categories.filter(c => !c.parent_id);
    const children = categories.filter(c => c.parent_id);

    const tree = roots.map(root => ({
      ...root,
      document_count: countMap[root.id] || 0,
      children: children
        .filter(c => c.parent_id === root.id)
        .map(child => ({
          ...child,
          document_count: countMap[child.id] || 0
        }))
    }));

    // Add total to parents (sum of own + children)
    tree.forEach(root => {
      root.total_documents = root.document_count + root.children.reduce((sum, c) => sum + c.document_count, 0);
    });

    res.json({ success: true, data: tree });
  } catch (error) {
    console.error('Get category tree error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/documents/categories/:slug
// @desc    Get category by slug with its documents
// @access  Public
router.get('/categories/:slug', auth, async (req, res) => {
  try {
    const { slug } = req.params;

    const [categories] = await db.query(
      'SELECT * FROM document_categories WHERE slug = ? AND is_active = 1',
      [slug]
    );

    if (categories.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    const category = categories[0];

    // Get subcategories if parent
    const [subcategories] = await db.query(
      'SELECT * FROM document_categories WHERE parent_id = ? AND is_active = 1 ORDER BY sort_order',
      [category.id]
    );

    // Get category IDs to fetch documents (this category + subcategories)
    const categoryIds = [category.id, ...subcategories.map(s => s.id)];

    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM documents
       WHERE category_id IN (?) AND status = 'published' AND is_active = 1`,
      [categoryIds]
    );
    const total = countResult[0].total;

    const [documents] = await db.query(
      `SELECT d.id, d.title_fr, d.title_en, d.description_fr, d.description_en,
              d.file_type, d.file_size, d.country_code, d.language, d.year_published,
              d.author, d.download_count, d.thumbnail_path, d.created_at,
              dc.name_fr as category_name_fr, dc.name_en as category_name_en,
              dc.slug as category_slug
       FROM documents d
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       WHERE d.category_id IN (?) AND d.status = 'published' AND d.is_active = 1
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      [categoryIds, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: {
        category,
        subcategories,
        documents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document detail
// @access  Public
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Avoid matching sub-routes
    if (isNaN(id)) {
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }

    let whereExtra = '';
    if (!req.user || !['admin', 'editor'].includes(req.user.role)) {
      whereExtra = " AND d.status = 'published' AND d.is_active = 1";
    }

    const [documents] = await db.query(
      `SELECT d.*,
              dc.name_fr as category_name_fr, dc.name_en as category_name_en,
              dc.slug as category_slug, dc.icon as category_icon, dc.color as category_color,
              u.username as uploaded_by_username, u.first_name as uploaded_by_first_name,
              u.last_name as uploaded_by_last_name
       FROM documents d
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.id = ?${whereExtra}`,
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }

    // Get related documents (same category, excluding current)
    const doc = documents[0];
    const [related] = await db.query(
      `SELECT id, title_fr, title_en, file_type, file_size, download_count, created_at
       FROM documents
       WHERE category_id = ? AND id != ? AND status = 'published' AND is_active = 1
       ORDER BY created_at DESC
       LIMIT 5`,
      [doc.category_id, doc.id]
    );

    doc.related = related;

    res.json({ success: true, data: doc });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/documents/:id/download
// @desc    Download document file & track download
// @access  Public
router.get('/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const [documents] = await db.query(
      "SELECT * FROM documents WHERE id = ? AND status = 'published' AND is_active = 1",
      [id]
    );

    if (documents.length === 0) {
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }

    const doc = documents[0];
    const filePath = path.join(__dirname, '..', doc.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Fichier non trouvé sur le serveur' });
    }

    // Track download
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    await db.query(
      'INSERT INTO document_downloads (document_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [doc.id, req.user ? req.user.id : null, ip, userAgent]
    );

    // Increment counter
    await db.query('UPDATE documents SET download_count = download_count + 1 WHERE id = ?', [doc.id]);

    // Send file
    const downloadName = doc.file_name || `document-${doc.id}.${doc.file_type || 'pdf'}`;
    res.download(filePath, downloadName);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// ADMIN ROUTES - DOCUMENTS
// =====================================================

// @route   GET /api/documents/admin/list
// @desc    Admin list with all statuses, filters, stats
// @access  Private (admin, editor or documents_view)
router.get('/admin/list', auth, async (req, res) => {
  try {
    // Check permission
    if (!['admin', 'editor'].includes(req.user.role) && !req.user.permissions.includes('documents_view')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const {
      page = 1,
      limit = 20,
      status,
      category,
      country,
      language,
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('d.status = ?');
      params.push(status);
    }

    if (category) {
      whereConditions.push('d.category_id = ?');
      params.push(parseInt(category));
    }

    if (country) {
      whereConditions.push('d.country_code = ?');
      params.push(country);
    }

    if (language) {
      whereConditions.push('d.language = ?');
      params.push(language);
    }

    if (search) {
      whereConditions.push('(d.title_fr LIKE ? OR d.title_en LIKE ? OR d.author LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM documents d ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const allowedSorts = ['created_at', 'title_fr', 'download_count', 'year_published', 'file_size', 'status'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [documents] = await db.query(
      `SELECT d.*,
              dc.name_fr as category_name_fr, dc.name_en as category_name_en, dc.slug as category_slug,
              u.username as uploaded_by_username
       FROM documents d
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       LEFT JOIN users u ON d.uploaded_by = u.id
       ${whereClause}
       ORDER BY d.${sortField} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin list documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/documents/admin/stats
// @desc    Admin dashboard statistics
// @access  Private (admin, editor)
router.get('/admin/stats', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const [total] = await db.query('SELECT COUNT(*) as count FROM documents');
    const [published] = await db.query("SELECT COUNT(*) as count FROM documents WHERE status = 'published'");
    const [draft] = await db.query("SELECT COUNT(*) as count FROM documents WHERE status = 'draft'");
    const [archived] = await db.query("SELECT COUNT(*) as count FROM documents WHERE status = 'archived'");
    const [totalDownloads] = await db.query('SELECT COALESCE(SUM(download_count), 0) as total FROM documents');
    const [totalCategories] = await db.query('SELECT COUNT(*) as count FROM document_categories');

    // Top 10 most downloaded
    const [topDownloaded] = await db.query(
      `SELECT d.id, d.title_fr, d.title_en, d.download_count, d.file_type,
              dc.name_fr as category_name_fr
       FROM documents d
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       ORDER BY d.download_count DESC
       LIMIT 10`
    );

    // Recent downloads (last 30 days)
    const [recentDownloads] = await db.query(
      `SELECT DATE(downloaded_at) as date, COUNT(*) as count
       FROM document_downloads
       WHERE downloaded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(downloaded_at)
       ORDER BY date`
    );

    // By category
    const [byCategory] = await db.query(
      `SELECT dc.id, dc.name_fr, dc.name_en, dc.icon, dc.color,
              COUNT(d.id) as document_count,
              COALESCE(SUM(d.download_count), 0) as total_downloads
       FROM document_categories dc
       LEFT JOIN documents d ON dc.id = d.category_id
       WHERE dc.parent_id IS NULL
       GROUP BY dc.id
       ORDER BY dc.sort_order`
    );

    res.json({
      success: true,
      data: {
        total: total[0].count,
        published: published[0].count,
        draft: draft[0].count,
        archived: archived[0].count,
        totalDownloads: totalDownloads[0].total,
        totalCategories: totalCategories[0].count,
        topDownloaded,
        recentDownloads,
        byCategory
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/documents
// @desc    Create document with file upload
// @access  Private (admin, editor or documents_create)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    // Check permission
    if (!['admin', 'editor'].includes(req.user.role) && !req.user.permissions.includes('documents_create')) {
      // Delete uploaded file if permission denied
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Le fichier est requis' });
    }

    const {
      title_fr, title_en, description_fr, description_en,
      category_id, country_code, organization_id, language = 'fr',
      year_published, author, source_url, tags,
      is_featured = 0, status = 'draft'
    } = req.body;

    if (!title_fr) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Le titre en français est requis' });
    }

    if (!category_id) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'La catégorie est requise' });
    }

    const filePath = `/uploads/library/${req.file.filename}`;
    const fileType = getFileType(req.file.originalname);
    const tagsJson = tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : null;

    const [result] = await db.query(
      `INSERT INTO documents (
        title_fr, title_en, description_fr, description_en,
        file_path, file_name, file_size, file_type, mime_type,
        category_id, country_code, organization_id, language,
        year_published, author, source_url, tags,
        is_featured, status, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title_fr, title_en || null, description_fr || null, description_en || null,
        filePath, req.file.originalname, req.file.size, fileType, req.file.mimetype,
        parseInt(category_id), country_code || null, organization_id || null, language,
        year_published ? parseInt(year_published) : null, author || null, source_url || null, tagsJson,
        is_featured ? 1 : 0, status, req.user.id
      ]
    );

    const [newDoc] = await db.query('SELECT * FROM documents WHERE id = ?', [result.insertId]);

    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'create', 'document', result.insertId, JSON.stringify({ title_fr })]
      );
    } catch (logErr) { /* activity_log may not exist */ }

    res.status(201).json({ success: true, message: 'Document créé', data: newDoc[0] });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT|POST /api/documents/:id
// @desc    Update document (metadata, optionally replace file)
// @access  Private (admin, editor or documents_edit)
// Note: POST is also registered because api.upload() sends POST for multipart/form-data
const updateDocumentHandler = async (req, res) => {
  try {
    if (!['admin', 'editor'].includes(req.user.role) && !req.user.permissions.includes('documents_edit')) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (existing.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }

    const doc = existing[0];

    const {
      title_fr, title_en, description_fr, description_en,
      category_id, country_code, organization_id, language,
      year_published, author, source_url, tags,
      is_featured, status, thumbnail_path
    } = req.body;

    // If new file uploaded, update file fields and delete old file
    let fileFields = {};
    if (req.file) {
      fileFields = {
        file_path: `/uploads/library/${req.file.filename}`,
        file_name: req.file.originalname,
        file_size: req.file.size,
        file_type: getFileType(req.file.originalname),
        mime_type: req.file.mimetype
      };
      // Delete old file
      const oldPath = path.join(__dirname, '..', doc.file_path);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const tagsJson = tags !== undefined ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : undefined;

    await db.query(
      `UPDATE documents SET
        title_fr = COALESCE(?, title_fr),
        title_en = COALESCE(?, title_en),
        description_fr = COALESCE(?, description_fr),
        description_en = COALESCE(?, description_en),
        category_id = COALESCE(?, category_id),
        country_code = COALESCE(?, country_code),
        organization_id = COALESCE(?, organization_id),
        language = COALESCE(?, language),
        year_published = COALESCE(?, year_published),
        author = COALESCE(?, author),
        source_url = COALESCE(?, source_url),
        tags = COALESCE(?, tags),
        is_featured = COALESCE(?, is_featured),
        status = COALESCE(?, status),
        thumbnail_path = COALESCE(?, thumbnail_path),
        file_path = COALESCE(?, file_path),
        file_name = COALESCE(?, file_name),
        file_size = COALESCE(?, file_size),
        file_type = COALESCE(?, file_type),
        mime_type = COALESCE(?, mime_type)
      WHERE id = ?`,
      [
        title_fr || null, title_en || null, description_fr || null, description_en || null,
        category_id ? parseInt(category_id) : null, country_code || null,
        organization_id || null, language || null,
        year_published ? parseInt(year_published) : null, author || null,
        source_url || null, tagsJson !== undefined ? tagsJson : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        status || null, thumbnail_path || null,
        fileFields.file_path || null, fileFields.file_name || null,
        fileFields.file_size || null, fileFields.file_type || null, fileFields.mime_type || null,
        id
      ]
    );

    const [updated] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);

    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'update', 'document', id, JSON.stringify({ title_fr: updated[0].title_fr })]
      );
    } catch (logErr) { /* activity_log may not exist */ }

    res.json({ success: true, message: 'Document mis à jour', data: updated[0] });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
router.put('/:id', auth, upload.single('file'), updateDocumentHandler);
router.post('/:id/update', auth, upload.single('file'), updateDocumentHandler);

// @route   PUT /api/documents/:id/status
// @desc    Change document status (draft/published/archived)
// @access  Private (admin, editor or documents_edit)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (!['admin', 'editor'].includes(req.user.role) && !req.user.permissions.includes('documents_edit')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const [existing] = await db.query('SELECT id FROM documents WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }

    await db.query('UPDATE documents SET status = ? WHERE id = ?', [status, id]);

    res.json({ success: true, message: `Statut changé en "${status}"` });
  } catch (error) {
    console.error('Change status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/documents/:id/featured
// @desc    Toggle featured flag
// @access  Private (admin, editor or documents_edit)
router.put('/:id/featured', auth, async (req, res) => {
  try {
    if (!['admin', 'editor'].includes(req.user.role) && !req.user.permissions.includes('documents_edit')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { id } = req.params;

    const [existing] = await db.query('SELECT id, is_featured FROM documents WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }

    const newValue = existing[0].is_featured ? 0 : 1;
    await db.query('UPDATE documents SET is_featured = ? WHERE id = ?', [newValue, id]);

    res.json({ success: true, message: newValue ? 'Document mis en vedette' : 'Document retiré des vedettes', is_featured: newValue });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document and its file
// @access  Private (admin or documents_delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.permissions.includes('documents_delete')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Document non trouvé' });
    }

    const doc = existing[0];

    // Delete physical file
    const filePath = path.join(__dirname, '..', doc.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete thumbnail if exists
    if (doc.thumbnail_path) {
      const thumbPath = path.join(__dirname, '..', doc.thumbnail_path);
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    }

    // Delete download records
    await db.query('DELETE FROM document_downloads WHERE document_id = ?', [id]);

    // Delete document
    await db.query('DELETE FROM documents WHERE id = ?', [id]);

    // Log activity
    try {
      await db.query(
        'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'delete', 'document', id, JSON.stringify({ title_fr: doc.title_fr })]
      );
    } catch (logErr) { /* activity_log may not exist */ }

    res.json({ success: true, message: 'Document supprimé définitivement' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// ADMIN ROUTES - CATEGORIES
// =====================================================

// @route   GET /api/documents/admin/categories
// @desc    List all categories (flat, for admin)
// @access  Private (admin, editor or documents_categories_manage)
router.get('/admin/categories', auth, async (req, res) => {
  try {
    if (!['admin', 'editor'].includes(req.user.role) && !req.user.permissions.includes('documents_categories_manage')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const [categories] = await db.query(
      `SELECT dc.*,
              (SELECT COUNT(*) FROM documents d WHERE d.category_id = dc.id) as document_count,
              pc.name_fr as parent_name_fr
       FROM document_categories dc
       LEFT JOIN document_categories pc ON dc.parent_id = pc.id
       ORDER BY dc.parent_id IS NULL DESC, dc.parent_id, dc.sort_order`
    );

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Admin list categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/documents/admin/categories
// @desc    Create category
// @access  Private (admin or documents_categories_manage)
router.post('/admin/categories', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.permissions.includes('documents_categories_manage')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { name_fr, name_en, description_fr, description_en, parent_id, icon, color, sort_order } = req.body;

    if (!name_fr || !name_en) {
      return res.status(400).json({ success: false, message: 'Les noms FR et EN sont requis' });
    }

    // Generate slug
    let slug = slugify(name_fr, { lower: true, strict: true });
    const [existingSlug] = await db.query('SELECT id FROM document_categories WHERE slug = ?', [slug]);
    if (existingSlug.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    const [result] = await db.query(
      `INSERT INTO document_categories (name_fr, name_en, slug, description_fr, description_en, parent_id, icon, color, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name_fr, name_en, slug, description_fr || null, description_en || null,
       parent_id || null, icon || 'fa-folder', color || '#1B5E20', sort_order || 0]
    );

    const [newCat] = await db.query('SELECT * FROM document_categories WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Catégorie créée', data: newCat[0] });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/documents/admin/categories/:id
// @desc    Update category
// @access  Private (admin or documents_categories_manage)
router.put('/admin/categories/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.permissions.includes('documents_categories_manage')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM document_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    const { name_fr, name_en, description_fr, description_en, parent_id, icon, color, sort_order } = req.body;

    // Regenerate slug if name changed
    let slug = existing[0].slug;
    if (name_fr && name_fr !== existing[0].name_fr) {
      slug = slugify(name_fr, { lower: true, strict: true });
      const [existingSlug] = await db.query('SELECT id FROM document_categories WHERE slug = ? AND id != ?', [slug, id]);
      if (existingSlug.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Prevent setting parent to self or own child
    if (parent_id && parseInt(parent_id) === parseInt(id)) {
      return res.status(400).json({ success: false, message: 'Une catégorie ne peut pas être son propre parent' });
    }

    await db.query(
      `UPDATE document_categories SET
        name_fr = COALESCE(?, name_fr),
        name_en = COALESCE(?, name_en),
        slug = ?,
        description_fr = COALESCE(?, description_fr),
        description_en = COALESCE(?, description_en),
        parent_id = ?,
        icon = COALESCE(?, icon),
        color = COALESCE(?, color),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ?`,
      [name_fr || null, name_en || null, slug,
       description_fr || null, description_en || null,
       parent_id !== undefined ? (parent_id || null) : existing[0].parent_id,
       icon || null, color || null, sort_order !== undefined ? sort_order : null, id]
    );

    const [updated] = await db.query('SELECT * FROM document_categories WHERE id = ?', [id]);

    res.json({ success: true, message: 'Catégorie mise à jour', data: updated[0] });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/documents/admin/categories/:id
// @desc    Delete category (only if no documents)
// @access  Private (admin or documents_categories_manage)
router.delete('/admin/categories/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.permissions.includes('documents_categories_manage')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM document_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    // Check for documents
    const [docCount] = await db.query('SELECT COUNT(*) as count FROM documents WHERE category_id = ?', [id]);
    if (docCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer : ${docCount[0].count} document(s) dans cette catégorie`
      });
    }

    // Check for subcategories
    const [subCount] = await db.query('SELECT COUNT(*) as count FROM document_categories WHERE parent_id = ?', [id]);
    if (subCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer : ${subCount[0].count} sous-catégorie(s) existante(s)`
      });
    }

    await db.query('DELETE FROM document_categories WHERE id = ?', [id]);

    res.json({ success: true, message: 'Catégorie supprimée' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/documents/admin/categories/reorder
// @desc    Reorder categories (batch update sort_order)
// @access  Private (admin or documents_categories_manage)
router.put('/admin/categories/reorder', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.permissions.includes('documents_categories_manage')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { orders } = req.body; // Array of { id, sort_order }

    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: 'Format invalide' });
    }

    for (const item of orders) {
      await db.query('UPDATE document_categories SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
    }

    res.json({ success: true, message: 'Ordre mis à jour' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/documents/admin/categories/:id/toggle
// @desc    Toggle category active status
// @access  Private (admin or documents_categories_manage)
router.put('/admin/categories/:id/toggle', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !req.user.permissions.includes('documents_categories_manage')) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { id } = req.params;

    const [existing] = await db.query('SELECT id, is_active FROM document_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Catégorie non trouvée' });
    }

    const newValue = existing[0].is_active ? 0 : 1;
    await db.query('UPDATE document_categories SET is_active = ? WHERE id = ?', [newValue, id]);

    res.json({ success: true, message: newValue ? 'Catégorie activée' : 'Catégorie désactivée', is_active: newValue });
  } catch (error) {
    console.error('Toggle category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// MULTER ERROR HANDLING
// =====================================================
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Fichier trop volumineux (max 50 Mo)' });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next();
});

module.exports = router;
