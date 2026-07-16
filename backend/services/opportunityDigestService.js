/**
 * Opportunity Digest Service
 * Sends periodic digests of new opportunities and closing alerts to subscribers.
 */

const db = require('../config/db');
const nodemailer = require('nodemailer');

/**
 * Get SMTP transporter (same pattern as newsletterEmailService)
 */
async function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host, port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
  });
}

/**
 * Process weekly opportunity digest
 * Finds subscribers with 'opportunity_digest' preference and sends matching opportunities
 */
async function processOpportunityDigest() {
  try {
    // Get active digest preferences due for sending
    const [prefs] = await db.query(`
      SELECT sp.*, ns.email, ns.first_name, ns.language
      FROM subscriber_preferences sp
      INNER JOIN newsletter_subscribers ns ON sp.subscriber_id = ns.id
      WHERE sp.preference_type = 'opportunity_digest'
        AND sp.is_active = 1
        AND ns.status = 'active'
        AND (sp.last_sent_at IS NULL OR
             (sp.frequency = 'daily' AND sp.last_sent_at < DATE_SUB(NOW(), INTERVAL 1 DAY)) OR
             (sp.frequency = 'weekly' AND sp.last_sent_at < DATE_SUB(NOW(), INTERVAL 7 DAY)) OR
             (sp.frequency = 'monthly' AND sp.last_sent_at < DATE_SUB(NOW(), INTERVAL 30 DAY)))
    `);

    if (prefs.length === 0) return 0;

    const transporter = await getTransporter();
    if (!transporter) {
      console.error('Digest: No SMTP configured');
      return 0;
    }

    let sentCount = 0;

    for (const pref of prefs) {
      try {
        // Build query for matching opportunities
        let query = `
          SELECT id, title_fr, title_en, opportunity_type, organization_name, country, deadline, slug
          FROM opportunities
          WHERE status = 'published' AND created_at > ?
          AND (deadline IS NULL OR deadline > NOW())
        `;
        const sinceDate = pref.last_sent_at || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const params = [sinceDate];

        // Filter by countries
        if (pref.countries) {
          const countries = typeof pref.countries === 'string' ? JSON.parse(pref.countries) : pref.countries;
          if (countries.length > 0) {
            query += ` AND country IN (${countries.map(() => '?').join(',')})`;
            params.push(...countries);
          }
        }

        // Filter by opportunity types
        if (pref.opportunity_types) {
          const types = typeof pref.opportunity_types === 'string' ? JSON.parse(pref.opportunity_types) : pref.opportunity_types;
          if (types.length > 0) {
            query += ` AND opportunity_type IN (${types.map(() => '?').join(',')})`;
            params.push(...types);
          }
        }

        query += ' ORDER BY created_at DESC LIMIT 20';

        const [opportunities] = await db.query(query, params);

        if (opportunities.length === 0) continue;

        // Build email content
        const isFr = pref.language !== 'en';
        const subject = isFr
          ? `AfricaVET — ${opportunities.length} nouvelle(s) opportunité(s)`
          : `AfricaVET — ${opportunities.length} new opportunity(ies)`;

        const oppList = opportunities.map(opp => {
          const title = isFr ? opp.title_fr : (opp.title_en || opp.title_fr);
          const type = opp.opportunity_type === 'job' ? (isFr ? 'Emploi' : 'Job')
            : opp.opportunity_type === 'tender' ? (isFr ? 'Appel d\'offres' : 'Tender')
            : (isFr ? 'Marché' : 'Market');
          const deadline = opp.deadline ? new Date(opp.deadline).toLocaleDateString(isFr ? 'fr-FR' : 'en-US') : '';
          return `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee"><strong>${title}</strong><br><small>${opp.organization_name || ''} — ${opp.country || ''}</small></td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center"><span style="background:#e3f2fd;color:#1565c0;padding:2px 8px;border-radius:12px;font-size:12px">${type}</span></td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-size:13px">${deadline}</td>
          </tr>`;
        }).join('');

        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#3463b5,#6faf4c);padding:20px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="color:white;margin:0;font-size:22px">${isFr ? 'Nouvelles opportunités' : 'New Opportunities'}</h1>
            </div>
            <div style="padding:20px;background:#fff;border:1px solid #eee">
              <p>${isFr ? 'Bonjour' : 'Hello'} ${pref.first_name || ''},</p>
              <p>${isFr ? `Voici les ${opportunities.length} dernière(s) opportunité(s) correspondant à vos critères :` : `Here are the latest ${opportunities.length} opportunity(ies) matching your criteria:`}</p>
              <table style="width:100%;border-collapse:collapse">${oppList}</table>
              <p style="margin-top:16px;text-align:center">
                <a href="https://www.africavet.com/${pref.language || 'fr'}/opportunities" style="background:#3463b5;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;display:inline-block">
                  ${isFr ? 'Voir toutes les opportunités' : 'View all opportunities'}
                </a>
              </p>
            </div>
            <div style="text-align:center;padding:12px;font-size:12px;color:#999">
              AfricaVET — ${isFr ? 'Le portail panafricain de la santé animale' : 'Pan-African Animal Health Portal'}
            </div>
          </div>`;

        await transporter.sendMail({
          from: `"AfricaVET" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: pref.email,
          subject,
          html,
        });

        // Log and update
        await db.query('UPDATE subscriber_preferences SET last_sent_at = NOW() WHERE id = ?', [pref.id]);
        await db.query(
          'INSERT INTO digest_log (subscriber_id, digest_type, opportunity_ids) VALUES (?, ?, ?)',
          [pref.subscriber_id, 'opportunity_digest', JSON.stringify(opportunities.map(o => o.id))]
        );

        sentCount++;
      } catch (err) {
        console.error(`Digest error for ${pref.email}:`, err.message);
      }
    }

    return sentCount;
  } catch (error) {
    console.error('processOpportunityDigest error:', error);
    return 0;
  }
}

/**
 * Process closing alerts
 * Notifies subscribers about opportunities closing within 3 days
 */
async function processClosingAlerts() {
  try {
    const [prefs] = await db.query(`
      SELECT sp.*, ns.email, ns.first_name, ns.language
      FROM subscriber_preferences sp
      INNER JOIN newsletter_subscribers ns ON sp.subscriber_id = ns.id
      WHERE sp.preference_type = 'closing_alert'
        AND sp.is_active = 1
        AND ns.status = 'active'
        AND (sp.last_sent_at IS NULL OR sp.last_sent_at < DATE_SUB(NOW(), INTERVAL 1 DAY))
    `);

    if (prefs.length === 0) return 0;

    // Get opportunities closing in next 3 days
    const [closingOpps] = await db.query(`
      SELECT id, title_fr, title_en, opportunity_type, organization_name, country, deadline
      FROM opportunities
      WHERE status = 'published'
        AND deadline IS NOT NULL
        AND deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
      ORDER BY deadline ASC
    `);

    if (closingOpps.length === 0) return 0;

    const transporter = await getTransporter();
    if (!transporter) return 0;

    let sentCount = 0;

    for (const pref of prefs) {
      // Filter by subscriber's preferred countries
      let filtered = closingOpps;
      if (pref.countries) {
        const countries = typeof pref.countries === 'string' ? JSON.parse(pref.countries) : pref.countries;
        if (countries.length > 0) {
          filtered = closingOpps.filter(o => countries.includes(o.country));
        }
      }
      if (filtered.length === 0) continue;

      const isFr = pref.language !== 'en';
      const subject = isFr
        ? `AfricaVET — ${filtered.length} opportunité(s) clôturent bientôt`
        : `AfricaVET — ${filtered.length} opportunity(ies) closing soon`;

      const list = filtered.map(opp => {
        const title = isFr ? opp.title_fr : (opp.title_en || opp.title_fr);
        const days = Math.ceil((new Date(opp.deadline) - Date.now()) / (1000 * 60 * 60 * 24));
        return `<li style="margin-bottom:8px"><strong>${title}</strong> — ${opp.organization_name || ''}<br><span style="color:#e65100;font-size:13px">${isFr ? `Clôture dans ${days} jour(s)` : `Closes in ${days} day(s)`}</span></li>`;
      }).join('');

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#e65100;padding:16px;text-align:center;border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0">${isFr ? 'Clôture prochaine' : 'Closing Soon'}</h2>
          </div>
          <div style="padding:20px;background:#fff;border:1px solid #eee">
            <p>${isFr ? 'Bonjour' : 'Hello'} ${pref.first_name || ''},</p>
            <p>${isFr ? 'Ces opportunités clôturent dans les prochaines 72 heures :' : 'These opportunities are closing within the next 72 hours:'}</p>
            <ul style="padding-left:16px">${list}</ul>
            <p style="text-align:center;margin-top:16px">
              <a href="https://www.africavet.com/${pref.language || 'fr'}/opportunities" style="background:#e65100;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;display:inline-block">
                ${isFr ? 'Postuler maintenant' : 'Apply now'}
              </a>
            </p>
          </div>
        </div>`;

      try {
        await transporter.sendMail({
          from: `"AfricaVET" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: pref.email,
          subject,
          html,
        });
        await db.query('UPDATE subscriber_preferences SET last_sent_at = NOW() WHERE id = ?', [pref.id]);
        sentCount++;
      } catch (err) {
        console.error(`Closing alert error for ${pref.email}:`, err.message);
      }
    }

    return sentCount;
  } catch (error) {
    console.error('processClosingAlerts error:', error);
    return 0;
  }
}

module.exports = { processOpportunityDigest, processClosingAlerts };
