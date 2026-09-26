-- Migration 055: Create authors table for normalized author management

CREATE TABLE IF NOT EXISTS authors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_normalized VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  bio_fr TEXT DEFAULT NULL,
  bio_en TEXT DEFAULT NULL,
  avatar VARCHAR(500) DEFAULT NULL,
  role VARCHAR(100) DEFAULT 'auteur',
  specialties JSON DEFAULT NULL,
  social_links JSON DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  articles_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
