// Script to create or reset admin user
// Usage: node scripts/create-admin.js <email> <password>
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node scripts/create-admin.js <email> <password>');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Error: Password must be at least 8 characters.');
  process.exit(1);
}

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'africavet_cms'
  });

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ? OR username = ?', [email, 'admin']
    );

    if (existing.length > 0) {
      await connection.query(
        `UPDATE users SET email = ?, password = ?, status = 'active', is_active = 1,
         email_verified = 1, role = 'admin' WHERE email = ? OR username = ?`,
        [email, hashedPassword, email, 'admin']
      );
      console.log('Admin user updated successfully.');
    } else {
      await connection.query(
        `INSERT INTO users (username, email, password, first_name, last_name, role, status, is_active, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin', email, hashedPassword, 'Admin', 'AfricaVET', 'admin', 'active', 1, 1]
      );
      console.log('Admin user created successfully.');
    }

    console.log(`Admin email: ${email}`);
    console.log('Password set successfully (not displayed for security).');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

createAdmin();
