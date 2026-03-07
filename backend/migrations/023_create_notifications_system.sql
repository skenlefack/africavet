-- Migration 023: Create notifications system
-- Tables for in-app notifications, user preferences, and opportunity matching logs

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('opportunity_match','vet_alert','elearning','newsletter','system') NOT NULL DEFAULT 'system',
  title_fr VARCHAR(500) NOT NULL,
  title_en VARCHAR(500) DEFAULT NULL,
  message_fr TEXT NOT NULL,
  message_en TEXT DEFAULT NULL,
  link VARCHAR(500) DEFAULT NULL,
  is_read TINYINT(1) DEFAULT 0,
  metadata JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_user_read (user_id, is_read),
  INDEX idx_notifications_type (type),
  INDEX idx_notifications_created (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  email_opportunities TINYINT(1) DEFAULT 1,
  email_vet_alerts TINYINT(1) DEFAULT 1,
  email_elearning TINYINT(1) DEFAULT 1,
  email_newsletter TINYINT(1) DEFAULT 1,
  inapp_opportunities TINYINT(1) DEFAULT 1,
  inapp_vet_alerts TINYINT(1) DEFAULT 1,
  inapp_elearning TINYINT(1) DEFAULT 1,
  inapp_newsletter TINYINT(1) DEFAULT 1,
  email_frequency ENUM('instant','daily','weekly','never') DEFAULT 'instant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opportunity match log table
CREATE TABLE IF NOT EXISTS opportunity_match_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  opportunity_id INT NOT NULL,
  user_id INT NOT NULL,
  match_score INT DEFAULT 0,
  match_reasons JSON DEFAULT NULL,
  email_sent TINYINT(1) DEFAULT 0,
  notification_sent TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_match_opportunity (opportunity_id),
  INDEX idx_match_user (user_id),
  INDEX idx_match_score (match_score),
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
