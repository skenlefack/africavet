const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/db');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

// Helper: Hash IP for privacy
const hashIP = (ip) => {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex').substring(0, 16);
};

// Helper: Detect device type from user agent
const getDeviceType = (userAgent) => {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

// Helper: Check if ad is currently active
const isAdActive = (ad) => {
  if (ad.status !== 'active' && ad.status !== 'scheduled') return false;
  const now = new Date();
  if (ad.start_date && new Date(ad.start_date) > now) return false;
  if (ad.end_date && new Date(ad.end_date) < now) return false;
  return true;
};

// =====================================================
// PLACEMENTS ENDPOINTS
// =====================================================

// @route   GET /api/ads/placements
// @desc    Get all ad placements
// @access  Public (basic info) / Private (full info)
router.get('/placements', optionalAuth, async (req, res) => {
  try {
    const isAdmin = req.user && ['admin', 'editor'].includes(req.user.role);

    let query = `SELECT * FROM ad_placements`;
    if (!isAdmin) {
      query += ` WHERE is_active = 1`;
    }
    query += ` ORDER BY name ASC`;

    const [placements] = await db.query(query);

    res.json({ success: true, data: placements });
  } catch (error) {
    console.error('Get placements error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/ads/placements/:id
// @desc    Get single placement
// @access  Private (admin)
router.get('/placements/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const [placements] = await db.query('SELECT * FROM ad_placements WHERE id = ?', [id]);

    if (placements.length === 0) {
      return res.status(404).json({ success: false, message: 'Emplacement non trouve' });
    }

    res.json({ success: true, data: placements[0] });
  } catch (error) {
    console.error('Get placement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/ads/placements
// @desc    Create new placement
// @access  Private (admin)
router.post('/placements', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, name_fr, slug, location, width, height, max_ads, is_active } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Nom et slug requis' });
    }

    const [result] = await db.query(
      `INSERT INTO ad_placements (name, name_fr, slug, location, width, height, max_ads, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, name_fr || name, slug, location || '', width || 300, height || 250, max_ads || 1, is_active !== false ? 1 : 0]
    );

    const [newPlacement] = await db.query('SELECT * FROM ad_placements WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Emplacement cree', data: newPlacement[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Ce slug existe deja' });
    }
    console.error('Create placement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/ads/placements/:id
// @desc    Update placement
// @access  Private (admin)
router.put('/placements/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_fr, slug, location, width, height, max_ads, is_active } = req.body;

    const [existing] = await db.query('SELECT * FROM ad_placements WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Emplacement non trouve' });
    }

    await db.query(
      `UPDATE ad_placements SET
       name = COALESCE(?, name),
       name_fr = COALESCE(?, name_fr),
       slug = COALESCE(?, slug),
       location = COALESCE(?, location),
       width = COALESCE(?, width),
       height = COALESCE(?, height),
       max_ads = COALESCE(?, max_ads),
       is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, name_fr, slug, location, width, height, max_ads, is_active, id]
    );

    const [updated] = await db.query('SELECT * FROM ad_placements WHERE id = ?', [id]);

    res.json({ success: true, message: 'Emplacement mis a jour', data: updated[0] });
  } catch (error) {
    console.error('Update placement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/ads/placements/:id
// @desc    Delete placement
// @access  Private (admin)
router.delete('/placements/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if placement has ads
    const [ads] = await db.query('SELECT COUNT(*) as count FROM advertisements WHERE placement_id = ?', [id]);
    if (ads[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer: ${ads[0].count} publicite(s) utilisent cet emplacement`
      });
    }

    await db.query('DELETE FROM ad_placements WHERE id = ?', [id]);

    res.json({ success: true, message: 'Emplacement supprime' });
  } catch (error) {
    console.error('Delete placement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// PROVIDERS ENDPOINTS
// =====================================================

// @route   GET /api/ads/providers
// @desc    Get all ad providers
// @access  Private (admin)
router.get('/providers', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const [providers] = await db.query('SELECT * FROM ad_providers ORDER BY name ASC');

    // Parse JSON config
    providers.forEach(p => {
      try {
        p.config = JSON.parse(p.config || '{}');
      } catch (e) {
        p.config = {};
      }
    });

    res.json({ success: true, data: providers });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/ads/providers/:id
// @desc    Update provider config
// @access  Private (admin)
router.put('/providers/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, config } = req.body;

    await db.query(
      `UPDATE ad_providers SET
       name = COALESCE(?, name),
       description = COALESCE(?, description),
       is_active = COALESCE(?, is_active),
       config = COALESCE(?, config)
       WHERE id = ?`,
      [name, description, is_active, config ? JSON.stringify(config) : null, id]
    );

    const [updated] = await db.query('SELECT * FROM ad_providers WHERE id = ?', [id]);

    res.json({ success: true, message: 'Fournisseur mis a jour', data: updated[0] });
  } catch (error) {
    console.error('Update provider error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// ADVERTISEMENTS ENDPOINTS
// =====================================================

// @route   GET /api/ads
// @desc    Get all advertisements (admin)
// @access  Private (admin)
router.get('/', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      placement_id,
      provider_id,
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (status) {
      whereConditions.push('a.status = ?');
      params.push(status);
    }

    if (placement_id) {
      whereConditions.push('a.placement_id = ?');
      params.push(placement_id);
    }

    if (provider_id) {
      whereConditions.push('a.provider_id = ?');
      params.push(provider_id);
    }

    if (search) {
      whereConditions.push('(a.name LIKE ? OR a.advertiser_name LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM advertisements a ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get ads with stats
    const allowedSorts = ['created_at', 'name', 'status', 'priority', 'start_date'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [ads] = await db.query(
      `SELECT a.*,
              p.name as placement_name, p.slug as placement_slug,
              pr.name as provider_name, pr.type as provider_type,
              COALESCE(SUM(s.impressions), 0) as total_impressions,
              COALESCE(SUM(s.clicks), 0) as total_clicks
       FROM advertisements a
       LEFT JOIN ad_placements p ON a.placement_id = p.id
       LEFT JOIN ad_providers pr ON a.provider_id = pr.id
       LEFT JOIN ad_statistics s ON a.id = s.ad_id
       ${whereClause}
       GROUP BY a.id
       ORDER BY a.${sortField} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: ads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/ads/:id
// @desc    Get single advertisement
// @access  Private (admin)
router.get('/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;

    const [ads] = await db.query(
      `SELECT a.*,
              p.name as placement_name, p.slug as placement_slug, p.width as placement_width, p.height as placement_height,
              pr.name as provider_name, pr.type as provider_type
       FROM advertisements a
       LEFT JOIN ad_placements p ON a.placement_id = p.id
       LEFT JOIN ad_providers pr ON a.provider_id = pr.id
       WHERE a.id = ?`,
      [id]
    );

    if (ads.length === 0) {
      return res.status(404).json({ success: false, message: 'Publicite non trouvee' });
    }

    // Get total stats
    const [stats] = await db.query(
      `SELECT COALESCE(SUM(impressions), 0) as total_impressions,
              COALESCE(SUM(clicks), 0) as total_clicks,
              COALESCE(SUM(unique_impressions), 0) as total_unique_impressions,
              COALESCE(SUM(unique_clicks), 0) as total_unique_clicks
       FROM ad_statistics WHERE ad_id = ?`,
      [id]
    );

    const ad = ads[0];
    ad.stats = stats[0];

    res.json({ success: true, data: ad });
  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/ads
// @desc    Create new advertisement
// @access  Private (admin)
router.post('/', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const {
      name, placement_id, provider_id, type,
      image_url, image_url_mobile, target_url, alt_text, ad_code,
      adsense_client, adsense_slot,
      status, start_date, end_date,
      priority, weight,
      advertiser_name, advertiser_email, advertiser_phone,
      budget_type, budget_value,
      target_countries, target_devices,
      notes
    } = req.body;

    if (!name || !placement_id || !provider_id) {
      return res.status(400).json({ success: false, message: 'Nom, emplacement et fournisseur requis' });
    }

    const [result] = await db.query(
      `INSERT INTO advertisements (
        name, placement_id, provider_id, type,
        image_url, image_url_mobile, target_url, alt_text, ad_code,
        adsense_client, adsense_slot,
        status, start_date, end_date,
        priority, weight,
        advertiser_name, advertiser_email, advertiser_phone,
        budget_type, budget_value,
        target_countries, target_devices,
        notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, placement_id, provider_id, type || 'image',
        image_url, image_url_mobile, target_url, alt_text, ad_code,
        adsense_client, adsense_slot,
        status || 'draft', start_date || null, end_date || null,
        priority || 5, weight || 100,
        advertiser_name, advertiser_email, advertiser_phone,
        budget_type || 'unlimited', budget_value,
        target_countries ? JSON.stringify(target_countries) : null,
        target_devices ? JSON.stringify(target_devices) : null,
        notes, req.user.id
      ]
    );

    const [newAd] = await db.query('SELECT * FROM advertisements WHERE id = ?', [result.insertId]);

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'create', 'advertisement', result.insertId, JSON.stringify({ name })]
    );

    res.status(201).json({ success: true, message: 'Publicite creee', data: newAd[0] });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/ads/:id
// @desc    Update advertisement
// @access  Private (admin)
router.put('/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM advertisements WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Publicite non trouvee' });
    }

    const {
      name, placement_id, provider_id, type,
      image_url, image_url_mobile, target_url, alt_text, ad_code,
      adsense_client, adsense_slot,
      status, start_date, end_date,
      priority, weight,
      advertiser_name, advertiser_email, advertiser_phone,
      budget_type, budget_value,
      target_countries, target_devices,
      notes
    } = req.body;

    await db.query(
      `UPDATE advertisements SET
        name = COALESCE(?, name),
        placement_id = COALESCE(?, placement_id),
        provider_id = COALESCE(?, provider_id),
        type = COALESCE(?, type),
        image_url = ?,
        image_url_mobile = ?,
        target_url = ?,
        alt_text = ?,
        ad_code = ?,
        adsense_client = ?,
        adsense_slot = ?,
        status = COALESCE(?, status),
        start_date = ?,
        end_date = ?,
        priority = COALESCE(?, priority),
        weight = COALESCE(?, weight),
        advertiser_name = ?,
        advertiser_email = ?,
        advertiser_phone = ?,
        budget_type = COALESCE(?, budget_type),
        budget_value = ?,
        target_countries = ?,
        target_devices = ?,
        notes = ?
       WHERE id = ?`,
      [
        name, placement_id, provider_id, type,
        image_url, image_url_mobile, target_url, alt_text, ad_code,
        adsense_client, adsense_slot,
        status, start_date || null, end_date || null,
        priority, weight,
        advertiser_name, advertiser_email, advertiser_phone,
        budget_type, budget_value,
        target_countries ? JSON.stringify(target_countries) : null,
        target_devices ? JSON.stringify(target_devices) : null,
        notes, id
      ]
    );

    const [updated] = await db.query('SELECT * FROM advertisements WHERE id = ?', [id]);

    res.json({ success: true, message: 'Publicite mise a jour', data: updated[0] });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/ads/:id
// @desc    Delete advertisement
// @access  Private (admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const [ads] = await db.query('SELECT name FROM advertisements WHERE id = ?', [id]);
    if (ads.length === 0) {
      return res.status(404).json({ success: false, message: 'Publicite non trouvee' });
    }

    // Delete stats and events first (cascade should handle this but just in case)
    await db.query('DELETE FROM ad_statistics WHERE ad_id = ?', [id]);
    await db.query('DELETE FROM ad_events WHERE ad_id = ?', [id]);

    await db.query('DELETE FROM advertisements WHERE id = ?', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'delete', 'advertisement', id, JSON.stringify({ name: ads[0].name })]
    );

    res.json({ success: true, message: 'Publicite supprimee' });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// PUBLIC SERVE ENDPOINT
// =====================================================

// @route   GET /api/ads/serve/:placement
// @desc    Get active ad(s) for a placement (public)
// @access  Public
router.get('/serve/:placement', async (req, res) => {
  try {
    const { placement } = req.params;
    const { device } = req.query;

    // Get placement by slug or id
    const isId = /^\d+$/.test(placement);
    const [placements] = await db.query(
      `SELECT * FROM ad_placements WHERE ${isId ? 'id' : 'slug'} = ? AND is_active = 1`,
      [placement]
    );

    if (placements.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const placementData = placements[0];

    // Get active ads for this placement
    const [ads] = await db.query(
      `SELECT a.*, pr.type as provider_type
       FROM advertisements a
       JOIN ad_providers pr ON a.provider_id = pr.id
       WHERE a.placement_id = ?
         AND a.status = 'active'
         AND (a.start_date IS NULL OR a.start_date <= NOW())
         AND (a.end_date IS NULL OR a.end_date >= NOW())
       ORDER BY a.priority DESC, RAND() * a.weight DESC
       LIMIT ?`,
      [placementData.id, placementData.max_ads]
    );

    // Filter by device targeting if specified
    const filteredAds = ads.filter(ad => {
      if (!ad.target_devices || !device) return true;
      try {
        const devices = JSON.parse(ad.target_devices);
        return devices.length === 0 || devices.includes(device);
      } catch (e) {
        return true;
      }
    });

    // Format response
    const formattedAds = filteredAds.map(ad => ({
      id: ad.id,
      type: ad.type,
      provider_type: ad.provider_type,
      image_url: ad.image_url,
      image_url_mobile: ad.image_url_mobile,
      target_url: ad.target_url,
      alt_text: ad.alt_text,
      ad_code: ad.ad_code,
      adsense_client: ad.adsense_client,
      adsense_slot: ad.adsense_slot,
      width: placementData.width,
      height: placementData.height
    }));

    res.json({
      success: true,
      data: formattedAds,
      placement: {
        slug: placementData.slug,
        width: placementData.width,
        height: placementData.height
      }
    });
  } catch (error) {
    console.error('Serve ad error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// TRACKING ENDPOINTS
// =====================================================

// @route   POST /api/ads/track/impression
// @desc    Track ad impression
// @access  Public
router.post('/track/impression', async (req, res) => {
  try {
    const { ad_id, visitor_id, page_url } = req.body;

    if (!ad_id) {
      return res.status(400).json({ success: false, message: 'ad_id requis' });
    }

    const ip = req.ip || req.connection.remoteAddress;
    const ipHash = hashIP(ip);
    const userAgent = req.headers['user-agent'];
    const deviceType = getDeviceType(userAgent);
    const today = new Date().toISOString().split('T')[0];

    // Insert event
    await db.query(
      `INSERT INTO ad_events (ad_id, event_type, visitor_id, ip_hash, user_agent, device_type, page_url)
       VALUES (?, 'impression', ?, ?, ?, ?, ?)`,
      [ad_id, visitor_id, ipHash, userAgent, deviceType, page_url]
    );

    // Check if this is unique (same ad + ip hash today)
    const [existing] = await db.query(
      `SELECT COUNT(*) as count FROM ad_events
       WHERE ad_id = ? AND ip_hash = ? AND event_type = 'impression'
       AND DATE(created_at) = ?`,
      [ad_id, ipHash, today]
    );
    const isUnique = existing[0].count === 1;

    // Update daily stats
    await db.query(
      `INSERT INTO ad_statistics (ad_id, date, impressions, unique_impressions)
       VALUES (?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         impressions = impressions + 1,
         unique_impressions = unique_impressions + ?`,
      [ad_id, today, isUnique ? 1 : 0, isUnique ? 1 : 0]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/ads/track/click
// @desc    Track ad click
// @access  Public
router.post('/track/click', async (req, res) => {
  try {
    const { ad_id, visitor_id, page_url } = req.body;

    if (!ad_id) {
      return res.status(400).json({ success: false, message: 'ad_id requis' });
    }

    const ip = req.ip || req.connection.remoteAddress;
    const ipHash = hashIP(ip);
    const userAgent = req.headers['user-agent'];
    const deviceType = getDeviceType(userAgent);
    const today = new Date().toISOString().split('T')[0];

    // Insert event
    await db.query(
      `INSERT INTO ad_events (ad_id, event_type, visitor_id, ip_hash, user_agent, device_type, page_url)
       VALUES (?, 'click', ?, ?, ?, ?, ?)`,
      [ad_id, visitor_id, ipHash, userAgent, deviceType, page_url]
    );

    // Check if this is unique
    const [existing] = await db.query(
      `SELECT COUNT(*) as count FROM ad_events
       WHERE ad_id = ? AND ip_hash = ? AND event_type = 'click'
       AND DATE(created_at) = ?`,
      [ad_id, ipHash, today]
    );
    const isUnique = existing[0].count === 1;

    // Update daily stats
    await db.query(
      `INSERT INTO ad_statistics (ad_id, date, clicks, unique_clicks)
       VALUES (?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
         clicks = clicks + 1,
         unique_clicks = unique_clicks + ?`,
      [ad_id, today, isUnique ? 1 : 0, isUnique ? 1 : 0]
    );

    // Get target URL for redirect
    const [ads] = await db.query('SELECT target_url FROM advertisements WHERE id = ?', [ad_id]);
    const targetUrl = ads.length > 0 ? ads[0].target_url : null;

    res.json({ success: true, redirect_url: targetUrl });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// STATISTICS ENDPOINTS
// =====================================================

// @route   GET /api/ads/stats/overview
// @desc    Get overall advertising statistics
// @access  Private (admin)
router.get('/stats/overview', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period) || 30;

    // Total stats
    const [totals] = await db.query(
      `SELECT
        COALESCE(SUM(impressions), 0) as total_impressions,
        COALESCE(SUM(clicks), 0) as total_clicks,
        COALESCE(SUM(unique_impressions), 0) as total_unique_impressions,
        COALESCE(SUM(unique_clicks), 0) as total_unique_clicks
       FROM ad_statistics
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [days]
    );

    // Active ads count
    const [activeAds] = await db.query(
      `SELECT COUNT(*) as count FROM advertisements
       WHERE status = 'active'
       AND (start_date IS NULL OR start_date <= NOW())
       AND (end_date IS NULL OR end_date >= NOW())`
    );

    // Daily stats for chart
    const [dailyStats] = await db.query(
      `SELECT date,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks
       FROM ad_statistics
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY date
       ORDER BY date ASC`,
      [days]
    );

    // Top performing ads
    const [topAds] = await db.query(
      `SELECT a.id, a.name,
        COALESCE(SUM(s.impressions), 0) as impressions,
        COALESCE(SUM(s.clicks), 0) as clicks,
        CASE WHEN SUM(s.impressions) > 0
          THEN ROUND(SUM(s.clicks) * 100.0 / SUM(s.impressions), 2)
          ELSE 0 END as ctr
       FROM advertisements a
       LEFT JOIN ad_statistics s ON a.id = s.ad_id AND s.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       WHERE a.status = 'active'
       GROUP BY a.id
       ORDER BY clicks DESC
       LIMIT 5`,
      [days]
    );

    // Stats by placement
    const [byPlacement] = await db.query(
      `SELECT p.name, p.slug,
        COALESCE(SUM(s.impressions), 0) as impressions,
        COALESCE(SUM(s.clicks), 0) as clicks
       FROM ad_placements p
       LEFT JOIN advertisements a ON p.id = a.placement_id
       LEFT JOIN ad_statistics s ON a.id = s.ad_id AND s.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY p.id
       ORDER BY impressions DESC`,
      [days]
    );

    // Calculate CTR
    const totalImpressions = totals[0].total_impressions;
    const totalClicks = totals[0].total_clicks;
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          impressions: totals[0].total_impressions,
          clicks: totals[0].total_clicks,
          unique_impressions: totals[0].total_unique_impressions,
          unique_clicks: totals[0].total_unique_clicks,
          ctr: parseFloat(ctr),
          active_ads: activeAds[0].count
        },
        daily: dailyStats,
        top_ads: topAds,
        by_placement: byPlacement
      }
    });
  } catch (error) {
    console.error('Get stats overview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/ads/stats/:id
// @desc    Get statistics for specific ad
// @access  Private (admin)
router.get('/stats/:id', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query;
    const days = parseInt(period) || 30;

    // Check ad exists
    const [ads] = await db.query('SELECT name FROM advertisements WHERE id = ?', [id]);
    if (ads.length === 0) {
      return res.status(404).json({ success: false, message: 'Publicite non trouvee' });
    }

    // Total stats
    const [totals] = await db.query(
      `SELECT
        COALESCE(SUM(impressions), 0) as total_impressions,
        COALESCE(SUM(clicks), 0) as total_clicks,
        COALESCE(SUM(unique_impressions), 0) as total_unique_impressions,
        COALESCE(SUM(unique_clicks), 0) as total_unique_clicks
       FROM ad_statistics
       WHERE ad_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [id, days]
    );

    // Daily stats
    const [dailyStats] = await db.query(
      `SELECT date, impressions, clicks, unique_impressions, unique_clicks
       FROM ad_statistics
       WHERE ad_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY date ASC`,
      [id, days]
    );

    // Device breakdown
    const [deviceStats] = await db.query(
      `SELECT device_type, COUNT(*) as count
       FROM ad_events
       WHERE ad_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY device_type`,
      [id, days]
    );

    // Hourly distribution
    const [hourlyStats] = await db.query(
      `SELECT HOUR(created_at) as hour, event_type, COUNT(*) as count
       FROM ad_events
       WHERE ad_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY HOUR(created_at), event_type
       ORDER BY hour`,
      [id, days]
    );

    res.json({
      success: true,
      data: {
        ad_name: ads[0].name,
        summary: totals[0],
        daily: dailyStats,
        by_device: deviceStats,
        by_hour: hourlyStats
      }
    });
  } catch (error) {
    console.error('Get ad stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/ads/:id/duplicate
// @desc    Duplicate an advertisement
// @access  Private (admin)
router.post('/:id/duplicate', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;

    const [ads] = await db.query('SELECT * FROM advertisements WHERE id = ?', [id]);
    if (ads.length === 0) {
      return res.status(404).json({ success: false, message: 'Publicite non trouvee' });
    }

    const ad = ads[0];

    const [result] = await db.query(
      `INSERT INTO advertisements (
        name, placement_id, provider_id, type,
        image_url, image_url_mobile, target_url, alt_text, ad_code,
        adsense_client, adsense_slot,
        status, priority, weight,
        advertiser_name, advertiser_email, advertiser_phone,
        budget_type, budget_value, target_countries, target_devices,
        notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `${ad.name} (copie)`, ad.placement_id, ad.provider_id, ad.type,
        ad.image_url, ad.image_url_mobile, ad.target_url, ad.alt_text, ad.ad_code,
        ad.adsense_client, ad.adsense_slot,
        ad.priority, ad.weight,
        ad.advertiser_name, ad.advertiser_email, ad.advertiser_phone,
        ad.budget_type, ad.budget_value, ad.target_countries, ad.target_devices,
        ad.notes, req.user.id
      ]
    );

    const [newAd] = await db.query('SELECT * FROM advertisements WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Publicite dupliquee', data: newAd[0] });
  } catch (error) {
    console.error('Duplicate ad error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
