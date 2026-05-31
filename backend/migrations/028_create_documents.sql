-- Migration: Create Documents Table
-- Date: 2026-03-28
-- Description: Table principale des documents du gestionnaire documentaire AfricaVet

-- =====================================================
-- Table: documents
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    title_fr VARCHAR(500) NOT NULL,
    title_en VARCHAR(500) DEFAULT NULL,
    description_fr TEXT,
    description_en TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_type VARCHAR(50) DEFAULT NULL COMMENT 'Extension: pdf, docx, xlsx, etc.',
    mime_type VARCHAR(100) DEFAULT NULL,
    thumbnail_path VARCHAR(500) DEFAULT NULL,
    country_code VARCHAR(3) DEFAULT NULL COMMENT 'Code ISO 3166-1 alpha-2 ou alpha-3',
    organization_id INT DEFAULT NULL COMMENT 'Organisation source du document',
    language ENUM('fr','en','ar','pt','sw') NOT NULL DEFAULT 'fr',
    year_published INT DEFAULT NULL,
    author VARCHAR(255) DEFAULT NULL,
    source_url VARCHAR(500) DEFAULT NULL COMMENT 'URL source si document externe',
    tags JSON DEFAULT NULL COMMENT 'Tableau de tags libres',
    download_count INT NOT NULL DEFAULT 0,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    uploaded_by INT NOT NULL,
    status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_documents_category (category_id),
    KEY idx_documents_country (country_code),
    KEY idx_documents_status (status),
    KEY idx_documents_featured (is_featured),
    KEY idx_documents_uploaded_by (uploaded_by),
    KEY idx_documents_year (year_published),
    KEY idx_documents_organization (organization_id),
    FULLTEXT KEY ft_documents_search (title_fr, title_en, description_fr, description_en),
    CONSTRAINT fk_documents_category FOREIGN KEY (category_id) REFERENCES document_categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_documents_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
