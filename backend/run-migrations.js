/**
 * Migration Runner Script
 * Run with: node run-migrations.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'africavet_cms',
  multipleStatements: true,
  charset: 'utf8mb4'
};

// Migrations in order of execution
const MIGRATIONS = [
  '001_add_multilingual_categories.sql',
  '002_add_multilingual_posts.sql',
  '003_add_multilingual_menus.sql',
  'create_settings_table.sql',
  '004_create_presentation_page.sql',
  '005_create_elearning_tables.sql',
  '006_create_ohwr_config_tables.sql',
  '007_add_email_verification.sql',
  '007_add_geolocation_field.sql',
  '008_resource_submissions.sql',
  '008_create_cohrm_tables.sql',
  '009_create_cohrm_scan_tables.sql',
  '010_create_newsletter_tables.sql',
  '010_extend_cohrm_schema.sql',
  '011_add_other_fields_and_geometry.sql',
  '011_create_certificate_templates.sql',
  '012_add_quiz_weights.sql',
  '012_create_cohrm_validation_assignees.sql',
  '013_add_newsletter_attachments.sql',
  '013_create_cohrm_notifications.sql',
  '014_add_powerpoint_support.sql',
  '015_add_default_language_setting.sql',
  '016_transform_to_vet_link.sql',
  '017_create_vet_alerts.sql',
  '018_create_opportunities.sql',
  '022_enhance_user_profiles.sql',
  '023_create_notifications_system.sql',
  'create_homepage_sections.sql',
  'update_pillars_partners.sql',
  'fix_encoding.sql'
];

async function runMigrations() {
  console.log('='.repeat(50));
  console.log('AfricaVet CMS - Migration Runner');
  console.log('='.repeat(50));
  console.log(`Database: ${DB_CONFIG.database}@${DB_CONFIG.host}`);
  console.log('');

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('Connected to database\n');

    const migrationsDir = path.join(__dirname, 'migrations');
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const migration of MIGRATIONS) {
      const migrationPath = path.join(migrationsDir, migration);

      if (!fs.existsSync(migrationPath)) {
        console.log(`⏭️  SKIP: ${migration} (file not found)`);
        skipCount++;
        continue;
      }

      try {
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Skip empty files
        if (!sql.trim()) {
          console.log(`⏭️  SKIP: ${migration} (empty file)`);
          skipCount++;
          continue;
        }

        await connection.query(sql);
        console.log(`✅ OK: ${migration}`);
        successCount++;
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_ENTRY' || err.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  WARN: ${migration} (already applied)`);
          skipCount++;
        } else {
          console.log(`❌ ERROR: ${migration}`);
          console.log(`   ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Migration Summary:');
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ⏭️  Skipped: ${skipCount}`);
    console.log(`  ❌ Errors:  ${errorCount}`);
    console.log('='.repeat(50));

  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();
