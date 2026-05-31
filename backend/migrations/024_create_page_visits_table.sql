-- =====================================================
-- Migration 024: Create page visits analytics tables
-- =====================================================

-- Raw visit tracking data
CREATE TABLE IF NOT EXISTS page_visits (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  visitor_id VARCHAR(64) NOT NULL COMMENT 'Unique visitor identifier (hashed)',
  session_id VARCHAR(64) NOT NULL COMMENT 'Session identifier',
  ip_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 hashed IP',
  page_url VARCHAR(500) NOT NULL,
  page_title VARCHAR(255) DEFAULT NULL,
  page_type ENUM('home','article','page','category','elearning','annuaire','other') DEFAULT 'other',
  referrer_url VARCHAR(500) DEFAULT NULL,
  referrer_domain VARCHAR(255) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  device_type ENUM('desktop','mobile','tablet') DEFAULT 'desktop',
  browser VARCHAR(100) DEFAULT NULL,
  browser_version VARCHAR(50) DEFAULT NULL,
  os VARCHAR(100) DEFAULT NULL,
  country_code CHAR(2) DEFAULT NULL COMMENT 'ISO 3166-1 alpha-2',
  country_name VARCHAR(100) DEFAULT NULL,
  continent VARCHAR(20) DEFAULT NULL,
  is_bounce TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_created_at (created_at),
  INDEX idx_visitor_id (visitor_id),
  INDEX idx_country_code (country_code),
  INDEX idx_device_type (device_type),
  INDEX idx_browser (browser),
  INDEX idx_continent (continent),
  INDEX idx_page_type (page_type),
  INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily aggregated stats (for fast dashboard queries)
CREATE TABLE IF NOT EXISTS page_visits_daily (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_visits INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  page_views INT DEFAULT 0,
  bounce_count INT DEFAULT 0,
  desktop_visits INT DEFAULT 0,
  mobile_visits INT DEFAULT 0,
  tablet_visits INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
