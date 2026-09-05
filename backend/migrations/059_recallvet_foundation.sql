-- =====================================================
-- RecallVET Foundation Tables
-- Tenant, Structure, Site, User-Tenant mapping, Audit
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;

-- Multi-tenant root
CREATE TABLE IF NOT EXISTS rv_tenant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  country_code CHAR(2) NOT NULL DEFAULT 'CM',
  default_currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  default_language VARCHAR(5) NOT NULL DEFAULT 'fr',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Operational entity (clinic, pharmacy, farm practice, mixed)
CREATE TABLE IF NOT EXISTS rv_structure (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('clinic','farm_practice','pharmacy','mixed') NOT NULL DEFAULT 'mixed',
  license_number VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  INDEX idx_rv_structure_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Physical site (clinic, depot, farm office)
CREATE TABLE IF NOT EXISTS rv_site (
  id INT AUTO_INCREMENT PRIMARY KEY,
  structure_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  address_line VARCHAR(500) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  region VARCHAR(100) DEFAULT NULL,
  country_code CHAR(2) DEFAULT 'CM',
  gps_lat DECIMAL(10,7) DEFAULT NULL,
  gps_lng DECIMAL(10,7) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (structure_id) REFERENCES rv_structure(id) ON DELETE CASCADE,
  INDEX idx_rv_site_structure (structure_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bridge: existing users → tenant/structure/site with role
CREATE TABLE IF NOT EXISTS rv_user_tenant (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tenant_id INT NOT NULL,
  structure_id INT DEFAULT NULL,
  site_id INT DEFAULT NULL,
  role ENUM('owner','vet','assistant','pharmacist','receptionist','farm_tech','admin') NOT NULL DEFAULT 'vet',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES rv_tenant(id) ON DELETE CASCADE,
  FOREIGN KEY (structure_id) REFERENCES rv_structure(id) ON DELETE SET NULL,
  FOREIGN KEY (site_id) REFERENCES rv_site(id) ON DELETE SET NULL,
  UNIQUE KEY uk_user_tenant (user_id, tenant_id),
  INDEX idx_rv_ut_user (user_id),
  INDEX idx_rv_ut_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log for all RecallVET operations
CREATE TABLE IF NOT EXISTS rv_audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT DEFAULT NULL,
  action ENUM('create','update','delete','view','status_change','sign','void','merge') NOT NULL,
  old_values JSON DEFAULT NULL,
  new_values JSON DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rv_audit_tenant (tenant_id),
  INDEX idx_rv_audit_entity (entity_type, entity_id),
  INDEX idx_rv_audit_user (user_id),
  INDEX idx_rv_audit_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reference: species
CREATE TABLE IF NOT EXISTS rv_species (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  category ENUM('companion','livestock','equine','exotic','wildlife','poultry') NOT NULL DEFAULT 'companion',
  sort_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reference: breeds
CREATE TABLE IF NOT EXISTS rv_breed (
  id INT AUTO_INCREMENT PRIMARY KEY,
  species_id INT NOT NULL,
  code VARCHAR(30) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  FOREIGN KEY (species_id) REFERENCES rv_species(id) ON DELETE CASCADE,
  UNIQUE KEY uk_breed_code (species_id, code),
  INDEX idx_rv_breed_species (species_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed common species
INSERT IGNORE INTO rv_species (code, name_fr, name_en, category, sort_order) VALUES
('DOG', 'Chien', 'Dog', 'companion', 1),
('CAT', 'Chat', 'Cat', 'companion', 2),
('CATTLE', 'Bovin', 'Cattle', 'livestock', 3),
('SHEEP', 'Ovin', 'Sheep', 'livestock', 4),
('GOAT', 'Caprin', 'Goat', 'livestock', 5),
('HORSE', 'Equin', 'Horse', 'equine', 6),
('PIG', 'Porcin', 'Pig', 'livestock', 7),
('POULTRY', 'Volaille', 'Poultry', 'poultry', 8),
('RABBIT', 'Lapin', 'Rabbit', 'livestock', 9),
('CAMEL', 'Chameau/Dromadaire', 'Camel/Dromedary', 'livestock', 10),
('DONKEY', 'Ane', 'Donkey', 'equine', 11),
('FISH', 'Poisson', 'Fish', 'exotic', 12);

-- Seed common breeds
INSERT IGNORE INTO rv_breed (species_id, code, name_fr, name_en) VALUES
-- Dogs
((SELECT id FROM rv_species WHERE code='DOG'), 'LOCAL', 'Local / Croisé', 'Local / Mixed'),
((SELECT id FROM rv_species WHERE code='DOG'), 'GSD', 'Berger Allemand', 'German Shepherd'),
((SELECT id FROM rv_species WHERE code='DOG'), 'ROTT', 'Rottweiler', 'Rottweiler'),
((SELECT id FROM rv_species WHERE code='DOG'), 'LAB', 'Labrador', 'Labrador'),
((SELECT id FROM rv_species WHERE code='DOG'), 'PITT', 'Pitbull', 'Pitbull'),
-- Cats
((SELECT id FROM rv_species WHERE code='CAT'), 'LOCAL', 'Local / Croisé', 'Local / Mixed'),
((SELECT id FROM rv_species WHERE code='CAT'), 'PERS', 'Persan', 'Persian'),
((SELECT id FROM rv_species WHERE code='CAT'), 'SIAM', 'Siamois', 'Siamese'),
-- Cattle
((SELECT id FROM rv_species WHERE code='CATTLE'), 'ZEBU', 'Zébu', 'Zebu'),
((SELECT id FROM rv_species WHERE code='CATTLE'), 'NDAMA', 'N\'Dama', 'N\'Dama'),
((SELECT id FROM rv_species WHERE code='CATTLE'), 'GUDALI', 'Goudali', 'Gudali'),
((SELECT id FROM rv_species WHERE code='CATTLE'), 'HOLS', 'Holstein', 'Holstein'),
((SELECT id FROM rv_species WHERE code='CATTLE'), 'BRAHM', 'Brahman', 'Brahman'),
-- Sheep
((SELECT id FROM rv_species WHERE code='SHEEP'), 'DJALLONKE', 'Djallonké', 'Djallonke'),
((SELECT id FROM rv_species WHERE code='SHEEP'), 'PEULH', 'Peulh', 'Fulani'),
-- Goat
((SELECT id FROM rv_species WHERE code='GOAT'), 'NAINE', 'Chèvre naine', 'Dwarf Goat'),
((SELECT id FROM rv_species WHERE code='GOAT'), 'SAHEL', 'Chèvre du Sahel', 'Sahel Goat'),
-- Poultry
((SELECT id FROM rv_species WHERE code='POULTRY'), 'LOCAL_P', 'Poule locale', 'Local Chicken'),
((SELECT id FROM rv_species WHERE code='POULTRY'), 'BROILER', 'Poulet de chair', 'Broiler'),
((SELECT id FROM rv_species WHERE code='POULTRY'), 'LAYER', 'Pondeuse', 'Layer');

SET FOREIGN_KEY_CHECKS = 1;
