-- Migration: Create Document Downloads Tracking Table
-- Date: 2026-03-28
-- Description: Suivi des telechargements de documents pour statistiques et audit

-- =====================================================
-- Table: document_downloads
-- =====================================================
CREATE TABLE IF NOT EXISTS document_downloads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    user_id INT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IPv4 ou IPv6',
    user_agent TEXT,
    downloaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_document_downloads_document (document_id),
    KEY idx_document_downloads_date (downloaded_at),
    KEY idx_document_downloads_user (user_id),
    CONSTRAINT fk_document_downloads_document FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_document_downloads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
