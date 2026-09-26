-- Annuaire entry reports table
CREATE TABLE IF NOT EXISTS annuaire_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_id INT NOT NULL,
  reporter_id INT DEFAULT NULL,
  reason ENUM('incorrect_info', 'inappropriate', 'duplicate', 'spam', 'other') NOT NULL,
  description TEXT NOT NULL,
  status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
  reviewed_by INT DEFAULT NULL,
  reviewed_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_entry_id (entry_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
