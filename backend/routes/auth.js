const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const { generateVerificationToken, sendVerificationEmail, sendAccountActivatedEmail } = require('../services/emailService');

// CV upload configuration
const cvUploadDir = path.join(__dirname, '..', 'uploads', 'cvs');
if (!fs.existsSync(cvUploadDir)) {
  fs.mkdirSync(cvUploadDir, { recursive: true });
}

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, cvUploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `cv-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext.replace('.', ''))) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX files are allowed'), false);
    }
  }
});

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password, first_name, last_name, lang } = req.body;

    // Check if user exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Un compte existe déjà avec cette adresse email ou ce nom d\'utilisateur' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with email_verified = false
    const [result] = await db.query(
      `INSERT INTO users (username, email, password, first_name, last_name, email_verified, email_verification_token, email_verification_expires, is_active)
       VALUES (?, ?, ?, ?, ?, FALSE, ?, ?, TRUE)`,
      [username, email, hashedPassword, first_name || '', last_name || '', verificationToken, verificationExpires]
    );

    // Send verification email
    const userName = first_name || username;
    try {
      await sendVerificationEmail(email, userName, verificationToken, lang || 'fr');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails - user can request a new one
    }

    res.status(201).json({
      success: true,
      message: 'Inscription réussie ! Veuillez vérifier votre boîte email pour activer votre compte.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue. Veuillez réessayer.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Adresse email ou mot de passe incorrect' });
    }

    const user = users[0];

    // Check if account is active
    if (user.status !== 'active' || user.is_active === false || user.is_active === 0) {
      return res.status(401).json({ success: false, message: 'Votre compte a été désactivé. Contactez l\'administrateur.' });
    }

    // Check if email is verified
    if (user.email_verified === false || user.email_verified === 0) {
      return res.status(401).json({
        success: false,
        message: 'Veuillez vérifier votre adresse email avant de vous connecter. Un email de confirmation vous a été envoyé.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Adresse email ou mot de passe incorrect' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Get user permissions from groups
    const [permissions] = await db.query(`
      SELECT DISTINCT p.slug FROM permissions p
      INNER JOIN group_permissions gp ON p.id = gp.permission_id
      INNER JOIN user_groups ug ON gp.group_id = ug.group_id
      WHERE ug.user_id = ?
    `, [user.id]);

    const token = generateToken(user);

    // Remove password from response
    delete user.password;
    delete user.reset_token;
    delete user.reset_token_expires;

    // Add permissions to user object
    user.permissions = permissions.map(p => p.slug);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue. Veuillez réessayer.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, email, first_name, last_name, role, avatar, bio, status, created_at,
              profession, specialization, skills, country, city, years_experience, education_level,
              cv_url, cv_original_name, phone, preferred_language
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    // Get user permissions from groups
    const [permissions] = await db.query(`
      SELECT DISTINCT p.slug FROM permissions p
      INNER JOIN group_permissions gp ON p.id = gp.permission_id
      INNER JOIN user_groups ug ON gp.group_id = ug.group_id
      WHERE ug.user_id = ?
    `, [req.user.id]);

    const user = users[0];
    user.permissions = permissions.map(p => p.slug);

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue. Veuillez réessayer.' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      first_name, last_name, bio, avatar,
      profession, specialization, skills, country, city,
      years_experience, education_level, phone, preferred_language
    } = req.body;

    await db.query(
      `UPDATE users SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        bio = COALESCE(?, bio),
        avatar = COALESCE(?, avatar),
        profession = COALESCE(?, profession),
        specialization = COALESCE(?, specialization),
        skills = COALESCE(?, skills),
        country = COALESCE(?, country),
        city = COALESCE(?, city),
        years_experience = COALESCE(?, years_experience),
        education_level = COALESCE(?, education_level),
        phone = COALESCE(?, phone),
        preferred_language = COALESCE(?, preferred_language)
      WHERE id = ?`,
      [
        first_name, last_name, bio, avatar,
        profession, specialization,
        skills ? JSON.stringify(skills) : null,
        country, city,
        years_experience !== undefined ? years_experience : null,
        education_level, phone, preferred_language,
        req.user.id
      ]
    );

    const [updated] = await db.query(
      `SELECT id, username, email, first_name, last_name, role, avatar, bio,
              profession, specialization, skills, country, city, years_experience,
              education_level, cv_url, cv_original_name, phone, preferred_language
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    res.json({ success: true, message: 'Profil mis à jour', data: updated[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue. Veuillez réessayer.' });
  }
});

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', auth, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Le mot de passe actuel est incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue. Veuillez réessayer.' });
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this token
    const [users] = await db.query(
      'SELECT id, username, email, first_name, email_verification_expires FROM users WHERE email_verification_token = ?',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Lien de vérification invalide ou expiré' });
    }

    const user = users[0];

    // Check if token is expired
    if (new Date(user.email_verification_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Le lien de vérification a expiré. Veuillez en demander un nouveau.' });
    }

    // Update user to verified
    await db.query(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?',
      [user.id]
    );

    // Send account activated email
    const userName = user.first_name || user.username;
    try {
      await sendAccountActivatedEmail(user.email, userName, 'fr');
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError);
    }

    res.json({ success: true, message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue. Veuillez réessayer.' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, lang } = req.body;

    // Find user
    const [users] = await db.query(
      'SELECT id, username, first_name, email_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if user exists
      return res.json({ success: true, message: 'Si votre adresse email est enregistrée, vous recevrez un lien de vérification.' });
    }

    const user = users[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ success: false, message: 'Votre adresse email est déjà vérifiée' });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.query(
      'UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE id = ?',
      [verificationToken, verificationExpires, user.id]
    );

    // Send email
    const userName = user.first_name || user.username;
    await sendVerificationEmail(email, userName, verificationToken, lang || 'fr');

    res.json({ success: true, message: 'Email de vérification envoyé' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue. Veuillez réessayer.' });
  }
});

// @route   POST /api/auth/profile/cv
// @desc    Upload CV
// @access  Private
router.post('/profile/cv', auth, (req, res) => {
  cvUpload.single('cv')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
      const cvUrl = `/uploads/cvs/${req.file.filename}`;

      // Delete old CV file if exists
      const [existing] = await db.query('SELECT cv_url FROM users WHERE id = ?', [req.user.id]);
      if (existing[0]?.cv_url) {
        const oldPath = path.join(__dirname, '..', existing[0].cv_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      await db.query(
        'UPDATE users SET cv_url = ?, cv_original_name = ? WHERE id = ?',
        [cvUrl, req.file.originalname, req.user.id]
      );

      res.json({
        success: true,
        message: 'CV uploaded successfully',
        data: { cv_url: cvUrl, cv_original_name: req.file.originalname }
      });
    } catch (error) {
      console.error('CV upload error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// @route   DELETE /api/auth/profile/cv
// @desc    Delete CV
// @access  Private
router.delete('/profile/cv', auth, async (req, res) => {
  try {
    const [existing] = await db.query('SELECT cv_url FROM users WHERE id = ?', [req.user.id]);

    if (existing[0]?.cv_url) {
      const filePath = path.join(__dirname, '..', existing[0].cv_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query('UPDATE users SET cv_url = NULL, cv_original_name = NULL WHERE id = ?', [req.user.id]);

    res.json({ success: true, message: 'CV deleted' });
  } catch (error) {
    console.error('Delete CV error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/notification-preferences
// @desc    Get notification preferences
// @access  Private
router.get('/notification-preferences', auth, async (req, res) => {
  try {
    const [prefs] = await db.query(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [req.user.id]
    );

    if (prefs.length === 0) {
      // Return defaults
      return res.json({
        success: true,
        data: {
          email_opportunities: true,
          email_vet_alerts: true,
          email_elearning: true,
          email_newsletter: true,
          inapp_opportunities: true,
          inapp_vet_alerts: true,
          inapp_elearning: true,
          inapp_newsletter: true,
          email_frequency: 'instant'
        }
      });
    }

    res.json({ success: true, data: prefs[0] });
  } catch (error) {
    console.error('Get notification prefs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/auth/notification-preferences
// @desc    Update notification preferences
// @access  Private
router.put('/notification-preferences', auth, async (req, res) => {
  try {
    const {
      email_opportunities, email_vet_alerts, email_elearning, email_newsletter,
      inapp_opportunities, inapp_vet_alerts, inapp_elearning, inapp_newsletter,
      email_frequency
    } = req.body;

    await db.query(
      `INSERT INTO notification_preferences
        (user_id, email_opportunities, email_vet_alerts, email_elearning, email_newsletter,
         inapp_opportunities, inapp_vet_alerts, inapp_elearning, inapp_newsletter, email_frequency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        email_opportunities = VALUES(email_opportunities),
        email_vet_alerts = VALUES(email_vet_alerts),
        email_elearning = VALUES(email_elearning),
        email_newsletter = VALUES(email_newsletter),
        inapp_opportunities = VALUES(inapp_opportunities),
        inapp_vet_alerts = VALUES(inapp_vet_alerts),
        inapp_elearning = VALUES(inapp_elearning),
        inapp_newsletter = VALUES(inapp_newsletter),
        email_frequency = VALUES(email_frequency)`,
      [
        req.user.id,
        email_opportunities ? 1 : 0, email_vet_alerts ? 1 : 0,
        email_elearning ? 1 : 0, email_newsletter ? 1 : 0,
        inapp_opportunities ? 1 : 0, inapp_vet_alerts ? 1 : 0,
        inapp_elearning ? 1 : 0, inapp_newsletter ? 1 : 0,
        email_frequency || 'instant'
      ]
    );

    res.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    console.error('Update notification prefs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
