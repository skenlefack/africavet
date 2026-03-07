-- Add default_language setting
-- This setting controls which language the site redirects to by default

INSERT IGNORE INTO settings (setting_key, setting_value, setting_group) VALUES
('default_language', 'fr', 'general');

-- Update site metadata for AfricaVet branding
UPDATE settings SET setting_value = 'AfricaVet' WHERE setting_key = 'site_name';
UPDATE settings SET setting_value = 'Plateforme Panafricaine de Medecine Veterinaire' WHERE setting_key = 'site_description';
