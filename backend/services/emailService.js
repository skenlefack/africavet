const nodemailer = require('nodemailer');
const db = require('../config/db');

// Cached transporter and config hash
let cachedTransporter = null;
let cachedConfigHash = '';

// Load SMTP config: DB first, then env fallback
const getSmtpConfig = async () => {
  try {
    const [rows] = await db.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_group = 'smtp'"
    );
    const dbConfig = {};
    rows.forEach(r => { dbConfig[r.setting_key] = r.setting_value; });

    if (dbConfig.smtp_host) {
      return {
        host: dbConfig.smtp_host,
        port: parseInt(dbConfig.smtp_port) || 587,
        secure: dbConfig.smtp_secure === 'true',
        user: dbConfig.smtp_user,
        pass: dbConfig.smtp_pass,
        from: dbConfig.smtp_from || 'noreply@africavet.com'
      };
    }
  } catch (e) {
    // DB not ready yet, fall through to env
  }

  return {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@africavet.com'
  };
};

// Get or create transporter (recreate if config changed)
const getTransporter = async () => {
  const config = await getSmtpConfig();
  const hash = JSON.stringify(config);

  if (cachedTransporter && hash === cachedConfigHash) {
    return { transporter: cachedTransporter, from: config.from };
  }

  if (!config.host) {
    // Dev fallback
    cachedTransporter = {
      sendMail: async (options) => {
        console.log('=== EMAIL (Development Mode) ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('================================');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  } else {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass }
    });
  }

  cachedConfigHash = hash;
  return { transporter: cachedTransporter, from: config.from };
};

// Email templates
const templates = {
  verifyEmail: {
    fr: (verificationUrl, userName) => ({
      subject: 'Vérifiez votre adresse email - AfricaVet',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">AfricaVet</h1>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #263238; margin-top: 0;">Bienvenue ${userName} !</h2>
              <p style="color: #607D8B; line-height: 1.6;">
                Merci de vous être inscrit sur AfricaVet. Pour activer votre compte et accéder à toutes nos ressources, veuillez vérifier votre adresse email.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Vérifier mon email
                </a>
              </div>
              <p style="color: #607D8B; line-height: 1.6; font-size: 14px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="color: #2196F3; word-break: break-all; font-size: 14px;">
                ${verificationUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
              <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
                Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    en: (verificationUrl, userName) => ({
      subject: 'Verify your email address - AfricaVet',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">AfricaVet</h1>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #263238; margin-top: 0;">Welcome ${userName}!</h2>
              <p style="color: #607D8B; line-height: 1.6;">
                Thank you for registering on AfricaVet. To activate your account and access all our resources, please verify your email address.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Verify my email
                </a>
              </div>
              <p style="color: #607D8B; line-height: 1.6; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #2196F3; word-break: break-all; font-size: 14px;">
                ${verificationUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
              <p style="color: #9E9E9E; font-size: 12px; text-align: center;">
                This link will expire in 24 hours. If you didn't create an account, please ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  },
  accountActivated: {
    fr: (userName) => ({
      subject: 'Votre compte a été activé - AfricaVet',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">AfricaVet</h1>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #263238; margin-top: 0;">Compte activé avec succès !</h2>
              <p style="color: #607D8B; line-height: 1.6;">
                Bonjour ${userName},<br><br>
                Votre compte a été vérifié et activé avec succès. Vous pouvez maintenant vous connecter et accéder à toutes les ressources de la plateforme AfricaVet.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3002'}/fr/auth/login" style="display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Se connecter
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }),
    en: (userName) => ({
      subject: 'Your account has been activated - AfricaVet',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">AfricaVet</h1>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #263238; margin-top: 0;">Account successfully activated!</h2>
              <p style="color: #607D8B; line-height: 1.6;">
                Hello ${userName},<br><br>
                Your account has been verified and activated successfully. You can now log in and access all the resources on the AfricaVet platform.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3002'}/en/auth/login" style="display: inline-block; background: linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Log in
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    })
  }
};

// Generate verification token
const generateVerificationToken = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (email, userName, token, lang = 'fr') => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
  const verificationUrl = `${frontendUrl}/${lang}/auth/verify-email?token=${token}`;

  const template = templates.verifyEmail[lang] || templates.verifyEmail.fr;
  const { subject, html } = template(verificationUrl, userName);

  try {
    const { transporter, from } = await getTransporter();
    await transporter.sendMail({
      from: `"AfricaVet" <${from}>`,
      to: email,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send account activated email
const sendAccountActivatedEmail = async (email, userName, lang = 'fr') => {
  const template = templates.accountActivated[lang] || templates.accountActivated.fr;
  const { subject, html } = template(userName);

  try {
    const { transporter, from } = await getTransporter();
    await transporter.sendMail({
      from: `"AfricaVet" <${from}>`,
      to: email,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Error sending account activated email:', error);
    throw error;
  }
};

module.exports = {
  getSmtpConfig,
  getTransporter,
  generateVerificationToken,
  sendVerificationEmail,
  sendAccountActivatedEmail
};
