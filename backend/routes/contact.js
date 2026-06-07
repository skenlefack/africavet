const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, authorize } = require('../middleware/auth');
const { getTransporter } = require('../services/emailService');

// Helper to send email via transporter
const sendContactEmail = async (to, subject, html) => {
  const { transporter, from } = await getTransporter();
  return transporter.sendMail({ from, to, subject, html });
};

// POST /api/contact - Submit a contact message (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs obligatoires.' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Adresse e-mail invalide.' });
    }

    // Rate limiting: max 3 messages per email per hour
    const [recent] = await db.query(
      `SELECT COUNT(*) as count FROM contact_messages
       WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [email]
    );
    if (recent[0].count >= 3) {
      return res.status(429).json({ success: false, message: 'Trop de messages envoyés. Veuillez réessayer plus tard.' });
    }

    // Save to database
    const [result] = await db.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone ? phone.trim() : null,
        subject.trim(),
        message.trim(),
        req.ip || req.headers['x-forwarded-for'],
        req.headers['user-agent']
      ]
    );

    // Send notification email to admin
    try {
      await sendContactEmail(
        'contact@africavet.com',
        `[Contact AfricaVET] ${subject}`,
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7ac142 0%, #354e84 100%); padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: #fff; margin: 0;">Nouveau message de contact</h2>
            </div>
            <div style="padding: 25px; background: #f8f9fa; border: 1px solid #e9ecef;">
              <p><strong>Nom :</strong> ${name}</p>
              <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ''}
              <p><strong>Sujet :</strong> ${subject}</p>
              <hr style="border: 1px solid #dee2e6;">
              <p><strong>Message :</strong></p>
              <div style="background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #e9ecef;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <div style="padding: 15px; background: #e9ecef; border-radius: 0 0 8px 8px; text-align: center; color: #6c757d; font-size: 12px;">
              Message reçu le ${new Date().toLocaleString('fr-FR')} via africavet.com
            </div>
          </div>`
      );
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
    }

    // Send confirmation email to sender
    try {
      await sendContactEmail(
        email,
        'Confirmation - Votre message a bien été reçu | AfricaVET',
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7ac142 0%, #354e84 100%); padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: #fff; margin: 0;">AfricaVET</h2>
            </div>
            <div style="padding: 25px; background: #fff; border: 1px solid #e9ecef;">
              <p>Bonjour <strong>${name}</strong>,</p>
              <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
              <p>Notre équipe examinera votre demande et vous répondra dans les meilleurs délais.</p>
              <hr style="border: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 13px;"><strong>Votre message :</strong></p>
              <p style="color: #6c757d; font-size: 13px;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; color: #6c757d; font-size: 12px;">
              AfricaVET - La plateforme vétérinaire panafricaine
            </div>
          </div>`
      );
    } catch (emailError) {
      console.error('Failed to send contact confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.',
      id: result.insertId
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur. Veuillez réessayer.' });
  }
});

// GET /api/contact - List all contact messages (admin only)
router.get('/', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let where = '1=1';
    const params = [];

    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM contact_messages WHERE ${where}`, params
    );

    const [messages] = await db.query(
      `SELECT * FROM contact_messages WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT /api/contact/:id/status - Update message status (admin only)
router.put('/:id/status', auth, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied', 'archived'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide.' });
    }

    const updates = { status };
    if (status === 'replied') {
      updates.replied_at = new Date();
      updates.replied_by = req.user.id;
    }

    await db.query(
      `UPDATE contact_messages SET status = ?, replied_at = ?, replied_by = ? WHERE id = ?`,
      [updates.status, updates.replied_at || null, updates.replied_by || null, req.params.id]
    );

    res.json({ success: true, message: 'Statut mis à jour.' });
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// DELETE /api/contact/:id - Delete a message (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Message supprimé.' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
