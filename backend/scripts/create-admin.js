// Script to create or reset admin user
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'onehealth_cms'
    });

    try {
        const email = 'admin@africavet.com';
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if admin exists by email or username
        const [existing] = await connection.query('SELECT id, email FROM users WHERE email = ? OR username = ?', [email, 'admin']);

        if (existing.length > 0) {
            // Update existing admin (by email or username)
            await connection.query(
                `UPDATE users SET
                    email = ?,
                    password = ?,
                    status = 'active',
                    is_active = 1,
                    email_verified = 1,
                    role = 'admin'
                 WHERE email = ? OR username = ?`,
                [email, hashedPassword, email, 'admin']
            );
            console.log('Admin user updated successfully!');
        } else {
            // Create new admin
            await connection.query(
                `INSERT INTO users (username, email, password, first_name, last_name, role, status, is_active, email_verified)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['admin', email, hashedPassword, 'Admin', 'AfricaVET', 'admin', 'active', 1, 1]
            );
            console.log('Admin user created successfully!');
        }

        console.log('\n=== Login Credentials ===');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('========================\n');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

createAdmin();
