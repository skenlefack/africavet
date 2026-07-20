-- =====================================================
-- Migration 046: Create opportunity access tracking table
-- Tracks anonymous user access to opportunities for freemium gating
-- =====================================================

CREATE TABLE IF NOT EXISTS opportunity_access_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  visitor_fingerprint VARCHAR(64) NOT NULL COMMENT 'Hash of IP + User-Agent for anonymous tracking',
  ip_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 hashed IP address',
  user_id INT DEFAULT NULL COMMENT 'User ID if authenticated',
  opportunity_id INT DEFAULT NULL COMMENT 'Specific opportunity viewed (NULL for listing page)',
  page_type ENUM('listing', 'detail') NOT NULL DEFAULT 'detail',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_visitor_fingerprint (visitor_fingerprint),
  INDEX idx_ip_hash (ip_hash),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Aggregated view count per visitor (updated on each access)
CREATE TABLE IF NOT EXISTS opportunity_access_counts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  visitor_fingerprint VARCHAR(64) NOT NULL UNIQUE,
  ip_hash VARCHAR(64) NOT NULL,
  user_id INT DEFAULT NULL,
  total_views INT DEFAULT 0,
  detail_views INT DEFAULT 0 COMMENT 'Only detail page views count toward limit',
  first_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_visitor_fingerprint (visitor_fingerprint),
  INDEX idx_ip_hash (ip_hash),
  INDEX idx_detail_views (detail_views)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
