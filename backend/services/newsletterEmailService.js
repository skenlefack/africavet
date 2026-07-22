/**
 * NEWSLETTER EMAIL SERVICE
 * AfricaVET CMS
 *
 * Service for sending newsletter emails:
 * - Email sending with SMTP
 * - Template processing with variable replacement
 * - Tracking pixel and link injection
 * - Queue processing
 * - Batch sending with rate limiting
 */

const nodemailer = require('nodemailer');
const db = require('../config/db');
const { getSmtpConfig } = require('./emailService');
const path = require('path');
const fs = require('fs');

// Logo path for CID embedding
const logoPath = path.join(__dirname, '../uploads/africavet-logo.png');

// ============================================
// TRANSPORTER SETUP (reads from DB, falls back to env)
// ============================================

let cachedTransporter = null;
let cachedConfigHash = '';

const getTransporter = async () => {
  const config = await getSmtpConfig();
  const hash = JSON.stringify(config);

  if (cachedTransporter && hash === cachedConfigHash) {
    return cachedTransporter;
  }

  if (!config.host) {
    cachedTransporter = {
      sendMail: async (options) => {
        console.log('=== NEWSLETTER EMAIL (Development Mode) ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Preview:', options.html?.substring(0, 200) + '...');
        console.log('==========================================');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  } else {
    console.log('SMTP configured:', config.host);
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });
  }

  cachedConfigHash = hash;
  return cachedTransporter;
};

// ============================================
// HELPERS
// ============================================

const getSettings = async () => {
  const [rows] = await db.query('SELECT `key`, value FROM newsletter_settings');
  const settings = {};
  rows.forEach(row => {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  });
  return settings;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// TEMPLATE PROCESSING
// ============================================

/**
 * Replace template variables with actual values
 */
const processTemplate = (html, variables) => {
  let processed = html;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processed = processed.replace(regex, value || '');
  }

  // Remove any remaining unmatched variables
  processed = processed.replace(/{{\s*\w+\s*}}/g, '');

  return processed;
};

/**
 * Inject tracking pixel into HTML
 */
const injectTrackingPixel = (html, newsletterId, subscriberId, baseUrl) => {
  const trackingUrl = `${baseUrl}/api/newsletter/track/open/${newsletterId}/${subscriberId}`;
  const pixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;visibility:hidden;" alt="" />`;

  // Insert before closing body tag
  if (html.includes('</body>')) {
    return html.replace('</body>', `${pixel}</body>`);
  }

  // Or append at the end
  return html + pixel;
};

/**
 * Replace links with tracking links
 */
const processTrackingLinks = async (html, newsletterId, subscriberId, baseUrl) => {
  // Get existing tracking links for this newsletter
  const [existingLinks] = await db.query(
    'SELECT original_url, tracking_code FROM newsletter_links WHERE newsletter_id = ?',
    [newsletterId]
  );

  const linkMap = {};
  existingLinks.forEach(link => {
    linkMap[link.original_url] = link.tracking_code;
  });

  // Replace links
  const linkRegex = /href=["']([^"'#]+)["']/g;
  let processed = html;
  let match;
  const matches = [];

  while ((match = linkRegex.exec(html)) !== null) {
    const originalUrl = match[1];

    // Skip unsubscribe links, mailto, tel, and anchor links
    if (originalUrl.includes('unsubscribe') ||
        originalUrl.startsWith('mailto:') ||
        originalUrl.startsWith('tel:') ||
        originalUrl.startsWith('#')) {
      continue;
    }

    matches.push({
      full: match[0],
      url: originalUrl
    });
  }

  for (const m of matches) {
    let trackingCode = linkMap[m.url];

    if (!trackingCode) {
      // Create new tracking link
      trackingCode = require('crypto').randomBytes(6).toString('hex').toUpperCase();
      await db.query(`
        INSERT INTO newsletter_links (newsletter_id, original_url, tracking_code)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE tracking_code = tracking_code
      `, [newsletterId, m.url, trackingCode]);
    }

    const trackingUrl = `${baseUrl}/api/newsletter/track/click/${trackingCode}?n=${newsletterId}&s=${subscriberId}`;
    processed = processed.replace(m.full, `href="${trackingUrl}"`);
  }

  return processed;
};

// ============================================
// EMAIL TEMPLATES
// ============================================

const templates = {
  confirmation: {
    fr: (confirmUrl) => ({
      subject: 'Confirmez votre inscription à la newsletter AfricaVET',
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #7ac142 0%, #354e84 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 26px; letter-spacing: 1px;">AfricaVET</h1>
    </div>
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #354e84; margin-top: 0; font-size: 20px;">Bonjour,</h2>
      <p style="color: #555; line-height: 1.7; font-size: 15px;">
        Merci de votre inscription à la newsletter <strong>AfricaVET</strong>.
      </p>
      <p style="color: #555; line-height: 1.7; font-size: 15px;">
        Pour finaliser votre inscription et recevoir nos actualités sur la santé animale, l'élevage, les opportunités professionnelles, les formations et les événements vétérinaires en Afrique, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #7ac142 0%, #354e84 100%); color: white; text-decoration: none; padding: 15px 36px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Confirmer mon inscription
        </a>
      </div>
      <p style="color: #888; line-height: 1.6; font-size: 13px;">
        Si le bouton ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur :
      </p>
      <p style="color: #2196F3; word-break: break-all; font-size: 13px;">${confirmUrl}</p>
      <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
      <p style="color: #555; font-size: 14px; margin-bottom: 4px;">À très bientôt sur AfricaVET,</p>
      <p style="color: #354e84; font-size: 14px; font-weight: 600; margin-top: 0;">L'équipe AfricaVET</p>
      <p style="color: #9E9E9E; font-size: 12px; text-align: center; margin-top: 20px;">
        La plateforme panafricaine d'information et de services vétérinaires
      </p>
    </div>
  </div>
</body></html>`
    }),
    en: (confirmUrl) => ({
      subject: 'Confirm your subscription to the AfricaVET newsletter',
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #7ac142 0%, #354e84 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 26px; letter-spacing: 1px;">AfricaVET</h1>
    </div>
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #354e84; margin-top: 0; font-size: 20px;">Hello,</h2>
      <p style="color: #555; line-height: 1.7; font-size: 15px;">
        Thank you for subscribing to the <strong>AfricaVET</strong> newsletter.
      </p>
      <p style="color: #555; line-height: 1.7; font-size: 15px;">
        To complete your registration and start receiving updates on animal health, livestock, professional opportunities, training programmes and veterinary events across Africa, please confirm your email address by clicking the button below.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #7ac142 0%, #354e84 100%); color: white; text-decoration: none; padding: 15px 36px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Confirm my subscription
        </a>
      </div>
      <p style="color: #888; line-height: 1.6; font-size: 13px;">
        If the button does not work, copy and paste the following link into your browser:
      </p>
      <p style="color: #2196F3; word-break: break-all; font-size: 13px;">${confirmUrl}</p>
      <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
      <p style="color: #555; font-size: 14px; margin-bottom: 4px;">We look forward to keeping you informed.</p>
      <p style="color: #354e84; font-size: 14px; font-weight: 600; margin-top: 0;">The AfricaVET Team</p>
      <p style="color: #9E9E9E; font-size: 12px; text-align: center; margin-top: 20px;">
        The Pan-African platform for veterinary information and services
      </p>
    </div>
  </div>
</body></html>`
    })
  },

  welcome: {
    fr: (firstName, unsubscribeUrl) => ({
      subject: 'Bienvenue dans la newsletter AfricaVET!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #7ac142 0%, #354e84 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">AfricaVET</h1>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #263238; margin-top: 0;">Bienvenue ${firstName || ''}!</h2>
              <p style="color: #607D8B; line-height: 1.6;">
                Votre inscription a notre newsletter est confirmee. Vous recevrez desormais nos actualites sur l'approche AfricaVET au Cameroun.
              </p>
              <p style="color: #607D8B; line-height: 1.6;">
                Restez connecte pour:
              </p>
              <ul style="color: #607D8B; line-height: 1.8;">
                <li>Les dernieres actualites AfricaVET</li>
                <li>Les rapports et publications</li>
                <li>Les evenements et formations</li>
                <li>Les alertes sanitaires</li>
              </ul>
              <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
              <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
                <a href="${unsubscribeUrl}" style="color: #2196F3;">Se desabonner</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    en: (firstName, unsubscribeUrl) => ({
      subject: 'Welcome to the AfricaVET newsletter!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #7ac142 0%, #354e84 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">AfricaVET</h1>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #263238; margin-top: 0;">Welcome ${firstName || ''}!</h2>
              <p style="color: #607D8B; line-height: 1.6;">
                Your subscription to our newsletter is confirmed. You will now receive our news on the AfricaVET approach in Cameroon.
              </p>
              <p style="color: #607D8B; line-height: 1.6;">
                Stay connected for:
              </p>
              <ul style="color: #607D8B; line-height: 1.8;">
                <li>Latest AfricaVET news</li>
                <li>Reports and publications</li>
                <li>Events and training</li>
                <li>Health alerts</li>
              </ul>
              <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
              <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
                <a href="${unsubscribeUrl}" style="color: #2196F3;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  }
};

// ============================================
// EMAIL SENDING FUNCTIONS
// ============================================

/**
 * Send confirmation email for double opt-in
 */
const sendConfirmationEmail = async (subscriber) => {
  try {
    const settings = await getSettings();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const confirmUrl = `${frontendUrl}/newsletter/confirmation/${subscriber.confirmation_token}`;

    const template = templates.confirmation[subscriber.language] || templates.confirmation.fr;
    const { subject, html } = template(confirmUrl, subscriber.first_name);

    const transport = await getTransporter();
    await transport.sendMail({
      from: `"${settings.sender_name || 'AfricaVET'}" <${settings.sender_email || process.env.SMTP_FROM || 'newsletter@africavet.com'}>`,
      replyTo: settings.reply_to || 'contact@africavet.com',
      to: subscriber.email,
      subject,
      html
    });

    console.log(`Confirmation email sent to ${subscriber.email}`);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

/**
 * Send welcome email after confirmation
 */
const sendWelcomeEmail = async (subscriber) => {
  try {
    const settings = await getSettings();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const unsubscribeUrl = `${frontendUrl}/newsletter/desinscription?token=${subscriber.unsubscribe_token}&email=${encodeURIComponent(subscriber.email)}`;

    const template = templates.welcome[subscriber.language] || templates.welcome.fr;
    const { subject, html } = template(subscriber.first_name, unsubscribeUrl);

    const transport = await getTransporter();
    await transport.sendMail({
      from: `"${settings.sender_name || 'AfricaVET'}" <${settings.sender_email || process.env.SMTP_FROM || 'newsletter@africavet.com'}>`,
      replyTo: settings.reply_to || 'contact@africavet.com',
      to: subscriber.email,
      subject,
      html
    });

    console.log(`Welcome email sent to ${subscriber.email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send a newsletter to a single subscriber
 */
const sendNewsletter = async (newsletter, subscriber) => {
  try {
    const settings = await getSettings();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const unsubscribeUrl = `${frontendUrl}/newsletter/desinscription?token=${subscriber.unsubscribe_token}&email=${encodeURIComponent(subscriber.email)}`;

    // Select content based on language
    const subject = subscriber.language === 'en' && newsletter.subject_en
      ? newsletter.subject_en
      : newsletter.subject_fr;

    let html = subscriber.language === 'en' && newsletter.content_html_en
      ? newsletter.content_html_en
      : newsletter.content_html_fr;

    // Process template variables
    const variables = {
      first_name: subscriber.first_name || '',
      last_name: subscriber.last_name || '',
      email: subscriber.email,
      subject: subject,
      date: new Date().toLocaleDateString(subscriber.language === 'en' ? 'en-US' : 'fr-FR'),
      unsubscribe_url: unsubscribeUrl
    };

    html = processTemplate(html, variables);

    // Inject tracking if enabled
    if (settings.tracking_enabled !== false) {
      html = injectTrackingPixel(html, newsletter.id, subscriber.id, backendUrl);
      html = await processTrackingLinks(html, newsletter.id, subscriber.id, backendUrl);
    }

    // Replace base64 logo with CID reference
    html = html.replace(/src="data:image\/jpeg;base64,[^"]+"/g, 'src="cid:africavet-logo"');

    // Prepare email options
    const mailOptions = {
      from: `"${settings.sender_name || 'AfricaVET'}" <${settings.sender_email || process.env.SMTP_FROM || 'newsletter@africavet.com'}>`,
      replyTo: settings.reply_to || 'contact@africavet.com',
      to: subscriber.email,
      subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    };

    // Initialize attachments array
    mailOptions.attachments = [];

    // Add logo as CID attachment if it exists
    if (fs.existsSync(logoPath)) {
      const logoContent = fs.readFileSync(logoPath);
      mailOptions.attachments.push({
        filename: 'logo.jpg',
        content: logoContent,
        contentType: 'image/jpeg',
        contentDisposition: 'inline',
        cid: 'africavet-logo'
      });
    }

    // Add newsletter file attachments if present
    if (newsletter.attachments) {
      let attachments = newsletter.attachments;
      if (typeof attachments === 'string') {
        try {
          attachments = JSON.parse(attachments);
        } catch (e) {
          attachments = [];
        }
      }

      if (Array.isArray(attachments) && attachments.length > 0) {
        for (const attachment of attachments) {
          const attachmentPath = path.join(__dirname, '..', attachment.path);
          if (fs.existsSync(attachmentPath)) {
            mailOptions.attachments.push({
              filename: attachment.filename,
              path: attachmentPath,
              contentType: attachment.mimetype || 'application/octet-stream'
            });
          }
        }
      }
    }

    const transport = await getTransporter();
    await transport.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error(`Error sending newsletter to ${subscriber.email}:`, error);
    throw error;
  }
};

/**
 * Process newsletter queue - send emails in batches
 */
const processNewsletterQueue = async (newsletterId) => {
  try {
    const settings = await getSettings();
    const batchSize = settings.batch_size || 50;
    const batchDelay = settings.batch_delay_ms || 1000;

    // Get newsletter
    const [newsletters] = await db.query('SELECT * FROM newsletters WHERE id = ?', [newsletterId]);
    if (newsletters.length === 0) {
      console.error('Newsletter not found:', newsletterId);
      return;
    }
    const newsletter = newsletters[0];

    // Get pending queue items
    const [queueItems] = await db.query(`
      SELECT q.*, s.first_name, s.last_name, s.unsubscribe_token
      FROM newsletter_queue q
      JOIN newsletter_subscribers s ON q.subscriber_id = s.id
      WHERE q.newsletter_id = ? AND q.status = 'pending'
      ORDER BY q.id
      LIMIT ?
    `, [newsletterId, batchSize]);

    if (queueItems.length === 0) {
      // All done
      await db.query(`
        UPDATE newsletters SET status = 'sent', sent_at = NOW()
        WHERE id = ? AND status = 'sending'
      `, [newsletterId]);
      console.log(`Newsletter ${newsletterId} completed`);
      return;
    }

    console.log(`Processing ${queueItems.length} emails for newsletter ${newsletterId}`);

    for (const item of queueItems) {
      try {
        // Mark as sending
        await db.query('UPDATE newsletter_queue SET status = "sending" WHERE id = ?', [item.id]);

        // Send email
        await sendNewsletter(newsletter, {
          id: item.subscriber_id,
          email: item.email,
          first_name: item.first_name,
          last_name: item.last_name,
          language: item.language,
          unsubscribe_token: item.unsubscribe_token
        });

        // Mark as sent
        await db.query(`
          UPDATE newsletter_queue SET status = 'sent', sent_at = NOW()
          WHERE id = ?
        `, [item.id]);

        // Update newsletter stats
        await db.query('UPDATE newsletters SET sent_count = sent_count + 1 WHERE id = ?', [newsletterId]);

        // Update subscriber stats
        await db.query(`
          UPDATE newsletter_subscribers SET emails_received = emails_received + 1, last_email_at = NOW()
          WHERE id = ?
        `, [item.subscriber_id]);

      } catch (error) {
        // Mark as failed
        await db.query(`
          UPDATE newsletter_queue SET status = 'failed', error_message = ?, attempts = attempts + 1
          WHERE id = ?
        `, [error.message, item.id]);

        await db.query('UPDATE newsletters SET failed_count = failed_count + 1 WHERE id = ?', [newsletterId]);
      }
    }

    // Wait before next batch
    await sleep(batchDelay);

    // Continue processing (recursive)
    setImmediate(() => processNewsletterQueue(newsletterId));

  } catch (error) {
    console.error('Error processing newsletter queue:', error);
    throw error;
  }
};

/**
 * Start sending a newsletter campaign
 */
const startCampaign = async (newsletterId) => {
  try {
    // Get newsletter info
    const [newsletters] = await db.query('SELECT * FROM newsletters WHERE id = ?', [newsletterId]);
    if (newsletters.length === 0) {
      throw new Error('Newsletter not found');
    }
    const newsletter = newsletters[0];

    // Get target subscribers if queue is empty
    const [existingQueue] = await db.query(
      'SELECT COUNT(*) as count FROM newsletter_queue WHERE newsletter_id = ?',
      [newsletterId]
    );

    if (existingQueue[0].count === 0) {
      // Populate queue with subscribers
      const targetLists = JSON.parse(newsletter.target_lists || '[]');
      if (targetLists.length === 0) {
        console.log(`Newsletter ${newsletterId}: No target lists`);
        await db.query('UPDATE newsletters SET status = "sent", sent_at = NOW() WHERE id = ?', [newsletterId]);
        return true;
      }

      let subscriberQuery = `
        SELECT DISTINCT s.id, s.email, s.first_name, s.last_name, s.language, s.unsubscribe_token
        FROM newsletter_subscribers s
        JOIN newsletter_subscriber_lists sl ON s.id = sl.subscriber_id
        WHERE sl.list_id IN (?) AND sl.is_active = 1 AND s.status = 'active'
      `;
      const params = [targetLists];

      if (newsletter.target_language && newsletter.target_language !== 'all') {
        subscriberQuery += ' AND s.language = ?';
        params.push(newsletter.target_language);
      }

      const [subscribers] = await db.query(subscriberQuery, params);

      if (subscribers.length === 0) {
        console.log(`Newsletter ${newsletterId}: No eligible subscribers`);
        await db.query('UPDATE newsletters SET status = "sent", sent_at = NOW(), total_recipients = 0 WHERE id = ?', [newsletterId]);
        return true;
      }

      // Update total recipients
      await db.query('UPDATE newsletters SET total_recipients = ? WHERE id = ?', [subscribers.length, newsletterId]);

      // Create queue entries
      for (const sub of subscribers) {
        await db.query(`
          INSERT INTO newsletter_queue (newsletter_id, subscriber_id, email, language)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE status = 'pending'
        `, [newsletterId, sub.id, sub.email, sub.language]);
      }

      console.log(`Newsletter ${newsletterId}: Queued ${subscribers.length} subscribers`);
    }

    // Update status to sending
    await db.query(`
      UPDATE newsletters SET status = 'sending', started_at = NOW()
      WHERE id = ? AND status IN ('draft', 'scheduled')
    `, [newsletterId]);

    // Start processing
    processNewsletterQueue(newsletterId);

    return true;
  } catch (error) {
    console.error('Error starting campaign:', error);
    throw error;
  }
};

/**
 * Send a test email
 */
const sendTestEmail = async (newsletterId, testEmail) => {
  try {
    const [newsletters] = await db.query('SELECT * FROM newsletters WHERE id = ?', [newsletterId]);
    if (newsletters.length === 0) {
      throw new Error('Newsletter not found');
    }

    const newsletter = newsletters[0];

    // Create a mock subscriber
    const mockSubscriber = {
      id: 0,
      email: testEmail,
      first_name: 'Test',
      last_name: 'User',
      language: 'fr',
      unsubscribe_token: 'test-token'
    };

    await sendNewsletter(newsletter, mockSubscriber);

    console.log(`Test email sent to ${testEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

// ============================================
// SCHEDULED CAMPAIGN PROCESSOR
// ============================================

/**
 * Check and send scheduled campaigns (should be called periodically)
 */
const processScheduledCampaigns = async () => {
  try {
    const [scheduledCampaigns] = await db.query(`
      SELECT id FROM newsletters
      WHERE status = 'scheduled' AND scheduled_at <= NOW()
    `);

    for (const campaign of scheduledCampaigns) {
      console.log(`Starting scheduled campaign ${campaign.id}`);
      await startCampaign(campaign.id);
    }

    return scheduledCampaigns.length;
  } catch (error) {
    console.error('Error processing scheduled campaigns:', error);
    throw error;
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  sendConfirmationEmail,
  sendWelcomeEmail,
  sendNewsletter,
  sendTestEmail,
  startCampaign,
  processNewsletterQueue,
  processScheduledCampaigns,
  processTemplate,
  injectTrackingPixel,
  processTrackingLinks
};
