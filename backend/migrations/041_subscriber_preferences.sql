-- Migration 041: Subscriber Alert Preferences + Opportunity Digest
-- Sprint 8: Engagement & Notifications

-- =========================================
-- 1. SUBSCRIBER PREFERENCES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS subscriber_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subscriber_id INT NOT NULL,
  preference_type ENUM('opportunity_digest', 'closing_alert', 'news_alert') NOT NULL,
  countries JSON DEFAULT NULL COMMENT 'Array of country names to filter',
  regions JSON DEFAULT NULL COMMENT 'Array of region slugs',
  opportunity_types JSON DEFAULT NULL COMMENT 'Array: job, tender, market',
  domains JSON DEFAULT NULL COMMENT 'Array of category slugs (subject taxonomy)',
  frequency ENUM('daily', 'weekly', 'monthly') DEFAULT 'weekly',
  is_active TINYINT(1) DEFAULT 1,
  last_sent_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_sub_pref (subscriber_id, preference_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 2. DIGEST LOG TABLE (track what was sent)
-- =========================================

CREATE TABLE IF NOT EXISTS digest_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subscriber_id INT NOT NULL,
  digest_type ENUM('opportunity_digest', 'closing_alert') NOT NULL,
  opportunity_ids JSON NOT NULL COMMENT 'Array of opportunity IDs included',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscriber_id) REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  INDEX idx_digest_subscriber (subscriber_id, digest_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 3. ADD COUNTRY FIELD TO SUBSCRIBERS
-- =========================================

ALTER TABLE newsletter_subscribers
  ADD COLUMN country VARCHAR(100) DEFAULT NULL AFTER language,
  ADD COLUMN preferred_categories JSON DEFAULT NULL AFTER country;
