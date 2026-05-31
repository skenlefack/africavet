-- 025: Add SMTP settings to settings table
-- Allows SMTP configuration from admin UI instead of environment variables

INSERT INTO settings (setting_key, setting_value, setting_group, autoload)
VALUES
  ('smtp_host', '', 'smtp', 1),
  ('smtp_port', '587', 'smtp', 1),
  ('smtp_secure', 'false', 'smtp', 1),
  ('smtp_user', '', 'smtp', 1),
  ('smtp_pass', '', 'smtp', 1),
  ('smtp_from', 'noreply@africavet.com', 'smtp', 1)
ON DUPLICATE KEY UPDATE setting_key = setting_key;
