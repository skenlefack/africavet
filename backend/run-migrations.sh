#!/bin/bash
# Script to run all migrations in order
# Usage: docker-compose exec backend sh /app/run-migrations.sh

DB_HOST="${DB_HOST:-db}"
DB_USER="${DB_USER:-africavet}"
DB_PASS="${DB_PASSWORD:-devpassword}"
DB_NAME="${DB_NAME:-africavet_cms}"

echo "Running migrations on $DB_NAME..."

# Run migrations in order
migrations=(
  "001_add_multilingual_categories.sql"
  "002_add_multilingual_posts.sql"
  "003_add_multilingual_menus.sql"
  "create_settings_table.sql"
  "004_create_presentation_page.sql"
  "005_create_elearning_tables.sql"
  "006_create_ohwr_config_tables.sql"
  "007_add_email_verification.sql"
  "007_add_geolocation_field.sql"
  "008_resource_submissions.sql"
  "008_create_cohrm_tables.sql"
  "009_create_cohrm_scan_tables.sql"
  "010_create_newsletter_tables.sql"
  "010_extend_cohrm_schema.sql"
  "011_add_other_fields_and_geometry.sql"
  "011_create_certificate_templates.sql"
  "012_add_quiz_weights.sql"
  "012_create_cohrm_validation_assignees.sql"
  "013_add_newsletter_attachments.sql"
  "013_create_cohrm_notifications.sql"
  "014_add_powerpoint_support.sql"
  "015_add_default_language_setting.sql"
  "016_transform_to_vet_link.sql"
  "017_create_vet_alerts.sql"
  "018_create_opportunities.sql"
  "create_homepage_sections.sql"
  "update_pillars_partners.sql"
)

for migration in "${migrations[@]}"; do
  if [ -f "/app/migrations/$migration" ]; then
    echo "Running $migration..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "/app/migrations/$migration" 2>&1 || echo "Warning: $migration had issues (may already be applied)"
  else
    echo "Skipping $migration (not found)"
  fi
done

echo "Migrations complete!"
