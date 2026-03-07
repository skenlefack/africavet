-- Migration: Create VET Alert System
-- Replaces COHRM with a simplified veterinary alert system

-- =========================================
-- 1. CREATE VET ALERTS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS vet_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE COMMENT 'Format: ALERT-YYYYMM-XXXX',

  -- Type d'alerte
  alert_type ENUM('disease_outbreak', 'emergency', 'vaccination_campaign', 'food_safety', 'wildlife', 'other') NOT NULL DEFAULT 'disease_outbreak',

  -- Contenu bilingue
  title_fr VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  description_fr TEXT,
  description_en TEXT,

  -- Localisation
  country VARCHAR(100) DEFAULT 'Cameroun',
  region VARCHAR(100),
  city VARCHAR(100),
  location_details TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Informations sanitaires
  species TEXT COMMENT 'Espèces concernées (JSON array)',
  disease_name VARCHAR(200),
  symptoms TEXT,
  affected_count INT DEFAULT 0 COMMENT 'Nombre d''animaux affectés',
  dead_count INT DEFAULT 0 COMMENT 'Nombre de morts',
  suspected_cause TEXT,

  -- Statut simplifié
  status ENUM('pending', 'approved', 'rejected', 'investigating', 'resolved') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',

  -- Rapporteur
  reporter_name VARCHAR(200),
  reporter_phone VARCHAR(50),
  reporter_email VARCHAR(200),
  reporter_organization VARCHAR(200),
  is_anonymous TINYINT(1) DEFAULT 0,
  user_id INT COMMENT 'Si utilisateur connecté',

  -- Validation
  validated_by INT,
  validated_at DATETIME,
  validation_notes TEXT,
  rejection_reason TEXT,

  -- Résolution
  resolved_by INT,
  resolved_at DATETIME,
  resolution_notes TEXT,
  actions_taken TEXT,

  -- Notifications
  notifications_sent TINYINT(1) DEFAULT 0,
  notifications_sent_at DATETIME,

  -- Métadonnées
  views_count INT DEFAULT 0,
  is_public TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,

  -- Indexes
  INDEX idx_alert_status (status),
  INDEX idx_alert_priority (priority),
  INDEX idx_alert_type (alert_type),
  INDEX idx_alert_country (country),
  INDEX idx_alert_region (region),
  INDEX idx_alert_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 2. CREATE VET ALERT PHOTOS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS vet_alert_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_size INT,
  file_type VARCHAR(100),
  caption TEXT,
  is_primary TINYINT(1) DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES vet_alerts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 3. CREATE VET ALERT HISTORY TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS vet_alert_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_id INT NOT NULL,
  action VARCHAR(100) NOT NULL COMMENT 'created, status_changed, validated, rejected, resolved, etc.',
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  notes TEXT,
  performed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES vet_alerts(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 4. CREATE VET ALERT NOTIFICATIONS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS vet_alert_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_id INT NOT NULL,
  notification_type ENUM('email', 'sms', 'push', 'webhook') NOT NULL DEFAULT 'email',
  recipient_email VARCHAR(200),
  recipient_phone VARCHAR(50),
  subject VARCHAR(500),
  content TEXT,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  sent_at DATETIME,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alert_id) REFERENCES vet_alerts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 5. CREATE VET ALERT SUBSCRIBERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS vet_alert_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(200),
  phone VARCHAR(50),
  name VARCHAR(200),
  organization VARCHAR(200),
  country VARCHAR(100) DEFAULT 'Cameroun',
  region VARCHAR(100),
  alert_types JSON COMMENT 'Types d''alertes à recevoir',
  is_active TINYINT(1) DEFAULT 1,
  verification_token VARCHAR(100),
  verified_at DATETIME,
  unsubscribed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subscriber_email (email),
  INDEX idx_subscriber_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 6. GENERATE ALERT CODE TRIGGER
-- Note: Run this trigger separately via MySQL client with DELIMITER support
-- =========================================

-- DROP TRIGGER IF EXISTS generate_alert_code;
-- The trigger should be created manually via phpMyAdmin or MySQL CLI:
/*
DELIMITER //
CREATE TRIGGER generate_alert_code
BEFORE INSERT ON vet_alerts
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE year_month VARCHAR(6);

  SET year_month = DATE_FORMAT(NOW(), '%Y%m');

  SELECT COALESCE(MAX(CAST(SUBSTRING(code, -4) AS UNSIGNED)), 0) + 1
  INTO next_num
  FROM vet_alerts
  WHERE code LIKE CONCAT('ALERT-', year_month, '-%');

  SET NEW.code = CONCAT('ALERT-', year_month, '-', LPAD(next_num, 4, '0'));
END//
DELIMITER ;
*/

-- =========================================
-- 7. UPDATE SETTINGS FOR VET ALERT
-- =========================================

INSERT IGNORE INTO settings (setting_key, setting_value, setting_group) VALUES
('vet_alert_enabled', 'true', 'features'),
('vet_alert_email_notifications', 'true', 'vet_alert'),
('vet_alert_admin_email', '', 'vet_alert'),
('vet_alert_require_approval', 'true', 'vet_alert'),
('vet_alert_auto_publish_trusted', 'false', 'vet_alert');
