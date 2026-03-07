/**
 * VET Alert Notification Service
 * Handles sending notifications for veterinary alerts
 */

const db = require('../config/db');
const emailService = require('./emailService');

/**
 * Send notifications for a newly approved alert
 * @param {number} alertId - The alert ID
 */
async function sendAlertNotifications(alertId) {
  try {
    // Get alert details
    const [alerts] = await db.query('SELECT * FROM vet_alerts WHERE id = ?', [alertId]);
    if (alerts.length === 0) return;

    const alert = alerts[0];

    // Get subscribers based on alert type and region
    const [subscribers] = await db.query(`
      SELECT * FROM vet_alert_subscribers
      WHERE is_active = 1
        AND verified_at IS NOT NULL
        AND (
          JSON_CONTAINS(alert_types, ?) OR alert_types IS NULL
        )
        AND (region = ? OR region IS NULL OR region = '')
    `, [JSON.stringify(alert.alert_type), alert.region]);

    // Send email to each subscriber
    for (const subscriber of subscribers) {
      if (subscriber.email) {
        await sendAlertEmail(subscriber, alert);
      }
    }

    // Update alert to mark notifications as sent
    await db.query(`
      UPDATE vet_alerts
      SET notifications_sent = 1, notifications_sent_at = NOW()
      WHERE id = ?
    `, [alertId]);

    console.log(`Sent ${subscribers.length} notifications for alert ${alert.code}`);
  } catch (error) {
    console.error('Error sending alert notifications:', error);
  }
}

/**
 * Send email notification to a subscriber
 * @param {object} subscriber - The subscriber object
 * @param {object} alert - The alert object
 */
async function sendAlertEmail(subscriber, alert) {
  try {
    const priorityColors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#f59e0b',
      low: '#16a34a'
    };

    const alertTypeLabels = {
      disease_outbreak: 'Outbreak Alert',
      emergency: 'Emergency',
      vaccination_campaign: 'Vaccination Campaign',
      food_safety: 'Food Safety',
      wildlife: 'Wildlife Alert',
      other: 'Alert'
    };

    const subject = `[VET Alert] ${alertTypeLabels[alert.alert_type] || 'Alert'}: ${alert.title_fr}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a, #15803d); padding: 20px; text-align: center; color: white; }
          .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; }
          .content { padding: 20px; background: #f9fafb; }
          .alert-box { background: white; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid ${priorityColors[alert.priority] || '#f59e0b'}; }
          .footer { padding: 15px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; padding: 12px 24px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">VET Alert</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">AfricaVet Veterinary Alert System</p>
          </div>

          <div class="content">
            <p>Hello ${subscriber.name || 'Subscriber'},</p>

            <p>A new veterinary alert has been published that matches your subscription:</p>

            <div class="alert-box">
              <div style="margin-bottom: 10px;">
                <span class="priority-badge" style="background: ${priorityColors[alert.priority] || '#f59e0b'}">
                  ${alert.priority.toUpperCase()}
                </span>
                <span style="margin-left: 10px; color: #666; font-size: 14px;">
                  ${alert.code}
                </span>
              </div>

              <h2 style="margin: 0 0 10px 0; color: #111;">${alert.title_fr}</h2>

              ${alert.title_en ? `<p style="color: #666; font-style: italic; margin: 0 0 15px 0;">${alert.title_en}</p>` : ''}

              <table style="width: 100%; font-size: 14px;">
                ${alert.disease_name ? `<tr><td style="padding: 5px 0; color: #666;">Disease:</td><td style="padding: 5px 0;"><strong>${alert.disease_name}</strong></td></tr>` : ''}
                ${alert.region ? `<tr><td style="padding: 5px 0; color: #666;">Location:</td><td style="padding: 5px 0;">${alert.region}${alert.city ? `, ${alert.city}` : ''}</td></tr>` : ''}
                ${alert.affected_count > 0 ? `<tr><td style="padding: 5px 0; color: #666;">Affected:</td><td style="padding: 5px 0;">${alert.affected_count} animals</td></tr>` : ''}
                ${alert.dead_count > 0 ? `<tr><td style="padding: 5px 0; color: #666;">Deaths:</td><td style="padding: 5px 0;">${alert.dead_count}</td></tr>` : ''}
              </table>

              ${alert.description_fr ? `<p style="margin: 15px 0 0 0; color: #444;">${alert.description_fr.substring(0, 300)}${alert.description_fr.length > 300 ? '...' : ''}</p>` : ''}
            </div>

            <p style="text-align: center; margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'https://africavet.com'}/fr/vet-alert/${alert.id}" class="btn">
                View Full Alert
              </a>
            </p>
          </div>

          <div class="footer">
            <p>You received this email because you subscribed to VET Alert notifications.</p>
            <p>
              <a href="${process.env.FRONTEND_URL || 'https://africavet.com'}/vet-alert/unsubscribe?email=${encodeURIComponent(subscriber.email)}">
                Unsubscribe
              </a>
            </p>
            <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} AfricaVet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await emailService.sendEmail({
      to: subscriber.email,
      subject,
      html: htmlContent
    });

    // Log notification
    await db.query(`
      INSERT INTO vet_alert_notifications (alert_id, notification_type, recipient_email, subject, content, status, sent_at)
      VALUES (?, 'email', ?, ?, ?, 'sent', NOW())
    `, [alert.id, subscriber.email, subject, htmlContent]);

  } catch (error) {
    console.error(`Error sending email to ${subscriber.email}:`, error);

    // Log failed notification
    await db.query(`
      INSERT INTO vet_alert_notifications (alert_id, notification_type, recipient_email, subject, status, error_message)
      VALUES (?, 'email', ?, ?, 'failed', ?)
    `, [alert.id, subscriber.email, `Alert: ${alert.title_fr}`, error.message]);
  }
}

/**
 * Send notification to admins about new pending alert
 * @param {object} alert - The alert object
 */
async function notifyAdminsNewAlert(alert) {
  try {
    // Get admin email from settings
    const [settings] = await db.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'vet_alert_admin_email'"
    );

    if (settings.length === 0 || !settings[0].setting_value) return;

    const adminEmail = settings[0].setting_value;

    const subject = `[VET Alert] New Alert Pending Review: ${alert.title_fr}`;

    const htmlContent = `
      <h2>New VET Alert Submitted</h2>
      <p>A new alert has been submitted and requires review:</p>
      <ul>
        <li><strong>Code:</strong> ${alert.code}</li>
        <li><strong>Title:</strong> ${alert.title_fr}</li>
        <li><strong>Type:</strong> ${alert.alert_type}</li>
        <li><strong>Priority:</strong> ${alert.priority}</li>
        <li><strong>Location:</strong> ${alert.region || 'N/A'}</li>
        <li><strong>Reporter:</strong> ${alert.reporter_name || 'Anonymous'}</li>
      </ul>
      <p>
        <a href="${process.env.ADMIN_URL || 'https://admin.africavet.com'}/vet-alerts/${alert.id}">
          Review Alert
        </a>
      </p>
    `;

    await emailService.sendEmail({
      to: adminEmail,
      subject,
      html: htmlContent
    });

  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}

module.exports = {
  sendAlertNotifications,
  sendAlertEmail,
  notifyAdminsNewAlert
};
