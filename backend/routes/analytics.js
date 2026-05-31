const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');

// =====================================================
// HELPERS
// =====================================================

// Hash IP for privacy (same pattern as ads.js)
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip + (process.env.JWT_SECRET || 'secret')).digest('hex').substring(0, 16);
};

// Detect browser from user agent
const detectBrowser = (ua) => {
  if (!ua) return { browser: 'Unknown', version: '', os: 'Unknown' };
  const browsers = [
    { name: 'Edge', pattern: /Edg(?:e|A|iOS)?\/(\d+[\.\d]*)/ },
    { name: 'Opera', pattern: /(?:OPR|Opera)\/(\d+[\.\d]*)/ },
    { name: 'Samsung Internet', pattern: /SamsungBrowser\/(\d+[\.\d]*)/ },
    { name: 'UC Browser', pattern: /UCBrowser\/(\d+[\.\d]*)/ },
    { name: 'Firefox', pattern: /Firefox\/(\d+[\.\d]*)/ },
    { name: 'Chrome', pattern: /Chrome\/(\d+[\.\d]*)/ },
    { name: 'Safari', pattern: /Version\/(\d+[\.\d]*).*Safari/ },
    { name: 'IE', pattern: /(?:MSIE |Trident.*rv:)(\d+[\.\d]*)/ },
  ];
  for (const b of browsers) {
    const match = ua.match(b.pattern);
    if (match) return { browser: b.name, version: match[1] || '' };
  }
  return { browser: 'Other', version: '' };
};

// Detect OS from user agent
const detectOS = (ua) => {
  if (!ua) return 'Unknown';
  if (/Windows NT 10/i.test(ua)) return 'Windows 10+';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X/i.test(ua)) return 'macOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Linux/i.test(ua)) return 'Linux';
  if (/CrOS/i.test(ua)) return 'Chrome OS';
  return 'Other';
};

// Detect device type from user agent (same as ads.js)
const getDeviceType = (userAgent) => {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android(?!.*tablet)|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

// Country code to continent mapping
const countryToContinent = {
  // Africa
  DZ:'Afrique',AO:'Afrique',BJ:'Afrique',BW:'Afrique',BF:'Afrique',BI:'Afrique',CV:'Afrique',CM:'Afrique',CF:'Afrique',TD:'Afrique',KM:'Afrique',CG:'Afrique',CD:'Afrique',CI:'Afrique',DJ:'Afrique',EG:'Afrique',GQ:'Afrique',ER:'Afrique',SZ:'Afrique',ET:'Afrique',GA:'Afrique',GM:'Afrique',GH:'Afrique',GN:'Afrique',GW:'Afrique',KE:'Afrique',LS:'Afrique',LR:'Afrique',LY:'Afrique',MG:'Afrique',MW:'Afrique',ML:'Afrique',MR:'Afrique',MU:'Afrique',MA:'Afrique',MZ:'Afrique',NA:'Afrique',NE:'Afrique',NG:'Afrique',RW:'Afrique',ST:'Afrique',SN:'Afrique',SC:'Afrique',SL:'Afrique',SO:'Afrique',ZA:'Afrique',SS:'Afrique',SD:'Afrique',TZ:'Afrique',TG:'Afrique',TN:'Afrique',UG:'Afrique',ZM:'Afrique',ZW:'Afrique',
  // Europe
  AL:'Europe',AD:'Europe',AT:'Europe',BY:'Europe',BE:'Europe',BA:'Europe',BG:'Europe',HR:'Europe',CY:'Europe',CZ:'Europe',DK:'Europe',EE:'Europe',FI:'Europe',FR:'Europe',DE:'Europe',GR:'Europe',HU:'Europe',IS:'Europe',IE:'Europe',IT:'Europe',XK:'Europe',LV:'Europe',LI:'Europe',LT:'Europe',LU:'Europe',MT:'Europe',MD:'Europe',MC:'Europe',ME:'Europe',NL:'Europe',MK:'Europe',NO:'Europe',PL:'Europe',PT:'Europe',RO:'Europe',RU:'Europe',SM:'Europe',RS:'Europe',SK:'Europe',SI:'Europe',ES:'Europe',SE:'Europe',CH:'Europe',UA:'Europe',GB:'Europe',
  // Asia
  AF:'Asie',AM:'Asie',AZ:'Asie',BH:'Asie',BD:'Asie',BT:'Asie',BN:'Asie',KH:'Asie',CN:'Asie',GE:'Asie',IN:'Asie',ID:'Asie',IR:'Asie',IQ:'Asie',IL:'Asie',JP:'Asie',JO:'Asie',KZ:'Asie',KW:'Asie',KG:'Asie',LA:'Asie',LB:'Asie',MY:'Asie',MV:'Asie',MN:'Asie',MM:'Asie',NP:'Asie',KP:'Asie',OM:'Asie',PK:'Asie',PS:'Asie',PH:'Asie',QA:'Asie',SA:'Asie',SG:'Asie',KR:'Asie',LK:'Asie',SY:'Asie',TW:'Asie',TJ:'Asie',TH:'Asie',TL:'Asie',TR:'Asie',TM:'Asie',AE:'Asie',UZ:'Asie',VN:'Asie',YE:'Asie',
  // Americas
  AG:'Ameriques',AR:'Ameriques',BS:'Ameriques',BB:'Ameriques',BZ:'Ameriques',BO:'Ameriques',BR:'Ameriques',CA:'Ameriques',CL:'Ameriques',CO:'Ameriques',CR:'Ameriques',CU:'Ameriques',DM:'Ameriques',DO:'Ameriques',EC:'Ameriques',SV:'Ameriques',GD:'Ameriques',GT:'Ameriques',GY:'Ameriques',HT:'Ameriques',HN:'Ameriques',JM:'Ameriques',MX:'Ameriques',NI:'Ameriques',PA:'Ameriques',PY:'Ameriques',PE:'Ameriques',KN:'Ameriques',LC:'Ameriques',VC:'Ameriques',SR:'Ameriques',TT:'Ameriques',US:'Ameriques',UY:'Ameriques',VE:'Ameriques',
  // Oceania
  AU:'Oceanie',FJ:'Oceanie',KI:'Oceanie',MH:'Oceanie',FM:'Oceanie',NR:'Oceanie',NZ:'Oceanie',PW:'Oceanie',PG:'Oceanie',WS:'Oceanie',SB:'Oceanie',TO:'Oceanie',TV:'Oceanie',VU:'Oceanie',
};

const getContinent = (code) => countryToContinent[(code || '').toUpperCase()] || 'Autre';

// Build date filter clause
const getDateFilter = (period, column = 'created_at') => {
  const days = parseInt(period) || 30;
  return { clause: `${column} >= DATE_SUB(NOW(), INTERVAL ? DAY)`, params: [days] };
};

// =====================================================
// PUBLIC ENDPOINT - Tracking
// =====================================================

// @route   POST /api/analytics/track
// @desc    Track a page visit (called by public frontend)
// @access  Public
router.post('/track', async (req, res) => {
  try {
    const { page_url, page_title, page_type, referrer_url, visitor_id, session_id, country_code, country_name } = req.body;

    if (!page_url) {
      return res.status(400).json({ success: false, message: 'page_url required' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';
    const ipHashed = hashIP(ip);
    const { browser, version } = detectBrowser(ua);
    const os = detectOS(ua);
    const device = getDeviceType(ua);
    const continent = getContinent(country_code);

    // Extract referrer domain
    let referrerDomain = null;
    if (referrer_url) {
      try { referrerDomain = new URL(referrer_url).hostname; } catch(e) {}
    }

    await db.query(
      `INSERT INTO page_visits
       (visitor_id, session_id, ip_hash, page_url, page_title, page_type, referrer_url, referrer_domain, user_agent, device_type, browser, browser_version, os, country_code, country_name, continent, is_bounce)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        visitor_id || ipHashed,
        session_id || ipHashed + '_' + Date.now(),
        ipHashed,
        page_url.substring(0, 500),
        (page_title || '').substring(0, 255),
        page_type || 'other',
        referrer_url || null,
        referrerDomain,
        ua.substring(0, 1000),
        device,
        browser,
        version,
        os,
        (country_code || '').toUpperCase().substring(0, 2) || null,
        country_name || null,
        continent,
        1
      ]
    );

    // Update daily aggregation (upsert)
    await db.query(
      `INSERT INTO page_visits_daily (date, total_visits, unique_visitors, page_views, bounce_count, desktop_visits, mobile_visits, tablet_visits)
       VALUES (CURDATE(), 1, 1, 1, 1, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_visits = total_visits + 1,
         page_views = page_views + 1,
         bounce_count = bounce_count + 1,
         desktop_visits = desktop_visits + VALUES(desktop_visits),
         mobile_visits = mobile_visits + VALUES(mobile_visits),
         tablet_visits = tablet_visits + VALUES(tablet_visits)`,
      [device === 'desktop' ? 1 : 0, device === 'mobile' ? 1 : 0, device === 'tablet' ? 1 : 0]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// PROTECTED ENDPOINTS - Analytics Dashboard
// =====================================================

// @route   GET /api/analytics/overview
// @desc    Get KPI overview stats
// @access  Private
router.get('/overview', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 30;

    // Current period
    const [current] = await db.query(
      `SELECT
        COUNT(*) as total_visits,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        COUNT(*) as page_views,
        ROUND(SUM(is_bounce) / COUNT(*) * 100, 1) as bounce_rate
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [period]
    );

    // Previous period (for comparison)
    const [previous] = await db.query(
      `SELECT
        COUNT(*) as total_visits,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        COUNT(*) as page_views,
        ROUND(SUM(is_bounce) / COUNT(*) * 100, 1) as bounce_rate
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [period * 2, period]
    );

    const calc = (curr, prev) => {
      if (!prev || prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
    };

    res.json({
      success: true,
      data: {
        total_visits: current[0].total_visits || 0,
        unique_visitors: current[0].unique_visitors || 0,
        page_views: current[0].page_views || 0,
        bounce_rate: current[0].bounce_rate || 0,
        changes: {
          visits: calc(current[0].total_visits, previous[0].total_visits),
          visitors: calc(current[0].unique_visitors, previous[0].unique_visitors),
          page_views: calc(current[0].page_views, previous[0].page_views),
          bounce_rate: calc(current[0].bounce_rate || 0, previous[0].bounce_rate || 0)
        }
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get visit trends over time
// @access  Private
router.get('/trends', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 30;
    const granularity = req.query.granularity || 'day';

    let dateFormat, groupBy;
    switch (granularity) {
      case 'week':
        dateFormat = '%x-W%v';
        groupBy = 'YEARWEEK(created_at, 1)';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        groupBy = "DATE_FORMAT(created_at, '%Y-%m')";
        break;
      default:
        dateFormat = '%Y-%m-%d';
        groupBy = 'DATE(created_at)';
    }

    const [rows] = await db.query(
      `SELECT
        DATE_FORMAT(created_at, ?) as date_label,
        ${groupBy} as date_group,
        COUNT(*) as visits,
        COUNT(DISTINCT visitor_id) as unique_visitors
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY date_group, date_label
       ORDER BY date_group ASC`,
      [dateFormat, period]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/countries
// @desc    Get visits by country and continent
// @access  Private
router.get('/countries', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 30;
    const limit = parseInt(req.query.limit) || 20;

    // By country
    const [byCountry] = await db.query(
      `SELECT
        country_code, country_name, continent,
        COUNT(*) as visits,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        ROUND(SUM(is_bounce) / COUNT(*) * 100, 1) as bounce_rate
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND country_code IS NOT NULL
       GROUP BY country_code, country_name, continent
       ORDER BY visits DESC
       LIMIT ?`,
      [period, limit]
    );

    // Total for percentage calculation
    const [totalRow] = await db.query(
      `SELECT COUNT(*) as total FROM page_visits WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [period]
    );
    const total = totalRow[0].total || 1;

    // By continent
    const [byContinent] = await db.query(
      `SELECT
        continent,
        COUNT(*) as visits,
        COUNT(DISTINCT visitor_id) as unique_visitors
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND continent IS NOT NULL
       GROUP BY continent
       ORDER BY visits DESC`,
      [period]
    );

    res.json({
      success: true,
      data: {
        countries: byCountry.map(c => ({ ...c, percentage: Math.round(c.visits / total * 1000) / 10 })),
        continents: byContinent.map(c => ({ ...c, percentage: Math.round(c.visits / total * 1000) / 10 })),
        total
      }
    });
  } catch (error) {
    console.error('Analytics countries error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/browsers
// @desc    Get visits by browser, device, OS
// @access  Private
router.get('/browsers', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 30;

    const [totalRow] = await db.query(
      `SELECT COUNT(*) as total FROM page_visits WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [period]
    );
    const total = totalRow[0].total || 1;

    // By browser
    const [byBrowser] = await db.query(
      `SELECT browser, COUNT(*) as visits
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY browser ORDER BY visits DESC LIMIT 10`,
      [period]
    );

    // By device
    const [byDevice] = await db.query(
      `SELECT device_type, COUNT(*) as visits
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY device_type ORDER BY visits DESC`,
      [period]
    );

    // By OS
    const [byOS] = await db.query(
      `SELECT os, COUNT(*) as visits
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY os ORDER BY visits DESC LIMIT 10`,
      [period]
    );

    const addPct = (arr) => arr.map(r => ({ ...r, percentage: Math.round(r.visits / total * 1000) / 10 }));

    res.json({
      success: true,
      data: {
        browsers: addPct(byBrowser),
        devices: addPct(byDevice),
        os: addPct(byOS)
      }
    });
  } catch (error) {
    console.error('Analytics browsers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/pages
// @desc    Get most visited pages
// @access  Private
router.get('/pages', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 30;
    const limit = parseInt(req.query.limit) || 15;

    const [rows] = await db.query(
      `SELECT
        page_url, page_title, page_type,
        COUNT(*) as visits,
        COUNT(DISTINCT visitor_id) as unique_visitors
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY page_url, page_title, page_type
       ORDER BY visits DESC
       LIMIT ?`,
      [period, limit]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Analytics pages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/hourly
// @desc    Get hourly distribution
// @access  Private
router.get('/hourly', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 30;

    const [rows] = await db.query(
      `SELECT
        HOUR(created_at) as hour,
        COUNT(*) as visits,
        COUNT(DISTINCT visitor_id) as unique_visitors
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY HOUR(created_at)
       ORDER BY hour ASC`,
      [period]
    );

    // Fill all 24 hours
    const hourly = Array.from({ length: 24 }, (_, i) => {
      const found = rows.find(r => r.hour === i);
      return { hour: i, visits: found?.visits || 0, unique_visitors: found?.unique_visitors || 0 };
    });

    res.json({ success: true, data: hourly });
  } catch (error) {
    console.error('Analytics hourly error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/comparison
// @desc    Get current vs previous period data for overlay chart
// @access  Private
router.get('/comparison', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 30;

    // Current period - day by day
    const [current] = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as visits, COUNT(DISTINCT visitor_id) as unique_visitors
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [period]
    );

    // Previous period - day by day
    const [previous] = await db.query(
      `SELECT DATE(created_at) as date, COUNT(*) as visits, COUNT(DISTINCT visitor_id) as unique_visitors
       FROM page_visits
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [period * 2, period]
    );

    res.json({
      success: true,
      data: {
        current: current,
        previous: previous
      }
    });
  } catch (error) {
    console.error('Analytics comparison error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/analytics/export
// @desc    Get data formatted for CSV export
// @access  Private
router.get('/export', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const period = parseInt(req.query.period) || 30;
    const type = req.query.type || 'countries';

    let rows;
    switch (type) {
      case 'countries': {
        const [data] = await db.query(
          `SELECT country_code, country_name, continent, COUNT(*) as visits, COUNT(DISTINCT visitor_id) as unique_visitors,
           ROUND(SUM(is_bounce)/COUNT(*)*100,1) as bounce_rate
           FROM page_visits WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND country_code IS NOT NULL
           GROUP BY country_code, country_name, continent ORDER BY visits DESC`,
          [period]
        );
        rows = data;
        break;
      }
      case 'pages': {
        const [data] = await db.query(
          `SELECT page_url, page_title, page_type, COUNT(*) as visits, COUNT(DISTINCT visitor_id) as unique_visitors
           FROM page_visits WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
           GROUP BY page_url, page_title, page_type ORDER BY visits DESC`,
          [period]
        );
        rows = data;
        break;
      }
      case 'daily': {
        const [data] = await db.query(
          `SELECT DATE(created_at) as date, COUNT(*) as visits, COUNT(DISTINCT visitor_id) as unique_visitors,
           SUM(device_type='desktop') as desktop, SUM(device_type='mobile') as mobile, SUM(device_type='tablet') as tablet
           FROM page_visits WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
           GROUP BY DATE(created_at) ORDER BY date ASC`,
          [period]
        );
        rows = data;
        break;
      }
      default:
        rows = [];
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
