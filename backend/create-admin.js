// Script pour créer un utilisateur administrateur
// Usage: node create-admin.js <email> <password>
// Example: node create-admin.js admin@africavet.com "MyStr0ngP@ss!"

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node create-admin.js <email> <password>');
  console.error('Example: node create-admin.js admin@africavet.com "MyStr0ngP@ss!"');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Error: Password must be at least 8 characters.');
  process.exit(1);
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'africavet_cms'
};

async function createAdmin() {
  let connection;

  try {
    console.log('Connexion a la base de donnees...');
    connection = await mysql.createConnection(dbConfig);

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user already exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      console.log('User exists, updating password and role...');
      await connection.query(
        'UPDATE users SET password = ?, status = ?, role = ? WHERE email = ?',
        [hashedPassword, 'active', 'admin', email]
      );
      console.log('Admin user updated.');
    } else {
      console.log('Creating admin user...');
      await connection.query(
        `INSERT INTO users (username, email, password, first_name, last_name, role, status, email_verified, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, NOW())`,
        ['admin', email, hashedPassword, 'Admin', 'AfricaVET', 'admin', 'active']
      );
      console.log('Admin user created.');
    }

    console.log(`\nAdmin email: ${email}`);
    console.log('Password set successfully (not displayed for security).');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin();
