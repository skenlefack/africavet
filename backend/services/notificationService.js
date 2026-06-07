const db = require('../config/db');
const { createTransporter } = require('./emailService');

/**
 * Create an in-app notification
 */
const createNotification = async ({ user_id, type, title_fr, title_en, message_fr, message_en, link, metadata }) => {
  try {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, type, title_fr, title_en, message_fr, message_en, link, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, type, title_fr, title_en || title_fr, message_fr, message_en || message_fr, link || null, metadata ? JSON.stringify(metadata) : null]
    );
    return result.insertId;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

/**
 * Create notifications for multiple users
 */
const createBulkNotifications = async (userIds, notificationData) => {
  if (!userIds || userIds.length === 0) return;

  try {
    const values = userIds.map(userId => [
      userId,
      notificationData.type,
      notificationData.title_fr,
      notificationData.title_en || notificationData.title_fr,
      notificationData.message_fr,
      notificationData.message_en || notificationData.message_fr,
      notificationData.link || null,
      notificationData.metadata ? JSON.stringify(notificationData.metadata) : null
    ]);

    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const flatValues = values.flat();

    await db.query(
      `INSERT INTO notifications (user_id, type, title_fr, title_en, message_fr, message_en, link, metadata)
       VALUES ${placeholders}`,
      flatValues
    );
  } catch (error) {
    console.error('Create bulk notifications error:', error);
  }
};

/**
 * Check user notification preferences
 */
const getUserNotificationPrefs = async (userId) => {
  try {
    const [prefs] = await db.query(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );

    if (prefs.length === 0) {
      // Return defaults
      return {
        email_opportunities: true,
        email_vet_alerts: true,
        email_elearning: true,
        email_newsletter: true,
        inapp_opportunities: true,
        inapp_vet_alerts: true,
        inapp_elearning: true,
        inapp_newsletter: true,
        email_frequency: 'instant'
      };
    }

    return prefs[0];
  } catch (error) {
    console.error('Get notification prefs error:', error);
    return null;
  }
};

/**
 * Send opportunity match email to a user
 */
const sendOpportunityMatchEmail = async (user, opportunity, matchScore) => {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const lang = user.preferred_language || 'fr';
    const frontendUrl = process.env.PUBLIC_FRONTEND_URL || 'http://localhost:3003';

    const subject = lang === 'fr'
      ? `Nouvelle opportunité correspondant à votre profil - AfricaVET`
      : `New opportunity matching your profile - AfricaVET`;

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #7ac142 0%, #354e84 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">AfricaVET</h1>
          </div>
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px;">
            <h2 style="color: #263238;">${lang === 'fr' ? 'Nouvelle opportunité pour vous !' : 'New opportunity for you!'}</h2>
            <h3 style="color: #354e84;">${opportunity.title_fr || opportunity.title}</h3>
            <p style="color: #607D8B;">${opportunity.organization || ''} - ${opportunity.country || ''}</p>
            <p style="color: #607D8B;">${lang === 'fr' ? 'Score de correspondance' : 'Match score'}: <strong>${matchScore}%</strong></p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/opportunites/${opportunity.id}" style="display: inline-block; background: linear-gradient(135deg, #7ac142 0%, #354e84 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                ${lang === 'fr' ? 'Voir l\'opportunité' : 'View opportunity'}
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    if (process.env.SMTP_HOST) {
      await transporter.sendMail({
        from: `"AfricaVET" <${process.env.SMTP_FROM || 'noreply@africavet.com'}>`,
        to: user.email,
        subject,
        html
      });
    } else {
      console.log(`[DEV] Opportunity match email to ${user.email} for opportunity ${opportunity.id}`);
    }
  } catch (error) {
    console.error('Send opportunity match email error:', error);
  }
};

/**
 * Send vet alert notification email to a user
 */
const sendVetAlertUserEmail = async (user, alert) => {
  try {
    const lang = user.preferred_language || 'fr';
    const frontendUrl = process.env.PUBLIC_FRONTEND_URL || 'http://localhost:3003';

    const subject = lang === 'fr'
      ? `Alerte vétérinaire dans votre région - AfricaVET`
      : `Veterinary alert in your area - AfricaVET`;

    console.log(`[DEV] Vet alert email to ${user.email} for alert ${alert.id} - ${subject}`);
  } catch (error) {
    console.error('Send vet alert email error:', error);
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  getUserNotificationPrefs,
  sendOpportunityMatchEmail,
  sendVetAlertUserEmail
};
