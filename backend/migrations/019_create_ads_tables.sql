-- Migration: Create Advertisement Management Tables
-- Date: 2026-02-15
-- Description: Tables pour le module de gestion des publicites

-- =====================================================
-- Table: ad_placements (Emplacements publicitaires)
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_placements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(100) NOT NULL COMMENT 'Description de la position sur le site',
    width INT NOT NULL DEFAULT 300,
    height INT NOT NULL DEFAULT 250,
    max_ads INT NOT NULL DEFAULT 1 COMMENT 'Nombre max de pubs en rotation',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: ad_providers (Fournisseurs publicitaires)
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('custom', 'adsense', 'ad_manager', 'network') NOT NULL DEFAULT 'custom',
    description TEXT,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    config JSON COMMENT 'Configuration specifique au fournisseur',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: advertisements (Publicites)
-- =====================================================
CREATE TABLE IF NOT EXISTS advertisements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    placement_id INT NOT NULL,
    provider_id INT NOT NULL,
    type ENUM('image', 'html', 'script', 'adsense') NOT NULL DEFAULT 'image',

    -- Contenu de la publicite
    image_url VARCHAR(500) DEFAULT NULL,
    image_url_mobile VARCHAR(500) DEFAULT NULL COMMENT 'Image alternative pour mobile',
    target_url VARCHAR(500) DEFAULT NULL COMMENT 'URL de destination au clic',
    alt_text VARCHAR(200) DEFAULT NULL,
    ad_code TEXT DEFAULT NULL COMMENT 'Code HTML/JS pour types html/script/adsense',

    -- AdSense specifique
    adsense_client VARCHAR(50) DEFAULT NULL,
    adsense_slot VARCHAR(50) DEFAULT NULL,

    -- Statut et planification
    status ENUM('draft', 'active', 'paused', 'scheduled', 'expired') NOT NULL DEFAULT 'draft',
    start_date DATETIME DEFAULT NULL,
    end_date DATETIME DEFAULT NULL,

    -- Priorite et rotation
    priority INT NOT NULL DEFAULT 5 COMMENT '1-10, plus haut = plus prioritaire',
    weight INT NOT NULL DEFAULT 100 COMMENT 'Poids pour rotation aleatoire',

    -- Informations annonceur
    advertiser_name VARCHAR(200) DEFAULT NULL,
    advertiser_email VARCHAR(200) DEFAULT NULL,
    advertiser_phone VARCHAR(50) DEFAULT NULL,

    -- Budget (optionnel)
    budget_type ENUM('unlimited', 'impressions', 'clicks', 'daily_impressions', 'daily_clicks') DEFAULT 'unlimited',
    budget_value INT DEFAULT NULL,

    -- Ciblage (pour future expansion)
    target_countries JSON DEFAULT NULL,
    target_devices JSON DEFAULT NULL COMMENT '["desktop", "mobile", "tablet"]',

    -- Metadata
    notes TEXT,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (placement_id) REFERENCES ad_placements(id) ON DELETE RESTRICT,
    FOREIGN KEY (provider_id) REFERENCES ad_providers(id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_placement (placement_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_priority (priority DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: ad_statistics (Statistiques journalieres agregees)
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ad_id INT NOT NULL,
    date DATE NOT NULL,
    impressions INT NOT NULL DEFAULT 0,
    clicks INT NOT NULL DEFAULT 0,
    unique_impressions INT NOT NULL DEFAULT 0,
    unique_clicks INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (ad_id) REFERENCES advertisements(id) ON DELETE CASCADE,
    UNIQUE KEY uk_ad_date (ad_id, date),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: ad_events (Evenements bruts pour analyse detaillee)
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ad_id INT NOT NULL,
    event_type ENUM('impression', 'click') NOT NULL,
    visitor_id VARCHAR(64) DEFAULT NULL COMMENT 'Hash unique du visiteur',
    ip_hash VARCHAR(64) DEFAULT NULL COMMENT 'Hash de IP pour deduplication',
    user_agent VARCHAR(500) DEFAULT NULL,
    device_type ENUM('desktop', 'mobile', 'tablet', 'unknown') DEFAULT 'unknown',
    page_url VARCHAR(500) DEFAULT NULL,
    referrer_url VARCHAR(500) DEFAULT NULL,
    country_code CHAR(2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ad_id) REFERENCES advertisements(id) ON DELETE CASCADE,
    INDEX idx_ad_type (ad_id, event_type),
    INDEX idx_created (created_at),
    INDEX idx_visitor (visitor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Donnees initiales: Emplacements predefinies
-- =====================================================
INSERT INTO ad_placements (name, name_fr, slug, location, width, height, max_ads, is_active) VALUES
('Header Banner', 'Banniere Header', 'header-banner', 'Zone logo / en-tete du site', 670, 85, 3, 1),
('Sidebar Top', 'Sidebar Haut', 'sidebar-top', 'Colonne droite - position haute', 300, 250, 2, 1),
('Sidebar Bottom', 'Sidebar Bas', 'sidebar-bottom', 'Colonne droite - position basse', 300, 250, 2, 1),
('Below Most Viewed', 'Sous Plus Vus', 'below-mostview', 'Sous la section Les Plus Vus', 300, 250, 2, 1),
('Content Banner', 'Banniere Contenu', 'content-banner', 'Dans le corps du contenu', 728, 90, 1, 1),
('Footer Banner', 'Banniere Footer', 'footer-banner', 'Zone pied de page', 728, 90, 2, 1),
('Article Inline', 'Dans Article', 'article-inline', 'Integre dans les articles', 300, 250, 1, 1),
('Mobile Header', 'Header Mobile', 'mobile-header', 'Banniere header specifique mobile', 320, 50, 1, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- Donnees initiales: Fournisseurs
-- =====================================================
INSERT INTO ad_providers (name, slug, type, description, is_active, config) VALUES
('Publicite Personnalisee', 'custom', 'custom', 'Images et liens geres directement sur AfricaVet', 1, '{}'),
('Google AdSense', 'google-adsense', 'adsense', 'Annonces Google AdSense automatiques', 1, '{"publisher_id": ""}'),
('Google Ad Manager', 'google-ad-manager', 'ad_manager', 'Google Ad Manager (DFP)', 0, '{"network_code": ""}'),
('Reseau Tiers', 'third-party', 'network', 'Code HTML/JS de reseaux publicitaires tiers', 1, '{}')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- Publicite exemple (optionnel)
-- =====================================================
INSERT INTO advertisements (
    name, placement_id, provider_id, type,
    image_url, target_url, alt_text,
    status, priority, weight,
    advertiser_name
) VALUES (
    'Banniere Exemple AfricaVet',
    (SELECT id FROM ad_placements WHERE slug = 'header-banner'),
    (SELECT id FROM ad_providers WHERE slug = 'custom'),
    'image',
    '/uploads/ads/exemple-banner.jpg',
    'https://africavet.com',
    'AfricaVet - Votre partenaire veterinaire',
    'draft',
    5,
    100,
    'AfricaVet'
);
