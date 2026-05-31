const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize, requirePermission } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// =====================================================
// MULTER CONFIGURATION FOR FILE UPLOADS
// =====================================================

// Ensure upload directories exist
const uploadDirs = [
  'uploads/experts',
  'uploads/organizations',
  'uploads/materials',
  'uploads/documents',
  'uploads/documents/files',
  'uploads/thumbnails'
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

// File filter for documents (PDF, video, office files)
const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

// Storage for expert photos
const expertPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'experts'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

// Storage for expert CVs
const expertCvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'documents'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `cv-${uniqueId}-${safeName}`);
  }
});

// Storage for material images
const materialImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'materials'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

// Storage for organization logos
const organizationLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'organizations'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

// Storage for document files
const documentFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'documents', 'files'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueId}-${safeName}`);
  }
});

// Storage for document thumbnails
const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'thumbnails'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  }
});

// Multer instances
const uploadExpertFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'photo') {
        cb(null, path.join(__dirname, '..', 'uploads', 'experts'));
      } else if (file.fieldname === 'cv') {
        cb(null, path.join(__dirname, '..', 'uploads', 'documents'));
      } else {
        cb(null, path.join(__dirname, '..', 'uploads'));
      }
    },
    filename: (req, file, cb) => {
      const uniqueId = uuidv4();
      const ext = path.extname(file.originalname).toLowerCase();
      if (file.fieldname === 'cv') {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `cv-${uniqueId}-${safeName}`);
      } else {
        cb(null, `${uniqueId}${ext}`);
      }
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      imageFilter(req, file, cb);
    } else if (file.fieldname === 'cv') {
      documentFilter(req, file, cb);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'cv', maxCount: 1 }
]);

const uploadMaterialImage = multer({
  storage: materialImageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
}).single('image');

const uploadOrganizationLogo = multer({
  storage: organizationLogoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
}).single('logo');

const uploadDocumentFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'file') {
        cb(null, path.join(__dirname, '..', 'uploads', 'documents', 'files'));
      } else if (file.fieldname === 'thumbnail') {
        cb(null, path.join(__dirname, '..', 'uploads', 'thumbnails'));
      } else {
        cb(null, path.join(__dirname, '..', 'uploads'));
      }
    },
    filename: (req, file, cb) => {
      const uniqueId = uuidv4();
      const ext = path.extname(file.originalname).toLowerCase();
      if (file.fieldname === 'file') {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${uniqueId}-${safeName}`);
      } else {
        cb(null, `${uniqueId}${ext}`);
      }
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      imageFilter(req, file, cb);
    } else if (file.fieldname === 'file') {
      documentFilter(req, file, cb);
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max for documents/videos
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// =====================================================
// OHWR-MAPPING API ROUTES
// =====================================================

// =====================================================
// AFRICAN COUNTRIES REFERENCE DATA (54 sovereign states)
// =====================================================
const AFRICAN_COUNTRIES = [
  { code2: 'DZ', code3: 'DZA', nom_fr: 'Algérie', nom_en: 'Algeria' },
  { code2: 'AO', code3: 'AGO', nom_fr: 'Angola', nom_en: 'Angola' },
  { code2: 'BJ', code3: 'BEN', nom_fr: 'Bénin', nom_en: 'Benin' },
  { code2: 'BW', code3: 'BWA', nom_fr: 'Botswana', nom_en: 'Botswana' },
  { code2: 'BF', code3: 'BFA', nom_fr: 'Burkina Faso', nom_en: 'Burkina Faso' },
  { code2: 'BI', code3: 'BDI', nom_fr: 'Burundi', nom_en: 'Burundi' },
  { code2: 'CV', code3: 'CPV', nom_fr: 'Cabo Verde', nom_en: 'Cabo Verde' },
  { code2: 'CM', code3: 'CMR', nom_fr: 'Cameroun', nom_en: 'Cameroon' },
  { code2: 'CF', code3: 'CAF', nom_fr: 'République centrafricaine', nom_en: 'Central African Republic' },
  { code2: 'TD', code3: 'TCD', nom_fr: 'Tchad', nom_en: 'Chad' },
  { code2: 'KM', code3: 'COM', nom_fr: 'Comores', nom_en: 'Comoros' },
  { code2: 'CG', code3: 'COG', nom_fr: 'Congo', nom_en: 'Congo' },
  { code2: 'CD', code3: 'COD', nom_fr: 'RD Congo', nom_en: 'DR Congo' },
  { code2: 'CI', code3: 'CIV', nom_fr: "Côte d'Ivoire", nom_en: "Côte d'Ivoire" },
  { code2: 'DJ', code3: 'DJI', nom_fr: 'Djibouti', nom_en: 'Djibouti' },
  { code2: 'EG', code3: 'EGY', nom_fr: 'Égypte', nom_en: 'Egypt' },
  { code2: 'GQ', code3: 'GNQ', nom_fr: 'Guinée équatoriale', nom_en: 'Equatorial Guinea' },
  { code2: 'ER', code3: 'ERI', nom_fr: 'Érythrée', nom_en: 'Eritrea' },
  { code2: 'SZ', code3: 'SWZ', nom_fr: 'Eswatini', nom_en: 'Eswatini' },
  { code2: 'ET', code3: 'ETH', nom_fr: 'Éthiopie', nom_en: 'Ethiopia' },
  { code2: 'GA', code3: 'GAB', nom_fr: 'Gabon', nom_en: 'Gabon' },
  { code2: 'GM', code3: 'GMB', nom_fr: 'Gambie', nom_en: 'Gambia' },
  { code2: 'GH', code3: 'GHA', nom_fr: 'Ghana', nom_en: 'Ghana' },
  { code2: 'GN', code3: 'GIN', nom_fr: 'Guinée', nom_en: 'Guinea' },
  { code2: 'GW', code3: 'GNB', nom_fr: 'Guinée-Bissau', nom_en: 'Guinea-Bissau' },
  { code2: 'KE', code3: 'KEN', nom_fr: 'Kenya', nom_en: 'Kenya' },
  { code2: 'LS', code3: 'LSO', nom_fr: 'Lesotho', nom_en: 'Lesotho' },
  { code2: 'LR', code3: 'LBR', nom_fr: 'Libéria', nom_en: 'Liberia' },
  { code2: 'LY', code3: 'LBY', nom_fr: 'Libye', nom_en: 'Libya' },
  { code2: 'MG', code3: 'MDG', nom_fr: 'Madagascar', nom_en: 'Madagascar' },
  { code2: 'MW', code3: 'MWI', nom_fr: 'Malawi', nom_en: 'Malawi' },
  { code2: 'ML', code3: 'MLI', nom_fr: 'Mali', nom_en: 'Mali' },
  { code2: 'MR', code3: 'MRT', nom_fr: 'Mauritanie', nom_en: 'Mauritania' },
  { code2: 'MU', code3: 'MUS', nom_fr: 'Maurice', nom_en: 'Mauritius' },
  { code2: 'MA', code3: 'MAR', nom_fr: 'Maroc', nom_en: 'Morocco' },
  { code2: 'MZ', code3: 'MOZ', nom_fr: 'Mozambique', nom_en: 'Mozambique' },
  { code2: 'NA', code3: 'NAM', nom_fr: 'Namibie', nom_en: 'Namibia' },
  { code2: 'NE', code3: 'NER', nom_fr: 'Niger', nom_en: 'Niger' },
  { code2: 'NG', code3: 'NGA', nom_fr: 'Nigéria', nom_en: 'Nigeria' },
  { code2: 'RW', code3: 'RWA', nom_fr: 'Rwanda', nom_en: 'Rwanda' },
  { code2: 'ST', code3: 'STP', nom_fr: 'São Tomé-et-Príncipe', nom_en: 'São Tomé and Príncipe' },
  { code2: 'SN', code3: 'SEN', nom_fr: 'Sénégal', nom_en: 'Senegal' },
  { code2: 'SC', code3: 'SYC', nom_fr: 'Seychelles', nom_en: 'Seychelles' },
  { code2: 'SL', code3: 'SLE', nom_fr: 'Sierra Leone', nom_en: 'Sierra Leone' },
  { code2: 'SO', code3: 'SOM', nom_fr: 'Somalie', nom_en: 'Somalia' },
  { code2: 'ZA', code3: 'ZAF', nom_fr: 'Afrique du Sud', nom_en: 'South Africa' },
  { code2: 'SS', code3: 'SSD', nom_fr: 'Soudan du Sud', nom_en: 'South Sudan' },
  { code2: 'SD', code3: 'SDN', nom_fr: 'Soudan', nom_en: 'Sudan' },
  { code2: 'TZ', code3: 'TZA', nom_fr: 'Tanzanie', nom_en: 'Tanzania' },
  { code2: 'TG', code3: 'TGO', nom_fr: 'Togo', nom_en: 'Togo' },
  { code2: 'TN', code3: 'TUN', nom_fr: 'Tunisie', nom_en: 'Tunisia' },
  { code2: 'UG', code3: 'UGA', nom_fr: 'Ouganda', nom_en: 'Uganda' },
  { code2: 'ZM', code3: 'ZMB', nom_fr: 'Zambie', nom_en: 'Zambia' },
  { code2: 'ZW', code3: 'ZWE', nom_fr: 'Zimbabwe', nom_en: 'Zimbabwe' },
];

// =====================================================
// UNIFIED SEARCH / LIST ENDPOINT
// =====================================================

// GET / - Unified search across experts, organizations, etc.
// Supports: type, search/q, country, country_code, city, species, services,
//           status, emergency, speciality, organization_type, sort, page, limit
router.get('/', auth, async (req, res) => {
  try {
    const {
      type, search, q, country, country_code, city,
      species, services, status, emergency,
      speciality, specialization, organization_type,
      sort = 'name', page = 1, limit = 20
    } = req.query;

    const searchTerm = search || q || '';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const requestedType = type || '';

    let allResults = [];
    let totalCount = 0;

    // --- EXPERTS ---
    if (!requestedType || requestedType === 'expert' || requestedType === 'all') {
      let expertQuery = `
        SELECT h.id, 'expert' as type, CONCAT(h.first_name, ' ', h.last_name) as name,
               h.title, h.category, h.specialization, h.email, h.phone,
               h.photo, h.biography as bio, h.city, h.country, h.country_code,
               h.region, h.years_experience, h.expertise_summary,
               h.show_email, h.show_phone, h.is_verified,
               h.expertise_domains as skills, h.submission_status,
               h.created_at, h.updated_at,
               o.name as organization_name, o.acronym as organization_acronym
        FROM human_resources h
        LEFT JOIN organizations o ON h.organization_id = o.id
        WHERE h.is_active = 1
      `;
      const expertParams = [];

      if (searchTerm) {
        expertQuery += ` AND (h.first_name LIKE ? OR h.last_name LIKE ? OR h.title LIKE ?
                          OR h.biography LIKE ? OR h.expertise_summary LIKE ? OR h.city LIKE ?)`;
        const st = `%${searchTerm}%`;
        expertParams.push(st, st, st, st, st, st);
      }
      if (country) {
        expertQuery += ' AND (h.country = ? OR h.region = ?)';
        expertParams.push(country, country);
      }
      if (country_code) {
        expertQuery += ' AND h.country_code = ?';
        expertParams.push(country_code);
      }
      if (city) {
        expertQuery += ' AND h.city LIKE ?';
        expertParams.push(`%${city}%`);
      }
      if (status) {
        expertQuery += ' AND h.submission_status = ?';
        expertParams.push(status);
      }
      if (speciality || specialization) {
        const spec = speciality || specialization;
        expertQuery += ' AND (h.category LIKE ? OR h.specialization LIKE ? OR h.title LIKE ?)';
        expertParams.push(`%${spec}%`, `%${spec}%`, `%${spec}%`);
      }

      // Count
      const expertCountQuery = expertQuery.replace(/SELECT[\s\S]*?FROM human_resources/, 'SELECT COUNT(*) as total FROM human_resources');
      const [[{ total: expertTotal }]] = await db.query(expertCountQuery, expertParams);

      // Only fetch if we're doing a unified query or specifically asking for experts
      if (!requestedType || requestedType === 'all') {
        totalCount += expertTotal;
      } else {
        totalCount = expertTotal;
      }

      // Sort
      if (sort === 'name') expertQuery += ' ORDER BY h.last_name, h.first_name';
      else if (sort === 'date' || sort === 'date_creation') expertQuery += ' ORDER BY h.created_at DESC';
      else if (sort === 'country' || sort === 'pays') expertQuery += ' ORDER BY h.country, h.last_name';
      else expertQuery += ' ORDER BY h.last_name, h.first_name';

      if (requestedType === 'expert') {
        expertQuery += ' LIMIT ? OFFSET ?';
        expertParams.push(parseInt(limit), offset);
      }

      const [experts] = await db.query(expertQuery, expertParams);
      allResults = allResults.concat(experts);
    }

    // --- ORGANIZATIONS ---
    if (!requestedType || requestedType === 'organization' || requestedType === 'all') {
      let orgQuery = `
        SELECT o.id, 'organization' as type, o.name, o.acronym,
               o.type as organization_type, o.description, o.mission,
               o.logo, o.website, o.city, o.country, o.country_code,
               o.region, o.address, o.contact_email as email,
               o.contact_phone as phone, o.whatsapp,
               o.services, o.species_treated as species,
               o.emergency_available, o.available_24_7,
               o.opening_hours as hours, o.languages_spoken as languages,
               o.license_number, o.coverage_area,
               o.founded_year, o.staff_count, o.veterinarians_count,
               o.rating, o.reviews_count, o.show_email, o.show_phone,
               o.submission_status, o.specialties,
               o.created_at, o.updated_at
        FROM organizations o
        WHERE o.is_active = 1
      `;
      const orgParams = [];

      if (searchTerm) {
        orgQuery += ` AND (o.name LIKE ? OR o.acronym LIKE ? OR o.description LIKE ? OR o.city LIKE ?)`;
        const st = `%${searchTerm}%`;
        orgParams.push(st, st, st, st);
      }
      if (country) {
        orgQuery += ' AND (o.country = ? OR o.region = ?)';
        orgParams.push(country, country);
      }
      if (country_code) {
        orgQuery += ' AND o.country_code = ?';
        orgParams.push(country_code);
      }
      if (city) {
        orgQuery += ' AND o.city LIKE ?';
        orgParams.push(`%${city}%`);
      }
      if (status) {
        orgQuery += ' AND o.submission_status = ?';
        orgParams.push(status);
      }
      if (emergency === 'true' || emergency === '1') {
        orgQuery += ' AND o.emergency_available = 1';
      }
      if (organization_type) {
        orgQuery += ' AND o.type = ?';
        orgParams.push(organization_type);
      }
      if (species) {
        const speciesArr = Array.isArray(species) ? species : species.split(',');
        const speciesClauses = speciesArr.map(() => 'JSON_CONTAINS(o.species_treated, ?)');
        orgQuery += ` AND (${speciesClauses.join(' OR ')})`;
        speciesArr.forEach(s => orgParams.push(JSON.stringify(s.trim())));
      }
      if (services) {
        const servicesArr = Array.isArray(services) ? services : services.split(',');
        const servicesClauses = servicesArr.map(() => 'JSON_CONTAINS(o.services, ?)');
        orgQuery += ` AND (${servicesClauses.join(' OR ')})`;
        servicesArr.forEach(s => orgParams.push(JSON.stringify(s.trim())));
      }

      // Count
      const orgCountQuery = orgQuery.replace(/SELECT[\s\S]*?FROM organizations/, 'SELECT COUNT(*) as total FROM organizations');
      const [[{ total: orgTotal }]] = await db.query(orgCountQuery, orgParams);

      if (!requestedType || requestedType === 'all') {
        totalCount += orgTotal;
      } else {
        totalCount = orgTotal;
      }

      // Sort
      if (sort === 'name') orgQuery += ' ORDER BY o.name';
      else if (sort === 'date' || sort === 'date_creation') orgQuery += ' ORDER BY o.created_at DESC';
      else if (sort === 'country' || sort === 'pays') orgQuery += ' ORDER BY o.country, o.name';
      else orgQuery += ' ORDER BY o.name';

      if (requestedType === 'organization') {
        orgQuery += ' LIMIT ? OFFSET ?';
        orgParams.push(parseInt(limit), offset);
      }

      const [orgs] = await db.query(orgQuery, orgParams);
      allResults = allResults.concat(orgs);
    }

    // For unified queries, sort combined results and paginate in JS
    if (!requestedType || requestedType === 'all') {
      if (sort === 'name') {
        allResults.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr'));
      } else if (sort === 'date' || sort === 'date_creation') {
        allResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else if (sort === 'country' || sort === 'pays') {
        allResults.sort((a, b) => (a.country || '').localeCompare(b.country || '', 'fr') || (a.name || '').localeCompare(b.name || '', 'fr'));
      }
      allResults = allResults.slice(offset, offset + parseInt(limit));
    }

    // Parse JSON fields for safe consumption
    const data = allResults.map(item => {
      const parsed = { ...item };
      ['skills', 'services', 'species', 'hours', 'languages', 'specialties'].forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
          try { parsed[field] = JSON.parse(parsed[field]); } catch (e) { /* keep as string */ }
        }
      });
      return parsed;
    });

    res.json({
      success: true,
      data,
      total: totalCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== COUNTRIES ====================

// GET /countries - African countries with organization/expert counts
router.get('/countries', auth, async (req, res) => {
  try {
    const { has_organizations, has_experts, sort = 'name' } = req.query;

    // Get org counts by country
    const [orgCounts] = await db.query(`
      SELECT country, country_code, COUNT(*) as organization_count
      FROM organizations
      WHERE is_active = 1 AND country IS NOT NULL AND country != ''
      GROUP BY country, country_code
    `);

    // Get expert counts by country
    const [expertCounts] = await db.query(`
      SELECT country, country_code, COUNT(*) as expert_count
      FROM human_resources
      WHERE is_active = 1 AND country IS NOT NULL AND country != ''
      GROUP BY country, country_code
    `);

    // Build lookup maps
    const orgMap = {};
    orgCounts.forEach(r => {
      const key = r.country_code || r.country;
      if (key) orgMap[key] = (orgMap[key] || 0) + r.organization_count;
    });

    const expertMap = {};
    expertCounts.forEach(r => {
      const key = r.country_code || r.country;
      if (key) expertMap[key] = (expertMap[key] || 0) + r.expert_count;
    });

    // Build result from reference list
    let countries = AFRICAN_COUNTRIES.map(c => ({
      code2: c.code2,
      code3: c.code3,
      nom_fr: c.nom_fr,
      nom_en: c.nom_en,
      organization_count: orgMap[c.code3] || orgMap[c.code2] || orgMap[c.nom_fr] || orgMap[c.nom_en] || 0,
      expert_count: expertMap[c.code3] || expertMap[c.code2] || expertMap[c.nom_fr] || expertMap[c.nom_en] || 0,
    }));

    // Compute total
    countries.forEach(c => { c.total_count = c.organization_count + c.expert_count; });

    // Apply filters
    if (has_organizations === 'true') {
      countries = countries.filter(c => c.organization_count > 0);
    }
    if (has_experts === 'true') {
      countries = countries.filter(c => c.expert_count > 0);
    }

    // Sort
    if (sort === 'count' || sort === 'entries') {
      countries.sort((a, b) => b.total_count - a.total_count);
    } else if (sort === 'organizations') {
      countries.sort((a, b) => b.organization_count - a.organization_count);
    } else if (sort === 'experts') {
      countries.sort((a, b) => b.expert_count - a.expert_count);
    } else {
      countries.sort((a, b) => a.nom_fr.localeCompare(b.nom_fr, 'fr'));
    }

    res.json({ success: true, data: countries });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== STATS & DASHBOARD ====================

// GET /stats - Enhanced mapping statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // --- Totals by type ---
    const [[orgTotal]] = await db.query('SELECT COUNT(*) as total FROM organizations WHERE is_active = 1');
    const [[expertTotal]] = await db.query('SELECT COUNT(*) as total FROM human_resources WHERE is_active = 1');
    const [[materialTotal]] = await db.query('SELECT COUNT(*) as total FROM material_resources WHERE is_active = 1');
    const [[docTotal]] = await db.query('SELECT COUNT(*) as total FROM document_resources WHERE is_active = 1');

    // --- Verified/approved counts ---
    const [[verifiedOrgs]] = await db.query("SELECT COUNT(*) as total FROM organizations WHERE is_active = 1 AND submission_status = 'approved'");
    const [[verifiedExperts]] = await db.query("SELECT COUNT(*) as total FROM human_resources WHERE is_active = 1 AND submission_status = 'approved'");

    // --- Distinct countries ---
    const [[countryCount]] = await db.query(`
      SELECT COUNT(DISTINCT country) as total FROM (
        SELECT country FROM organizations WHERE is_active = 1 AND country IS NOT NULL AND country != ''
        UNION
        SELECT country FROM human_resources WHERE is_active = 1 AND country IS NOT NULL AND country != ''
      ) c
    `);

    // --- Pending submissions ---
    const [[pendingOrgs]] = await db.query("SELECT COUNT(*) as total FROM organizations WHERE submission_status = 'pending'");
    const [[pendingExperts]] = await db.query("SELECT COUNT(*) as total FROM human_resources WHERE submission_status = 'pending'");
    const [[pendingMaterials]] = await db.query("SELECT COUNT(*) as total FROM material_resources WHERE submission_status = 'pending'");
    const [[pendingDocs]] = await db.query("SELECT COUNT(*) as total FROM document_resources WHERE submission_status = 'pending'");

    // --- By type (organizations) ---
    const [orgByType] = await db.query('SELECT type, COUNT(*) as count FROM organizations WHERE is_active = 1 GROUP BY type ORDER BY count DESC');

    // --- By type (experts) ---
    const [expertByCategory] = await db.query('SELECT category, COUNT(*) as count FROM human_resources WHERE is_active = 1 GROUP BY category ORDER BY count DESC');

    // --- Top 10 countries ---
    const [byCountry] = await db.query(`
      SELECT country, SUM(cnt) as count FROM (
        SELECT country, COUNT(*) as cnt FROM organizations WHERE is_active = 1 AND country IS NOT NULL AND country != '' GROUP BY country
        UNION ALL
        SELECT country, COUNT(*) as cnt FROM human_resources WHERE is_active = 1 AND country IS NOT NULL AND country != '' GROUP BY country
      ) combined
      GROUP BY country ORDER BY count DESC LIMIT 10
    `);

    // --- By status (all types combined) ---
    const [orgByStatus] = await db.query("SELECT submission_status as status, COUNT(*) as count FROM organizations GROUP BY submission_status");
    const [expertByStatus] = await db.query("SELECT submission_status as status, COUNT(*) as count FROM human_resources GROUP BY submission_status");
    const statusMap = {};
    [...orgByStatus, ...expertByStatus].forEach(r => {
      statusMap[r.status || 'none'] = (statusMap[r.status || 'none'] || 0) + r.count;
    });

    // --- New registrations this month ---
    const [[newOrgsMonth]] = await db.query("SELECT COUNT(*) as total FROM organizations WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')");
    const [[newExpertsMonth]] = await db.query("SELECT COUNT(*) as total FROM human_resources WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')");

    // --- By specialty/service (top 10 org types) ---
    const [bySpecialty] = await db.query(`
      SELECT type as specialty, COUNT(*) as count
      FROM organizations WHERE is_active = 1 AND type IS NOT NULL
      GROUP BY type ORDER BY count DESC LIMIT 10
    `);

    // --- Monthly evolution (last 12 months) ---
    const [monthlyOrgs] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
      FROM organizations
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month ORDER BY month
    `);
    const [monthlyExperts] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
      FROM human_resources
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY month ORDER BY month
    `);

    // Merge monthly data
    const monthlyMap = {};
    monthlyOrgs.forEach(r => {
      if (!monthlyMap[r.month]) monthlyMap[r.month] = { month: r.month, organizations: 0, experts: 0 };
      monthlyMap[r.month].organizations = r.count;
    });
    monthlyExperts.forEach(r => {
      if (!monthlyMap[r.month]) monthlyMap[r.month] = { month: r.month, organizations: 0, experts: 0 };
      monthlyMap[r.month].experts = r.count;
    });
    const monthlyEvolution = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      success: true,
      data: {
        // Totals
        totalOrganizations: orgTotal.total,
        totalExperts: expertTotal.total,
        totalMaterials: materialTotal.total,
        totalDocuments: docTotal.total,
        totalEntries: orgTotal.total + expertTotal.total + materialTotal.total + docTotal.total,

        // Verified
        verifiedCount: verifiedOrgs.total + verifiedExperts.total,
        verifiedOrganizations: verifiedOrgs.total,
        verifiedExperts: verifiedExperts.total,

        // Countries
        totalCountries: countryCount.total,

        // Pending
        pendingSubmissions: pendingOrgs.total + pendingExperts.total + pendingMaterials.total + pendingDocs.total,
        pendingByType: {
          organizations: pendingOrgs.total,
          experts: pendingExperts.total,
          materials: pendingMaterials.total,
          documents: pendingDocs.total,
        },

        // Breakdowns
        byType: orgByType,
        byExpertCategory: expertByCategory,
        byCountry,
        byStatus: statusMap,
        bySpecialty,

        // This month
        newThisMonth: {
          organizations: newOrgsMonth.total,
          experts: newExpertsMonth.total,
          total: newOrgsMonth.total + newExpertsMonth.total,
        },

        // Evolution
        monthlyEvolution,

        // Legacy format (backward compat)
        human_resources: { total: expertTotal.total },
        material_resources: { total: materialTotal.total },
        organizations: { total: orgTotal.total, by_type: orgByType.reduce((acc, r) => ({ ...acc, [r.type]: r.count }), {}) },
        documents: { total: docTotal.total },
      }
    });
  } catch (error) {
    console.error('Get mapping stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all map markers (for interactive map)
router.get('/markers', auth, async (req, res) => {
  try {
    const { types } = req.query; // human,material,organization
    const typeArray = types ? types.split(',') : ['human', 'material', 'organization'];

    let markers = [];

    if (typeArray.includes('human')) {
      const [humans] = await db.query(`
        SELECT id, first_name, last_name, title, category, latitude, longitude, region, city, photo
        FROM human_resources WHERE is_active = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
      `);
      markers = markers.concat(humans.map(h => ({
        id: h.id,
        type: 'human',
        name: `${h.first_name} ${h.last_name}`,
        title: h.title,
        category: h.category,
        lat: parseFloat(h.latitude),
        lng: parseFloat(h.longitude),
        region: h.region,
        city: h.city,
        photo: h.photo
      })));
    }

    if (typeArray.includes('material')) {
      const [materials] = await db.query(`
        SELECT id, name, type, status, latitude, longitude, region, city
        FROM material_resources WHERE is_active = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
      `);
      markers = markers.concat(materials.map(m => ({
        id: m.id,
        type: 'material',
        name: m.name,
        category: m.type,
        status: m.status,
        lat: parseFloat(m.latitude),
        lng: parseFloat(m.longitude),
        region: m.region,
        city: m.city
      })));
    }

    if (typeArray.includes('organization')) {
      const [orgs] = await db.query(`
        SELECT id, name, acronym, type, latitude, longitude, region, city, logo
        FROM organizations WHERE is_active = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
      `);
      markers = markers.concat(orgs.map(o => ({
        id: o.id,
        type: 'organization',
        name: o.name,
        acronym: o.acronym,
        category: o.type,
        lat: parseFloat(o.latitude),
        lng: parseFloat(o.longitude),
        region: o.region,
        city: o.city,
        logo: o.logo
      })));
    }

    res.json({ success: true, data: markers });
  } catch (error) {
    console.error('Get markers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== REGIONS ====================

router.get('/regions', auth, async (req, res) => {
  try {
    const [regions] = await db.query('SELECT * FROM regions ORDER BY name');
    res.json({ success: true, data: regions });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== EXPERTISE DOMAINS ====================

router.get('/expertise-domains', auth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM expertise_domains WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR name_en LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY category, name';
    const [domains] = await db.query(query, params);

    // Group by category
    const grouped = domains.reduce((acc, d) => {
      if (!acc[d.category]) acc[d.category] = [];
      acc[d.category].push(d);
      return acc;
    }, {});

    // Category labels for frontend
    const categoryLabels = {
      health: 'Santé Humaine',
      animal: 'Santé Animale',
      environment: 'Santé Environnementale',
      food_safety: 'Sécurité Alimentaire',
      laboratory: 'Laboratoire',
      management: 'Gestion & Coordination',
      policy: 'Politique Sanitaire',
      communication: 'Communication',
      other: 'Autres'
    };

    res.json({ success: true, data: domains, grouped, categoryLabels });
  } catch (error) {
    console.error('Get expertise domains error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE expertise domain
router.post('/expertise-domains', auth, async (req, res) => {
  try {
    const { name, category, description, icon, is_active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const slug = name.toLowerCase()
      .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const [result] = await db.query(
      `INSERT INTO expertise_domains (name, slug, category, description, icon, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), slug, category || 'other', description || '', icon || 'award', is_active !== false ? 1 : 0]
    );

    const [newDomain] = await db.query('SELECT * FROM expertise_domains WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newDomain[0] });
  } catch (error) {
    console.error('Create expertise domain error:', error.message, error.sql || '');
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// UPDATE expertise domain
router.put('/expertise-domains/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, icon, is_active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    await db.query(
      `UPDATE expertise_domains SET name = ?, category = ?, description = ?, icon = ?, is_active = ? WHERE id = ?`,
      [name.trim(), category || 'other', description || '', icon || 'award', is_active !== false ? 1 : 0, id]
    );

    const [updated] = await db.query('SELECT * FROM expertise_domains WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update expertise domain error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// DELETE expertise domain
router.delete('/expertise-domains/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM expertise_domains WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Domain deleted' });
  } catch (error) {
    console.error('Delete expertise domain error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Get expert's expertise domains
router.get('/experts/:id/expertise', auth, async (req, res) => {
  try {
    const [expertises] = await db.query(`
      SELECT ed.*, ee.level, ee.years_in_domain
      FROM expertise_domains ed
      INNER JOIN expert_expertise ee ON ed.id = ee.expertise_domain_id
      WHERE ee.expert_id = ? AND ed.is_active = 1
      ORDER BY ed.category, ed.name
    `, [req.params.id]);

    res.json({ success: true, data: expertises });
  } catch (error) {
    console.error('Get expert expertise error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update expert's expertise domains
router.put('/experts/:id/expertise', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { expertise_ids } = req.body; // Array of { domain_id, level, years_in_domain }

    // Delete existing
    await db.query('DELETE FROM expert_expertise WHERE expert_id = ?', [id]);

    // Insert new
    if (expertise_ids && expertise_ids.length > 0) {
      const values = expertise_ids.map(e => [id, e.domain_id, e.level || 'intermediate', e.years_in_domain || null]);
      await db.query(
        'INSERT INTO expert_expertise (expert_id, expertise_domain_id, level, years_in_domain) VALUES ?',
        [values]
      );
    }

    // Get updated list
    const [expertises] = await db.query(`
      SELECT ed.*, ee.level, ee.years_in_domain
      FROM expertise_domains ed
      INNER JOIN expert_expertise ee ON ed.id = ee.expertise_domain_id
      WHERE ee.expert_id = ? AND ed.is_active = 1
    `, [id]);

    res.json({ success: true, data: expertises });
  } catch (error) {
    console.error('Update expert expertise error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== DOCUMENT THEMES ====================

router.get('/document-themes', auth, async (req, res) => {
  try {
    const [themes] = await db.query('SELECT * FROM document_themes WHERE is_active = 1 ORDER BY display_order, name');
    res.json({ success: true, data: themes });
  } catch (error) {
    console.error('Get document themes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/document-themes', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description, icon, color, parent_theme_id, display_order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const [result] = await db.query(
      'INSERT INTO document_themes (name, slug, description, icon, color, parent_theme_id, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description, icon, color, parent_theme_id, display_order || 0]
    );

    const [newTheme] = await db.query('SELECT * FROM document_themes WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newTheme[0] });
  } catch (error) {
    console.error('Create document theme error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== HUMAN RESOURCES (PILIER 1) ====================

// GET all experts
router.get('/experts', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, region, organization_id, search, is_verified } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT h.*, o.name as organization_name, o.acronym as organization_acronym
      FROM human_resources h
      LEFT JOIN organizations o ON h.organization_id = o.id
      WHERE h.is_active = 1
    `;
    const params = [];

    if (category) {
      query += ' AND h.category = ?';
      params.push(category);
    }
    if (region) {
      query += ' AND h.region = ?';
      params.push(region);
    }
    if (organization_id) {
      query += ' AND h.organization_id = ?';
      params.push(organization_id);
    }
    if (is_verified !== undefined) {
      query += ' AND h.is_verified = ?';
      params.push(is_verified === 'true' ? 1 : 0);
    }
    if (search) {
      query += ' AND (h.first_name LIKE ? OR h.last_name LIKE ? OR h.title LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Count total
    const countQuery = query.replace('SELECT h.*, o.name as organization_name, o.acronym as organization_acronym', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await db.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY h.last_name, h.first_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [experts] = await db.query(query, params);

    res.json({
      success: true,
      data: experts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get experts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single expert
router.get('/experts/:id', auth, async (req, res) => {
  try {
    const [experts] = await db.query(`
      SELECT h.*, o.name as organization_name, o.acronym as organization_acronym
      FROM human_resources h
      LEFT JOIN organizations o ON h.organization_id = o.id
      WHERE h.id = ?
    `, [req.params.id]);

    if (experts.length === 0) {
      return res.status(404).json({ success: false, message: 'Expert not found' });
    }

    // Get expertise domains
    const [expertises] = await db.query(`
      SELECT ed.*, ee.level
      FROM expertise_domains ed
      INNER JOIN expert_expertise ee ON ed.id = ee.expertise_domain_id
      WHERE ee.expert_id = ?
    `, [req.params.id]);

    // Get organizations
    const [organizations] = await db.query(`
      SELECT o.*, eo.role, eo.is_primary
      FROM organizations o
      INNER JOIN expert_organization eo ON o.id = eo.organization_id
      WHERE eo.expert_id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      data: {
        ...experts[0],
        expertises,
        organizations
      }
    });
  } catch (error) {
    console.error('Get expert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE expert
router.post('/experts', auth, async (req, res) => {
  try {
    const {
      first_name, last_name, title, category, organization_id,
      email, phone, photo, biography, expertise_domains, qualifications,
      latitude, longitude, region, city, address,
      // New fields
      years_experience, cv_url, linkedin_url, twitter_url, orcid_id,
      google_scholar_url, researchgate_url, website, languages, education,
      certifications, publications_count, projects_count, awards,
      research_interests, available_for_collaboration, consultation_rate, expertise_summary,
      selected_expertise_ids
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO human_resources
      (first_name, last_name, title, category, organization_id, email, phone, photo, biography,
       expertise_domains, qualifications, latitude, longitude, region, city, address,
       years_experience, cv_url, linkedin_url, twitter_url, orcid_id, google_scholar_url,
       researchgate_url, website, languages, education, certifications, publications_count,
       projects_count, awards, research_interests, available_for_collaboration, consultation_rate, expertise_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      first_name, last_name, title, category, organization_id,
      email, phone, photo, biography,
      JSON.stringify(expertise_domains || []),
      JSON.stringify(qualifications || []),
      latitude, longitude, region, city, address,
      years_experience || 0, cv_url, linkedin_url, twitter_url, orcid_id,
      google_scholar_url, researchgate_url, website,
      JSON.stringify(languages || []),
      JSON.stringify(education || []),
      JSON.stringify(certifications || []),
      publications_count || 0, projects_count || 0, awards, research_interests,
      available_for_collaboration !== false, consultation_rate, expertise_summary
    ]);

    const expertId = result.insertId;

    // Save expertise domains relationship
    if (selected_expertise_ids && selected_expertise_ids.length > 0) {
      const expertiseValues = selected_expertise_ids.map(e => [
        expertId,
        typeof e === 'object' ? e.domain_id : e,
        typeof e === 'object' ? e.level || 'intermediate' : 'intermediate',
        typeof e === 'object' ? e.years_in_domain : null
      ]);
      await db.query(
        'INSERT INTO expert_expertise (expert_id, expertise_domain_id, level, years_in_domain) VALUES ?',
        [expertiseValues]
      );
    }

    const [newExpert] = await db.query('SELECT * FROM human_resources WHERE id = ?', [expertId]);
    res.status(201).json({ success: true, data: newExpert[0] });
  } catch (error) {
    console.error('Create expert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE expert
router.put('/experts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    // Build dynamic update query
    const allowedFields = [
      'first_name', 'last_name', 'title', 'category', 'organization_id',
      'email', 'phone', 'photo', 'biography', 'expertise_domains', 'qualifications',
      'latitude', 'longitude', 'region', 'city', 'address', 'is_active', 'is_verified',
      // New fields
      'years_experience', 'cv_url', 'linkedin_url', 'twitter_url', 'orcid_id',
      'google_scholar_url', 'researchgate_url', 'website', 'languages', 'education',
      'certifications', 'publications_count', 'projects_count', 'awards',
      'research_interests', 'available_for_collaboration', 'consultation_rate', 'expertise_summary'
    ];

    const jsonFields = ['expertise_domains', 'qualifications', 'languages', 'education', 'certifications'];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(jsonFields.includes(key) ? JSON.stringify(value) : value);
      }
    }

    if (updates.length > 0) {
      params.push(id);
      await db.query(`UPDATE human_resources SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Update expertise domains relationship if provided
    if (fields.selected_expertise_ids !== undefined) {
      await db.query('DELETE FROM expert_expertise WHERE expert_id = ?', [id]);

      if (fields.selected_expertise_ids && fields.selected_expertise_ids.length > 0) {
        const expertiseValues = fields.selected_expertise_ids.map(e => [
          id,
          typeof e === 'object' ? e.domain_id : e,
          typeof e === 'object' ? e.level || 'intermediate' : 'intermediate',
          typeof e === 'object' ? e.years_in_domain : null
        ]);
        await db.query(
          'INSERT INTO expert_expertise (expert_id, expertise_domain_id, level, years_in_domain) VALUES ?',
          [expertiseValues]
        );
      }
    }

    const [updated] = await db.query('SELECT * FROM human_resources WHERE id = ?', [id]);

    // Get expertises
    const [expertises] = await db.query(`
      SELECT ed.id, ed.name, ed.category, ee.level
      FROM expertise_domains ed
      INNER JOIN expert_expertise ee ON ed.id = ee.expertise_domain_id
      WHERE ee.expert_id = ?
    `, [id]);

    res.json({ success: true, data: { ...updated[0], expertises } });
  } catch (error) {
    console.error('Update expert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE expert
router.delete('/experts/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE human_resources SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Expert deleted' });
  } catch (error) {
    console.error('Delete expert error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== ORGANIZATIONS (PILIER 3) ====================

// GET all organizations
router.get('/organizations', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, region, search, parent_id } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM organizations WHERE is_active = 1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }
    if (parent_id) {
      query += ' AND parent_organization_id = ?';
      params.push(parent_id);
    }
    if (search) {
      query += ' AND (name LIKE ? OR acronym LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Count total
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await db.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [organizations] = await db.query(query, params);

    res.json({
      success: true,
      data: organizations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single organization
router.get('/organizations/:id', auth, async (req, res) => {
  try {
    const [orgs] = await db.query('SELECT * FROM organizations WHERE id = ?', [req.params.id]);

    if (orgs.length === 0) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    // Get parent organization
    let parent = null;
    if (orgs[0].parent_organization_id) {
      const [parents] = await db.query('SELECT id, name, acronym FROM organizations WHERE id = ?', [orgs[0].parent_organization_id]);
      parent = parents[0] || null;
    }

    // Get child organizations
    const [children] = await db.query('SELECT id, name, acronym, type FROM organizations WHERE parent_organization_id = ? AND is_active = 1', [req.params.id]);

    // Get experts count
    const [[{ expertCount }]] = await db.query('SELECT COUNT(*) as expertCount FROM human_resources WHERE organization_id = ? AND is_active = 1', [req.params.id]);

    res.json({
      success: true,
      data: {
        ...orgs[0],
        parent,
        children,
        expert_count: expertCount
      }
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE organization
router.post('/organizations', auth, async (req, res) => {
  try {
    const {
      name, acronym, type, description, mission, logo, website,
      parent_organization_id, latitude, longitude, region, city, address,
      contact_email, contact_phone, social_links, domains, geolocation
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO organizations
      (name, acronym, type, description, mission, logo, website, parent_organization_id,
       latitude, longitude, region, city, address, contact_email, contact_phone, social_links, domains, geolocation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, acronym, type, description, mission, logo, website,
      parent_organization_id, latitude, longitude, region, city, address,
      contact_email, contact_phone,
      JSON.stringify(social_links || {}),
      JSON.stringify(domains || []),
      geolocation ? JSON.stringify(geolocation) : null
    ]);

    const [newOrg] = await db.query('SELECT * FROM organizations WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newOrg[0] });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE organization
router.put('/organizations/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowedFields = [
      'name', 'acronym', 'type', 'description', 'mission', 'logo', 'website',
      'parent_organization_id', 'latitude', 'longitude', 'region', 'city', 'address',
      'contact_email', 'contact_phone', 'social_links', 'domains', 'is_active', 'geolocation'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(['social_links', 'domains', 'geolocation'].includes(key) ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    params.push(id);
    await db.query(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM organizations WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE organization
router.delete('/organizations/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE organizations SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Organization deleted' });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== MATERIAL RESOURCES (PILIER 2) ====================

// GET all materials
router.get('/materials', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, region, organization_id, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT m.*, o.name as organization_name, o.acronym as organization_acronym,
             h.first_name as manager_first_name, h.last_name as manager_last_name
      FROM material_resources m
      LEFT JOIN organizations o ON m.organization_id = o.id
      LEFT JOIN human_resources h ON m.manager_id = h.id
      WHERE m.is_active = 1
    `;
    const params = [];

    if (type) {
      query += ' AND m.type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND m.status = ?';
      params.push(status);
    }
    if (region) {
      query += ' AND m.region = ?';
      params.push(region);
    }
    if (organization_id) {
      query += ' AND m.organization_id = ?';
      params.push(organization_id);
    }
    if (search) {
      query += ' AND m.name LIKE ?';
      params.push(`%${search}%`);
    }

    // Count total
    const countQuery = query.replace(/SELECT[\s\S]*?FROM material_resources/, 'SELECT COUNT(*) as total FROM material_resources');
    const [[{ total }]] = await db.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY m.name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [materials] = await db.query(query, params);

    res.json({
      success: true,
      data: materials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single material
router.get('/materials/:id', auth, async (req, res) => {
  try {
    const [materials] = await db.query(`
      SELECT m.*, o.name as organization_name, o.acronym as organization_acronym,
             h.first_name as manager_first_name, h.last_name as manager_last_name, h.email as manager_email
      FROM material_resources m
      LEFT JOIN organizations o ON m.organization_id = o.id
      LEFT JOIN human_resources h ON m.manager_id = h.id
      WHERE m.id = ?
    `, [req.params.id]);

    if (materials.length === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    res.json({ success: true, data: materials[0] });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE material
router.post('/materials', auth, async (req, res) => {
  try {
    const {
      name, type, description, specifications, capacity, organization_id, manager_id,
      latitude, longitude, region, city, address, status, certifications, photos,
      contact_email, contact_phone, geolocation, image
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO material_resources
      (name, type, description, specifications, capacity, organization_id, manager_id,
       latitude, longitude, region, city, address, status, certifications, photos,
       contact_email, contact_phone, geolocation, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, type, description,
      JSON.stringify(specifications || {}),
      capacity, organization_id, manager_id,
      latitude, longitude, region, city, address,
      status || 'available',
      JSON.stringify(certifications || []),
      JSON.stringify(photos || []),
      contact_email, contact_phone,
      geolocation ? JSON.stringify(geolocation) : null,
      image || null
    ]);

    const [newMaterial] = await db.query('SELECT * FROM material_resources WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newMaterial[0] });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE material
router.put('/materials/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowedFields = [
      'name', 'type', 'description', 'specifications', 'capacity', 'organization_id', 'manager_id',
      'latitude', 'longitude', 'region', 'city', 'address', 'status', 'certifications', 'photos',
      'contact_email', 'contact_phone', 'is_active', 'geolocation', 'image'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(['specifications', 'certifications', 'photos', 'geolocation'].includes(key) ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    params.push(id);
    await db.query(`UPDATE material_resources SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM material_resources WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE material
router.delete('/materials/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE material_resources SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Material deleted' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== DOCUMENT RESOURCES (PILIER 4) ====================

// GET all documents
router.get('/documents', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, theme, language, year, organization_id, access_level, search, is_featured } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT d.*, o.name as organization_name, o.acronym as organization_acronym
      FROM document_resources d
      LEFT JOIN organizations o ON d.organization_id = o.id
      WHERE d.is_active = 1
    `;
    const params = [];

    if (type) {
      query += ' AND d.type = ?';
      params.push(type);
    }
    if (language) {
      query += ' AND d.language = ?';
      params.push(language);
    }
    if (year) {
      query += ' AND YEAR(d.publication_date) = ?';
      params.push(year);
    }
    if (organization_id) {
      query += ' AND d.organization_id = ?';
      params.push(organization_id);
    }
    if (access_level) {
      query += ' AND d.access_level = ?';
      params.push(access_level);
    }
    if (is_featured !== undefined) {
      query += ' AND d.is_featured = ?';
      params.push(is_featured === 'true' ? 1 : 0);
    }
    if (search) {
      query += ' AND (d.title LIKE ? OR d.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Count total
    const countQuery = query.replace('SELECT d.*, o.name as organization_name, o.acronym as organization_acronym', 'SELECT COUNT(*) as total');
    const [[{ total }]] = await db.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY d.publication_date DESC, d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [documents] = await db.query(query, params);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET featured documents
router.get('/documents/featured', auth, async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const [documents] = await db.query(`
      SELECT d.*, o.name as organization_name
      FROM document_resources d
      LEFT JOIN organizations o ON d.organization_id = o.id
      WHERE d.is_active = 1 AND d.is_featured = 1
      ORDER BY d.publication_date DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get featured documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET recent documents
router.get('/documents/recent', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const [documents] = await db.query(`
      SELECT d.*, o.name as organization_name
      FROM document_resources d
      LEFT JOIN organizations o ON d.organization_id = o.id
      WHERE d.is_active = 1
      ORDER BY d.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get recent documents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET single document (by id or slug)
router.get('/documents/:idOrSlug', auth, async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = /^\d+$/.test(idOrSlug);

    const [documents] = await db.query(`
      SELECT d.*, o.name as organization_name, o.acronym as organization_acronym
      FROM document_resources d
      LEFT JOIN organizations o ON d.organization_id = o.id
      WHERE ${isNumeric ? 'd.id = ?' : 'd.slug = ?'}
    `, [idOrSlug]);

    if (documents.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Increment view count
    await db.query('UPDATE document_resources SET view_count = view_count + 1 WHERE id = ?', [documents[0].id]);

    // Get authors
    const [authors] = await db.query(`
      SELECT da.*, h.first_name, h.last_name, h.title as expert_title, h.photo
      FROM document_author da
      LEFT JOIN human_resources h ON da.expert_id = h.id
      WHERE da.document_id = ?
      ORDER BY da.author_order
    `, [documents[0].id]);

    res.json({
      success: true,
      data: {
        ...documents[0],
        view_count: documents[0].view_count + 1,
        authors
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE document
router.post('/documents', auth, async (req, res) => {
  try {
    const {
      title, type, description, content, file_path, file_type, file_size, thumbnail,
      authors, organization_id, publication_date, language, themes, doi, isbn,
      pages_count, video_url, video_duration, access_level, is_featured
    } = req.body;

    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 200);

    // Check slug uniqueness
    const [existing] = await db.query('SELECT id FROM document_resources WHERE slug = ?', [slug]);
    const finalSlug = existing.length > 0 ? `${slug}-${Date.now()}` : slug;

    const [result] = await db.query(`
      INSERT INTO document_resources
      (title, slug, type, description, content, file_path, file_type, file_size, thumbnail,
       authors, organization_id, publication_date, language, themes, doi, isbn,
       pages_count, video_url, video_duration, access_level, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, finalSlug, type, description, content, file_path, file_type, file_size, thumbnail,
      JSON.stringify(authors || []),
      organization_id, publication_date, language || 'fr',
      JSON.stringify(themes || []),
      doi, isbn, pages_count, video_url, video_duration,
      access_level || 'public', is_featured || false
    ]);

    const [newDoc] = await db.query('SELECT * FROM document_resources WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newDoc[0] });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE document
router.put('/documents/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowedFields = [
      'title', 'type', 'description', 'content', 'file_path', 'file_type', 'file_size', 'thumbnail',
      'authors', 'organization_id', 'publication_date', 'language', 'themes', 'doi', 'isbn',
      'pages_count', 'video_url', 'video_duration', 'access_level', 'is_featured', 'is_active', 'version'
    ];

    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(['authors', 'themes'].includes(key) ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    params.push(id);
    await db.query(`UPDATE document_resources SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query('SELECT * FROM document_resources WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE document
router.delete('/documents/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('UPDATE document_resources SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Increment download count
router.post('/documents/:id/download', async (req, res) => {
  try {
    await db.query('UPDATE document_resources SET download_count = download_count + 1 WHERE id = ?', [req.params.id]);
    const [doc] = await db.query('SELECT file_path, download_count FROM document_resources WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: doc[0] });
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== CONFIGURATION / SETTINGS ====================

// Helper function for CRUD operations on config tables
const createConfigRoutes = (tableName, entityName) => {
  // GET all
  router.get(`/config/${entityName}`, async (req, res) => {
    try {
      const { include_inactive } = req.query;
      let query = `SELECT * FROM ${tableName}`;
      if (!include_inactive) {
        query += ' WHERE is_active = 1';
      }
      query += ' ORDER BY display_order, name';
      const [rows] = await db.query(query);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error(`Get ${entityName} error:`, error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // GET single
  router.get(`/config/${entityName}/:id`, async (req, res) => {
    try {
      const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error(`Get ${entityName} error:`, error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // CREATE
  router.post(`/config/${entityName}`, auth, async (req, res) => {
    try {
      const { name, name_en, description, icon, color, display_order, is_active } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }

      const slug = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const [result] = await db.query(
        `INSERT INTO ${tableName} (name, name_en, slug, description, icon, color, display_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, name_en || null, slug, description || null, icon || 'box', color || '#64748b', display_order || 0, is_active !== false]
      );

      const [created] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
      res.status(201).json({ success: true, data: created[0] });
    } catch (error) {
      console.error(`Create ${entityName} error:`, error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Un élément avec ce nom existe déjà' });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // UPDATE
  router.put(`/config/${entityName}/:id`, auth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, name_en, description, icon, color, display_order, is_active } = req.body;

      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
        // Update slug too
        const slug = name.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        updates.push('slug = ?');
        params.push(slug);
      }
      if (name_en !== undefined) { updates.push('name_en = ?'); params.push(name_en); }
      if (description !== undefined) { updates.push('description = ?'); params.push(description); }
      if (icon !== undefined) { updates.push('icon = ?'); params.push(icon); }
      if (color !== undefined) { updates.push('color = ?'); params.push(color); }
      if (display_order !== undefined) { updates.push('display_order = ?'); params.push(display_order); }
      if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }

      params.push(id);
      await db.query(`UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ?`, params);

      const [updated] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
      res.json({ success: true, data: updated[0] });
    } catch (error) {
      console.error(`Update ${entityName} error:`, error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Un élément avec ce nom existe déjà' });
      }
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // DELETE (soft delete)
  router.delete(`/config/${entityName}/:id`, auth, authorize('admin'), async (req, res) => {
    try {
      await db.query(`UPDATE ${tableName} SET is_active = 0 WHERE id = ?`, [req.params.id]);
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      console.error(`Delete ${entityName} error:`, error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // REORDER
  router.put(`/config/${entityName}/reorder`, auth, async (req, res) => {
    try {
      const { items } = req.body; // Array of { id, display_order }
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Items array required' });
      }

      for (const item of items) {
        await db.query(`UPDATE ${tableName} SET display_order = ? WHERE id = ?`, [item.display_order, item.id]);
      }

      res.json({ success: true, message: 'Reordered successfully' });
    } catch (error) {
      console.error(`Reorder ${entityName} error:`, error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
};

// Create routes for each config type
createConfigRoutes('ohwr_material_types', 'material-types');
createConfigRoutes('ohwr_organization_types', 'organization-types');
createConfigRoutes('ohwr_document_types', 'document-types');
createConfigRoutes('ohwr_expert_categories', 'expert-categories');

// GET all config types at once (for forms)
router.get('/config/all', auth, async (req, res) => {
  try {
    const [materialTypes] = await db.query('SELECT * FROM ohwr_material_types WHERE is_active = 1 ORDER BY display_order, name');
    const [organizationTypes] = await db.query('SELECT * FROM ohwr_organization_types WHERE is_active = 1 ORDER BY display_order, name');
    const [documentTypes] = await db.query('SELECT * FROM ohwr_document_types WHERE is_active = 1 ORDER BY display_order, name');
    const [expertCategories] = await db.query('SELECT * FROM ohwr_expert_categories WHERE is_active = 1 ORDER BY display_order, name');

    res.json({
      success: true,
      data: {
        materialTypes,
        organizationTypes,
        documentTypes,
        expertCategories
      }
    });
  } catch (error) {
    console.error('Get all config error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== USER RESOURCE SUBMISSIONS ====================

// Helper function to create notification
const createNotification = async (type, title, message, resourceType, resourceId, userId) => {
  try {
    await db.query(
      `INSERT INTO admin_notifications (type, title, message, resource_type, resource_id, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [type, title, message, resourceType, resourceId, userId]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// GET user's submissions (all types)
router.get('/my-submissions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, type } = req.query;

    let results = { materials: [], organizations: [], documents: [], experts: [] };

    // Build status filter
    const statusFilter = status ? 'AND submission_status = ?' : '';
    const statusParams = status ? [status] : [];

    if (!type || type === 'material') {
      const [materials] = await db.query(
        `SELECT *, 'material' as resource_type FROM material_resources
         WHERE submitted_by = ? ${statusFilter} ORDER BY submitted_at DESC`,
        [userId, ...statusParams]
      );
      results.materials = materials;
    }

    if (!type || type === 'organization') {
      const [organizations] = await db.query(
        `SELECT *, 'organization' as resource_type FROM organizations
         WHERE submitted_by = ? ${statusFilter} ORDER BY submitted_at DESC`,
        [userId, ...statusParams]
      );
      results.organizations = organizations;
    }

    if (!type || type === 'document') {
      const [documents] = await db.query(
        `SELECT *, 'document' as resource_type FROM document_resources
         WHERE submitted_by = ? ${statusFilter} ORDER BY submitted_at DESC`,
        [userId, ...statusParams]
      );
      results.documents = documents;
    }

    if (!type || type === 'expert') {
      const [experts] = await db.query(
        `SELECT *, 'expert' as resource_type FROM human_resources
         WHERE submitted_by = ? ${statusFilter} ORDER BY submitted_at DESC`,
        [userId, ...statusParams]
      );
      results.experts = experts;
    }

    // Calculate counts
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    ['materials', 'organizations', 'documents', 'experts'].forEach(key => {
      results[key].forEach(item => {
        counts.total++;
        if (item.submission_status === 'pending') counts.pending++;
        else if (item.submission_status === 'approved') counts.approved++;
        else if (item.submission_status === 'rejected') counts.rejected++;
      });
    });

    res.json({ success: true, data: results, counts });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// SUBMIT material (user) - with image upload
router.post('/submit/material', auth, (req, res) => {
  uploadMaterialImage(req, res, async (err) => {
    if (err) {
      console.error('Material image upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const userId = req.user.id;
      const {
        name, type, description, specifications, capacity, organization_id, status,
        latitude, longitude, region, city, address, contact_email, contact_phone
      } = req.body;

      if (!name || !type) {
        return res.status(400).json({ success: false, message: 'Name and type are required' });
      }

      // Handle uploaded image
      let imagePath = null;
      if (req.file) {
        imagePath = `/uploads/materials/${req.file.filename}`;
      }

      const [result] = await db.query(`
        INSERT INTO material_resources
        (name, type, description, specifications, capacity, organization_id, status,
         latitude, longitude, region, city, address, contact_email, contact_phone, image,
         submitted_by, submission_status, submitted_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0)
      `, [
        name, type, description,
        JSON.stringify(specifications || {}),
        capacity, organization_id || null, status || 'operational',
        latitude || null, longitude || null, region || null, city || null, address || null,
        contact_email || null, contact_phone || null, imagePath,
        userId
      ]);

      // Create notification for admin
      await createNotification(
        'resource_submission',
        'Nouvelle soumission de matériel',
        `${req.user.email} a soumis un nouveau matériel: ${name}`,
        'material',
        result.insertId,
        userId
      );

      const [newMaterial] = await db.query('SELECT * FROM material_resources WHERE id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: newMaterial[0], message: 'Material submitted for validation' });
    } catch (error) {
      console.error('Submit material error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// SUBMIT organization (user) - with logo upload
router.post('/submit/organization', auth, (req, res) => {
  uploadOrganizationLogo(req, res, async (err) => {
    if (err) {
      console.error('Organization logo upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const userId = req.user.id;
      const {
        name, acronym, type, description, mission, website,
        latitude, longitude, region, city, address, contact_email, contact_phone
      } = req.body;

      if (!name || !type) {
        return res.status(400).json({ success: false, message: 'Name and type are required' });
      }

      // Handle uploaded logo
      let logoPath = null;
      if (req.file) {
        logoPath = `/uploads/organizations/${req.file.filename}`;
      }

      const [result] = await db.query(`
        INSERT INTO organizations
        (name, acronym, type, description, mission, logo, website,
         latitude, longitude, region, city, address, contact_email, contact_phone,
         submitted_by, submission_status, submitted_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0)
      `, [
        name, acronym || null, type, description || null, mission || null, logoPath, website || null,
        latitude || null, longitude || null, region || null, city || null, address || null,
        contact_email || null, contact_phone || null,
        userId
      ]);

      await createNotification(
        'resource_submission',
        'Nouvelle soumission d\'organisme',
        `${req.user.email} a soumis un nouvel organisme: ${name}`,
        'organization',
        result.insertId,
        userId
      );

      const [newOrg] = await db.query('SELECT * FROM organizations WHERE id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: newOrg[0], message: 'Organization submitted for validation' });
    } catch (error) {
      console.error('Submit organization error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// SUBMIT document (user) - with file and thumbnail uploads
router.post('/submit/document', auth, (req, res) => {
  uploadDocumentFiles(req, res, async (err) => {
    if (err) {
      console.error('Document upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const userId = req.user.id;
      const {
        title, type, description, external_url,
        publication_date, language, themes, organization_id, access_level
      } = req.body;

      if (!title || !type) {
        return res.status(400).json({ success: false, message: 'Title and type are required' });
      }

      // Handle uploaded files
      let filePath = null;
      let fileType = null;
      let fileSize = null;
      let thumbnailPath = null;

      if (req.files) {
        if (req.files['file'] && req.files['file'][0]) {
          const uploadedFile = req.files['file'][0];
          filePath = `/uploads/documents/files/${uploadedFile.filename}`;
          fileType = uploadedFile.mimetype;
          fileSize = uploadedFile.size;
        }
        if (req.files['thumbnail'] && req.files['thumbnail'][0]) {
          thumbnailPath = `/uploads/thumbnails/${req.files['thumbnail'][0].filename}`;
        }
      }

      // If no file uploaded, use external URL if provided
      if (!filePath && external_url) {
        filePath = external_url;
      }

      // Generate slug
      const slug = title.toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 200) + '-' + Date.now();

      const [result] = await db.query(`
        INSERT INTO document_resources
        (title, slug, type, description, file_path, file_type, file_size, thumbnail,
         publication_date, language, themes, organization_id,
         submitted_by, submission_status, submitted_at, is_active, access_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0, ?)
      `, [
        title, slug, type, description || null, filePath, fileType, fileSize, thumbnailPath,
        publication_date || null, language || 'fr', JSON.stringify(themes || []), organization_id || null,
        userId, access_level || 'public'
      ]);

      await createNotification(
        'resource_submission',
        'Nouvelle soumission de document',
        `${req.user.email} a soumis un nouveau document: ${title}`,
        'document',
        result.insertId,
        userId
      );

      const [newDoc] = await db.query('SELECT * FROM document_resources WHERE id = ?', [result.insertId]);
      res.status(201).json({ success: true, data: newDoc[0], message: 'Document submitted for validation' });
    } catch (error) {
      console.error('Submit document error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// SUBMIT expert registration (user registers themselves) - with photo and CV uploads
router.post('/submit/expert', auth, (req, res) => {
  uploadExpertFiles(req, res, async (err) => {
    if (err) {
      console.error('Expert file upload error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const userId = req.user.id;
      const {
        first_name, last_name, title, category, organization_id,
        email, phone, biography, expertise_domains, qualifications, expertise_summary,
        latitude, longitude, region, city, address,
        years_experience, linkedin_url, twitter_url, orcid_id, google_scholar_url, researchgate_url, website,
        publications_count, projects_count, consultation_rate, awards, research_interests,
        available_for_collaboration
      } = req.body;

      // Parse selected_expertise_ids if it's a string (from FormData)
      let selected_expertise_ids = req.body.selected_expertise_ids;
      if (typeof selected_expertise_ids === 'string') {
        try {
          selected_expertise_ids = JSON.parse(selected_expertise_ids);
        } catch (e) {
          selected_expertise_ids = [];
        }
      }

      if (!first_name || !last_name || !category) {
        return res.status(400).json({ success: false, message: 'First name, last name and category are required' });
      }

      // Handle uploaded files
      let photoPath = null;
      let cvPath = null;

      if (req.files) {
        if (req.files['photo'] && req.files['photo'][0]) {
          photoPath = `/uploads/experts/${req.files['photo'][0].filename}`;
        }
        if (req.files['cv'] && req.files['cv'][0]) {
          cvPath = `/uploads/documents/${req.files['cv'][0].filename}`;
        }
      }

      const [result] = await db.query(`
        INSERT INTO human_resources
        (first_name, last_name, title, category, organization_id, email, phone, photo, cv_url, biography,
         expertise_domains, qualifications, expertise_summary, latitude, longitude, region, city, address,
         years_experience, linkedin_url, twitter_url, orcid_id, google_scholar_url, researchgate_url, website,
         publications_count, projects_count, consultation_rate, awards, research_interests,
         available_for_collaboration, submitted_by, submission_status, submitted_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0)
      `, [
        first_name, last_name, title || null, category, organization_id || null,
        email || req.user.email, phone || null, photoPath, cvPath, biography || null,
        JSON.stringify(expertise_domains || []),
        JSON.stringify(qualifications || []),
        expertise_summary || null,
        latitude || null, longitude || null, region || null, city || null, address || null,
        years_experience || 0, linkedin_url || null, twitter_url || null, orcid_id || null, google_scholar_url || null,
        researchgate_url || null, website || null,
        publications_count || 0, projects_count || 0, consultation_rate || null, awards || null, research_interests || null,
        available_for_collaboration === 'true' || available_for_collaboration === true ? 1 : 0,
        userId
      ]);

      const expertId = result.insertId;

      // Save expertise domains relationship
      if (selected_expertise_ids && Array.isArray(selected_expertise_ids) && selected_expertise_ids.length > 0) {
        const expertiseValues = selected_expertise_ids.map(e => [
          expertId,
          typeof e === 'object' ? e.domain_id : e,
          typeof e === 'object' ? e.level || 'intermediate' : 'intermediate',
          typeof e === 'object' ? e.years_in_domain : null
        ]);
        await db.query(
          'INSERT INTO expert_expertise (expert_id, expertise_domain_id, level, years_in_domain) VALUES ?',
          [expertiseValues]
        );
      }

      await createNotification(
        'expert_registration',
        'Nouvelle inscription expert',
        `${req.user.email} s'est inscrit comme expert: ${first_name} ${last_name}`,
        'expert',
        expertId,
        userId
      );

      const [newExpert] = await db.query('SELECT * FROM human_resources WHERE id = ?', [expertId]);
      res.status(201).json({ success: true, data: newExpert[0], message: 'Expert registration submitted for validation' });
    } catch (error) {
      console.error('Submit expert error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// ==================== ADMIN ENDPOINTS ====================

const ADMIN_TABLE_MAP = {
  expert: 'human_resources',
  organization: 'organizations',
  material: 'material_resources',
  document: 'document_resources',
};

// GET /admin/pending - List pending entries with pagination
router.get('/admin/pending', auth, authorize('admin'), async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let results = [];
    let totalCount = 0;

    // Query pending experts
    if (!type || type === 'expert') {
      const [[{ total: eTotal }]] = await db.query("SELECT COUNT(*) as total FROM human_resources WHERE submission_status = 'pending'");
      const [experts] = await db.query(`
        SELECT h.*, 'expert' as resource_type, CONCAT(h.first_name, ' ', h.last_name) as display_name,
               u.username as submitter_username, u.email as submitter_email
        FROM human_resources h LEFT JOIN users u ON h.submitted_by = u.id
        WHERE h.submission_status = 'pending' ORDER BY h.submitted_at ASC
      `);
      results = results.concat(experts);
      totalCount += eTotal;
    }

    // Query pending organizations
    if (!type || type === 'organization') {
      const [[{ total: oTotal }]] = await db.query("SELECT COUNT(*) as total FROM organizations WHERE submission_status = 'pending'");
      const [orgs] = await db.query(`
        SELECT o.*, 'organization' as resource_type, o.name as display_name,
               u.username as submitter_username, u.email as submitter_email
        FROM organizations o LEFT JOIN users u ON o.submitted_by = u.id
        WHERE o.submission_status = 'pending' ORDER BY o.submitted_at ASC
      `);
      results = results.concat(orgs);
      totalCount += oTotal;
    }

    // Query pending materials
    if (!type || type === 'material') {
      const [[{ total: mTotal }]] = await db.query("SELECT COUNT(*) as total FROM material_resources WHERE submission_status = 'pending'");
      const [materials] = await db.query(`
        SELECT m.*, 'material' as resource_type, m.name as display_name,
               u.username as submitter_username, u.email as submitter_email
        FROM material_resources m LEFT JOIN users u ON m.submitted_by = u.id
        WHERE m.submission_status = 'pending' ORDER BY m.submitted_at ASC
      `);
      results = results.concat(materials);
      totalCount += mTotal;
    }

    // Query pending documents
    if (!type || type === 'document') {
      const [[{ total: dTotal }]] = await db.query("SELECT COUNT(*) as total FROM document_resources WHERE submission_status = 'pending'");
      const [docs] = await db.query(`
        SELECT d.*, 'document' as resource_type, d.title as display_name,
               u.username as submitter_username, u.email as submitter_email
        FROM document_resources d LEFT JOIN users u ON d.submitted_by = u.id
        WHERE d.submission_status = 'pending' ORDER BY d.submitted_at ASC
      `);
      results = results.concat(docs);
      totalCount += dTotal;
    }

    // Sort by submission date and paginate
    results.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
    const paginatedResults = results.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: paginatedResults,
      totalPending: totalCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get pending entries error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /admin/pending/count - Count pending entries (for sidebar badge)
router.get('/admin/pending/count', auth, async (req, res) => {
  try {
    const [[{ c1 }]] = await db.query("SELECT COUNT(*) as c1 FROM organizations WHERE submission_status = 'pending'");
    const [[{ c2 }]] = await db.query("SELECT COUNT(*) as c2 FROM human_resources WHERE submission_status = 'pending'");
    const [[{ c3 }]] = await db.query("SELECT COUNT(*) as c3 FROM material_resources WHERE submission_status = 'pending'");
    const [[{ c4 }]] = await db.query("SELECT COUNT(*) as c4 FROM document_resources WHERE submission_status = 'pending'");

    res.json({
      success: true,
      count: c1 + c2 + c3 + c4,
      byType: { organizations: c1, experts: c2, materials: c3, documents: c4 }
    });
  } catch (error) {
    console.error('Get pending count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /admin/:id - Full detail of any entry for admin
router.get('/admin/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // expert, organization, material, document

    if (!type || !ADMIN_TABLE_MAP[type]) {
      return res.status(400).json({ success: false, message: 'Query param "type" required: expert|organization|material|document' });
    }

    const table = ADMIN_TABLE_MAP[type];
    const [rows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    const entry = rows[0];

    // Enrich based on type
    if (type === 'expert') {
      const [expertises] = await db.query(`
        SELECT ed.*, ee.level, ee.years_in_domain
        FROM expertise_domains ed
        INNER JOIN expert_expertise ee ON ed.id = ee.expertise_domain_id
        WHERE ee.expert_id = ?
      `, [id]);
      entry.expertises = expertises;

      if (entry.organization_id) {
        const [orgs] = await db.query('SELECT id, name, acronym FROM organizations WHERE id = ?', [entry.organization_id]);
        entry.organization = orgs[0] || null;
      }
    }

    if (type === 'organization') {
      const [[{ expertCount }]] = await db.query(
        'SELECT COUNT(*) as expertCount FROM human_resources WHERE organization_id = ? AND is_active = 1', [id]
      );
      entry.expert_count = expertCount;

      if (entry.parent_organization_id) {
        const [parents] = await db.query('SELECT id, name, acronym FROM organizations WHERE id = ?', [entry.parent_organization_id]);
        entry.parent = parents[0] || null;
      }

      const [children] = await db.query('SELECT id, name, acronym, type FROM organizations WHERE parent_organization_id = ?', [id]);
      entry.children = children;
    }

    // Get submitter info
    if (entry.submitted_by) {
      const [users] = await db.query('SELECT id, username, email FROM users WHERE id = ?', [entry.submitted_by]);
      entry.submitter = users[0] || null;
    }

    // Get validator info
    if (entry.validated_by) {
      const [users] = await db.query('SELECT id, username, email FROM users WHERE id = ?', [entry.validated_by]);
      entry.validator = users[0] || null;
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    console.error('Admin get entry error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /admin/:id - Update any entry (admin)
router.put('/admin/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, ...fields } = req.body;

    if (!type || !ADMIN_TABLE_MAP[type]) {
      return res.status(400).json({ success: false, message: 'Field "type" required: expert|organization|material|document' });
    }

    const table = ADMIN_TABLE_MAP[type];

    // Get current entry
    const [existing] = await db.query(`SELECT id FROM ${table} WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    // Define allowed fields per type
    const allowedByType = {
      expert: [
        'first_name', 'last_name', 'title', 'category', 'specialization', 'organization_id',
        'email', 'phone', 'photo', 'biography', 'expertise_domains', 'qualifications',
        'latitude', 'longitude', 'region', 'city', 'country', 'country_code', 'address',
        'is_active', 'is_verified', 'years_experience', 'cv_url', 'linkedin_url',
        'twitter_url', 'website', 'languages', 'education', 'certifications',
        'publications_count', 'available_for_collaboration', 'expertise_summary',
        'show_email', 'show_phone',
      ],
      organization: [
        'name', 'acronym', 'type', 'description', 'mission', 'logo', 'website',
        'parent_organization_id', 'latitude', 'longitude', 'region', 'city',
        'country', 'country_code', 'address', 'contact_email', 'contact_phone',
        'whatsapp', 'social_links', 'domains', 'services', 'species_treated',
        'opening_hours', 'emergency_available', 'available_24_7', 'languages_spoken',
        'license_number', 'coverage_area', 'founded_year', 'staff_count',
        'veterinarians_count', 'is_active', 'show_email', 'show_phone', 'specialties',
      ],
      material: [
        'name', 'type', 'description', 'specifications', 'capacity', 'organization_id',
        'manager_id', 'latitude', 'longitude', 'region', 'city', 'address',
        'status', 'certifications', 'contact_email', 'contact_phone', 'is_active', 'image',
      ],
      document: [
        'title', 'type', 'description', 'content', 'file_path', 'file_type', 'file_size',
        'thumbnail', 'organization_id', 'publication_date', 'language', 'themes',
        'access_level', 'is_featured', 'is_active',
      ],
    };

    const jsonFields = ['expertise_domains', 'qualifications', 'languages', 'education',
      'certifications', 'social_links', 'domains', 'services', 'species_treated',
      'opening_hours', 'languages_spoken', 'specialties', 'specifications', 'themes'];

    const allowed = allowedByType[type] || [];
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(jsonFields.includes(key) && typeof value !== 'string' ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    params.push(id);
    await db.query(`UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Admin update entry error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /admin/:id/status - Approve or reject with reason
router.patch('/admin/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status, reason } = req.body;
    const adminId = req.user.id;

    if (!type || !ADMIN_TABLE_MAP[type]) {
      return res.status(400).json({ success: false, message: 'Field "type" required: expert|organization|material|document' });
    }
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be: approved, rejected, or pending' });
    }

    const table = ADMIN_TABLE_MAP[type];

    // Update status
    const isApproved = status === 'approved';
    await db.query(
      `UPDATE ${table} SET
        submission_status = ?,
        validated_by = ?,
        validated_at = NOW(),
        rejection_reason = ?,
        is_active = ?
      WHERE id = ?`,
      [status, adminId, status === 'rejected' ? (reason || null) : null, isApproved ? 1 : 0, id]
    );

    // Mark related notifications as read
    await db.query(
      `UPDATE admin_notifications SET is_read = 1, read_by = ?, read_at = NOW()
       WHERE resource_type = ? AND resource_id = ? AND is_read = 0`,
      [adminId, type, id]
    );

    const [updated] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    res.json({
      success: true,
      data: updated[0],
      message: status === 'approved' ? 'Entrée approuvée' : status === 'rejected' ? 'Entrée rejetée' : 'Statut mis à jour'
    });
  } catch (error) {
    console.error('Admin status change error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /admin/import - Import CSV data
const uploadCSV = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads', 'imports');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `import-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/csv', 'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(csv|xlsx?)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
}).single('file');

router.post('/admin/import', auth, authorize('admin'), (req, res) => {
  uploadCSV(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
      const { type } = req.body; // expert or organization
      if (!type || !['expert', 'organization'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Type must be "expert" or "organization"' });
      }

      // Read and parse CSV
      const content = fs.readFileSync(req.file.path, 'utf-8');
      const lines = content.split(/\r?\n/).filter(l => l.trim());

      if (lines.length < 2) {
        return res.status(400).json({ success: false, message: 'CSV file is empty or has no data rows' });
      }

      // Parse CSV with simple delimiter detection
      const delimiter = lines[0].includes(';') ? ';' : ',';
      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            inQuotes = !inQuotes;
          } else if (ch === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += ch;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
      const rows = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((h, i) => { row[h] = values[i] || ''; });
        return row;
      });

      let imported = 0;
      let skipped = 0;
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          if (type === 'organization') {
            const name = row.name || row.nom || row.organisation;
            if (!name) { skipped++; errors.push(`Row ${i + 2}: Missing name`); continue; }

            await db.query(`
              INSERT INTO organizations (name, acronym, type, description, city, country, country_code,
                contact_email, contact_phone, website, address, region, submission_status, is_active)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1)
            `, [
              name,
              row.acronym || row.sigle || null,
              row.type || row.type_organisation || 'other',
              row.description || null,
              row.city || row.ville || null,
              row.country || row.pays || null,
              row.country_code || row.code_pays || null,
              row.email || row.contact_email || null,
              row.phone || row.telephone || row.contact_phone || null,
              row.website || row.site_web || null,
              row.address || row.adresse || null,
              row.region || null,
            ]);
            imported++;
          } else if (type === 'expert') {
            const firstName = row.first_name || row.prenom || '';
            const lastName = row.last_name || row.nom || row.nom_famille || '';
            if (!firstName && !lastName) { skipped++; errors.push(`Row ${i + 2}: Missing name`); continue; }

            await db.query(`
              INSERT INTO human_resources (first_name, last_name, title, category, specialization,
                email, phone, city, country, country_code, region, biography,
                years_experience, submission_status, is_active)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1)
            `, [
              firstName, lastName,
              row.title || row.titre || null,
              row.category || row.categorie || 'veterinarian',
              row.specialization || row.specialisation || row.specialite || null,
              row.email || null,
              row.phone || row.telephone || null,
              row.city || row.ville || null,
              row.country || row.pays || null,
              row.country_code || row.code_pays || null,
              row.region || null,
              row.biography || row.biographie || row.bio || null,
              parseInt(row.years_experience || row.experience) || 0,
            ]);
            imported++;
          }
        } catch (rowError) {
          skipped++;
          errors.push(`Row ${i + 2}: ${rowError.message}`);
        }
      }

      // Clean up uploaded file
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }

      res.json({
        success: true,
        message: `Import terminé: ${imported} entrées importées, ${skipped} ignorées`,
        data: { imported, skipped, total: rows.length, errors: errors.slice(0, 20) }
      });
    } catch (error) {
      console.error('Admin import error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// ==================== ADMIN VALIDATION (legacy) ====================

// GET pending submissions (admin) - Legacy endpoint kept for backward compat
router.get('/admin/pending-submissions', auth, authorize('admin'), async (req, res) => {
  try {
    const { type } = req.query;

    let results = { materials: [], organizations: [], documents: [], experts: [] };

    if (!type || type === 'material') {
      const [materials] = await db.query(`
        SELECT m.*, u.username as submitter_username, u.email as submitter_email
        FROM material_resources m
        LEFT JOIN users u ON m.submitted_by = u.id
        WHERE m.submission_status = 'pending'
        ORDER BY m.submitted_at ASC
      `);
      results.materials = materials;
    }

    if (!type || type === 'organization') {
      const [organizations] = await db.query(`
        SELECT o.*, u.username as submitter_username, u.email as submitter_email
        FROM organizations o
        LEFT JOIN users u ON o.submitted_by = u.id
        WHERE o.submission_status = 'pending'
        ORDER BY o.submitted_at ASC
      `);
      results.organizations = organizations;
    }

    if (!type || type === 'document') {
      const [documents] = await db.query(`
        SELECT d.*, u.username as submitter_username, u.email as submitter_email
        FROM document_resources d
        LEFT JOIN users u ON d.submitted_by = u.id
        WHERE d.submission_status = 'pending'
        ORDER BY d.submitted_at ASC
      `);
      results.documents = documents;
    }

    if (!type || type === 'expert') {
      const [experts] = await db.query(`
        SELECT h.*, u.username as submitter_username, u.email as submitter_email
        FROM human_resources h
        LEFT JOIN users u ON h.submitted_by = u.id
        WHERE h.submission_status = 'pending'
        ORDER BY h.submitted_at ASC
      `);
      results.experts = experts;
    }

    const totalPending = results.materials.length + results.organizations.length +
                         results.documents.length + results.experts.length;

    res.json({ success: true, data: results, totalPending });
  } catch (error) {
    console.error('Get pending submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// APPROVE submission (admin)
router.put('/admin/approve/:resourceType/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { resourceType, id } = req.params;
    const adminId = req.user.id;

    const tableMap = {
      material: 'material_resources',
      organization: 'organizations',
      document: 'document_resources',
      expert: 'human_resources'
    };

    const table = tableMap[resourceType];
    if (!table) {
      return res.status(400).json({ success: false, message: 'Invalid resource type' });
    }

    await db.query(
      `UPDATE ${table} SET submission_status = 'approved', validated_by = ?, validated_at = NOW(), is_active = 1 WHERE id = ?`,
      [adminId, id]
    );

    // Mark related notification as read
    await db.query(
      `UPDATE admin_notifications SET is_read = 1, read_by = ?, read_at = NOW()
       WHERE resource_type = ? AND resource_id = ? AND is_read = 0`,
      [adminId, resourceType, id]
    );

    res.json({ success: true, message: 'Submission approved' });
  } catch (error) {
    console.error('Approve submission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// REJECT submission (admin)
router.put('/admin/reject/:resourceType/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { resourceType, id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const tableMap = {
      material: 'material_resources',
      organization: 'organizations',
      document: 'document_resources',
      expert: 'human_resources'
    };

    const table = tableMap[resourceType];
    if (!table) {
      return res.status(400).json({ success: false, message: 'Invalid resource type' });
    }

    await db.query(
      `UPDATE ${table} SET submission_status = 'rejected', validated_by = ?, validated_at = NOW(), rejection_reason = ? WHERE id = ?`,
      [adminId, reason || null, id]
    );

    // Mark related notification as read
    await db.query(
      `UPDATE admin_notifications SET is_read = 1, read_by = ?, read_at = NOW()
       WHERE resource_type = ? AND resource_id = ? AND is_read = 0`,
      [adminId, resourceType, id]
    );

    res.json({ success: true, message: 'Submission rejected' });
  } catch (error) {
    console.error('Reject submission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== ADMIN NOTIFICATIONS ====================

// GET notifications (admin)
router.get('/admin/notifications', auth, authorize('admin'), async (req, res) => {
  try {
    const { limit = 20, unread_only } = req.query;

    let query = 'SELECT * FROM admin_notifications';
    const params = [];

    if (unread_only === 'true') {
      query += ' WHERE is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [notifications] = await db.query(query, params);

    // Get unread count
    const [[{ unreadCount }]] = await db.query('SELECT COUNT(*) as unreadCount FROM admin_notifications WHERE is_read = 0');

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET notification count (for badge)
router.get('/admin/notifications/count', auth, async (req, res) => {
  try {
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM admin_notifications WHERE is_read = 0');
    res.json({ success: true, count });
  } catch (error) {
    console.error('Get notification count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark notification as read
router.put('/admin/notifications/:id/read', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query(
      'UPDATE admin_notifications SET is_read = 1, read_by = ?, read_at = NOW() WHERE id = ?',
      [req.user.id, req.params.id]
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/admin/notifications/read-all', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query(
      'UPDATE admin_notifications SET is_read = 1, read_by = ?, read_at = NOW() WHERE is_read = 0',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// UNIFIED GET /:id - Public detail for any entry
// =====================================================
// IMPORTANT: This must be AFTER all other routes since /:id is a catch-all pattern

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    // Validate numeric ID
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    let entry = null;
    let resourceType = null;

    // If type is specified, search only that table
    if (type === 'expert') {
      const [rows] = await db.query(`
        SELECT h.*, 'expert' as resource_type,
               CONCAT(h.first_name, ' ', h.last_name) as name,
               h.biography as bio,
               u.username as submitter_username
        FROM human_resources h
        LEFT JOIN users u ON h.submitted_by = u.id
        WHERE h.id = ? AND h.is_active = 1
      `, [id]);
      if (rows.length) { entry = rows[0]; resourceType = 'expert'; }
    } else if (type === 'organization') {
      const [rows] = await db.query(`
        SELECT o.*, 'organization' as resource_type,
               o.contact_email as email,
               o.contact_phone as phone,
               o.type as organization_type,
               u.username as submitter_username
        FROM organizations o
        LEFT JOIN users u ON o.submitted_by = u.id
        WHERE o.id = ? AND o.is_active = 1
      `, [id]);
      if (rows.length) { entry = rows[0]; resourceType = 'organization'; }
    } else {
      // No type specified — search both tables (experts first, then organizations)
      const [experts] = await db.query(`
        SELECT h.*, 'expert' as resource_type,
               CONCAT(h.first_name, ' ', h.last_name) as name,
               h.biography as bio,
               u.username as submitter_username
        FROM human_resources h
        LEFT JOIN users u ON h.submitted_by = u.id
        WHERE h.id = ? AND h.is_active = 1
      `, [id]);

      if (experts.length) {
        entry = experts[0];
        resourceType = 'expert';
      } else {
        const [orgs] = await db.query(`
          SELECT o.*, 'organization' as resource_type,
                 o.contact_email as email,
                 o.contact_phone as phone,
                 o.type as organization_type,
                 u.username as submitter_username
          FROM organizations o
          LEFT JOIN users u ON o.submitted_by = u.id
          WHERE o.id = ? AND o.is_active = 1
        `, [id]);
        if (orgs.length) { entry = orgs[0]; resourceType = 'organization'; }
      }
    }

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entrée introuvable' });
    }

    // Parse JSON fields
    const jsonFields = ['services', 'species_treated', 'opening_hours', 'languages_spoken',
                        'specialties', 'skills', 'experience', 'education', 'publications'];
    jsonFields.forEach(field => {
      if (entry[field] && typeof entry[field] === 'string') {
        try { entry[field] = JSON.parse(entry[field]); } catch (e) { /* keep as string */ }
      }
    });

    // Enrich experts with expertise domains
    if (resourceType === 'expert') {
      try {
        const [expertises] = await db.query(`
          SELECT ed.id, ed.name, ed.name_fr, ed.category
          FROM expert_expertise ee
          JOIN expertise_domains ed ON ee.domain_id = ed.id
          WHERE ee.expert_id = ?
        `, [id]);
        entry.expertises = expertises;
      } catch (e) {
        entry.expertises = [];
      }
    }

    // Enrich organizations with members/staff count
    if (resourceType === 'organization') {
      try {
        const [[{ memberCount }]] = await db.query(
          'SELECT COUNT(*) as memberCount FROM human_resources WHERE organization_id = ? AND is_active = 1',
          [id]
        );
        entry.member_count = memberCount;
      } catch (e) {
        entry.member_count = 0;
      }
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    console.error('Get entry by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// UNIFIED POST / - Public submission from frontend form
// =====================================================

router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.body;

    if (!type || !['expert', 'organization'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be "expert" or "organization"' });
    }

    let insertId;

    if (type === 'expert') {
      const {
        name, specialization, skills, years_experience, bio,
        education_text, experience_text,
        country, city, address, email, phone,
        show_email, show_phone
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Le nom est obligatoire' });
      }

      // Split name into first_name / last_name
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const [result] = await db.query(`
        INSERT INTO human_resources
        (first_name, last_name, specialization, email, phone, city, country,
         address, biography, years_experience,
         show_email, show_phone, submitted_by, submission_status, submitted_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0)
      `, [
        firstName, lastName,
        specialization || null,
        email || null,
        phone || null,
        city || null,
        country || null,
        address || null,
        bio || null,
        years_experience ? parseInt(years_experience) : null,
        show_email !== false ? 1 : 0,
        show_phone !== false ? 1 : 0,
        userId,
      ]);

      insertId = result.insertId;

      // Store skills as JSON
      if (skills && Array.isArray(skills) && skills.length > 0) {
        await db.query('UPDATE human_resources SET skills = ? WHERE id = ?',
          [JSON.stringify(skills), insertId]);
      }

      // Store education/experience as text in biography if provided
      if (education_text || experience_text) {
        let fullBio = bio || '';
        if (education_text) fullBio += '\n\n--- Formation ---\n' + education_text;
        if (experience_text) fullBio += '\n\n--- Expérience ---\n' + experience_text;
        await db.query('UPDATE human_resources SET biography = ? WHERE id = ?',
          [fullBio.trim(), insertId]);
      }
    } else {
      // organization
      const {
        name, organization_type, description, services, website, founded_year, mission,
        country, city, address, email, phone,
        show_email, show_phone
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Le nom est obligatoire' });
      }

      const [result] = await db.query(`
        INSERT INTO organizations
        (name, type, description, contact_email, contact_phone, website, city, country,
         address, founded_year, mission, services,
         show_email, show_phone, submitted_by, submission_status, submitted_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), 0)
      `, [
        name.trim(),
        organization_type || 'other',
        description || null,
        email || null,
        phone || null,
        website || null,
        city || null,
        country || null,
        address || null,
        founded_year ? parseInt(founded_year) : null,
        mission || null,
        services && Array.isArray(services) ? JSON.stringify(services) : null,
        show_email !== false ? 1 : 0,
        show_phone !== false ? 1 : 0,
        userId,
      ]);

      insertId = result.insertId;
    }

    // Create admin notification
    try {
      await db.query(`
        INSERT INTO admin_notifications (type, title, message, resource_type, resource_id, created_by)
        VALUES ('resource_submission', ?, ?, ?, ?, ?)
      `, [
        `Nouvelle inscription ${type === 'expert' ? 'expert' : 'organisation'}`,
        `${req.user.email} a soumis une inscription: ${req.body.name}`,
        type, insertId, userId
      ]);
    } catch (e) {
      // Non-critical, don't fail the whole request
      console.error('Notification creation error:', e.message);
    }

    // Fetch and return the created entry
    const table = type === 'expert' ? 'human_resources' : 'organizations';
    const [created] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [insertId]);

    res.status(201).json({
      success: true,
      data: { id: insertId, ...created[0] },
      message: 'Votre inscription a été soumise et est en attente de validation'
    });
  } catch (error) {
    console.error('Submit entry error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
