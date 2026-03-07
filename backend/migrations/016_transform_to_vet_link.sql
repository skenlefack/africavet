-- Migration: Transform OHWR-Mapping to VET LINK
-- Add veterinary-specific categories and extend organizations table

-- =========================================
-- 1. ADD NEW VET LINK ORGANIZATION TYPES
-- =========================================

INSERT IGNORE INTO ohwr_organization_types (name, name_en, slug, description, icon, color, display_order, is_active) VALUES
('Clinique vétérinaire', 'Veterinary Clinic', 'vet-clinic', 'Cabinet ou clinique vétérinaire', 'stethoscope', '#2563eb', 1, 1),
('Cabinet vétérinaire', 'Veterinary Practice', 'vet-practice', 'Cabinet vétérinaire privé', 'stethoscope', '#3b82f6', 2, 1),
('Hôpital vétérinaire', 'Veterinary Hospital', 'vet-hospital', 'Hôpital ou centre hospitalier vétérinaire', 'building-2', '#dc2626', 3, 1),
('Service d''urgence', 'Emergency Service', 'emergency', 'Service de garde et urgences vétérinaires 24/7', 'ambulance', '#ea580c', 4, 1),
('Laboratoire vétérinaire', 'Veterinary Laboratory', 'vet-lab', 'Laboratoire d''analyses vétérinaires', 'flask-conical', '#7c3aed', 5, 1),
('Pharmacie vétérinaire', 'Veterinary Pharmacy', 'vet-pharmacy', 'Pharmacie ou dépôt de médicaments vétérinaires', 'pill', '#0891b2', 6, 1),
('Distributeur', 'Distributor', 'distributor', 'Distributeur de produits vétérinaires', 'truck', '#0d9488', 7, 1),
('Service mobile', 'Mobile Service', 'mobile-service', 'Service vétérinaire mobile', 'truck', '#65a30d', 8, 1),
('Service rural', 'Rural Service', 'rural-service', 'Service vétérinaire en zone rurale', 'map-pin', '#84cc16', 9, 1),
('ONG terrain', 'Field NGO', 'field-ngo', 'ONG et projets de terrain', 'heart', '#db2777', 10, 1),
('École vétérinaire', 'Veterinary School', 'vet-school', 'École ou faculté de médecine vétérinaire', 'school', '#f59e0b', 11, 1),
('Centre de formation', 'Training Center', 'training-center', 'Centre de formation vétérinaire', 'graduation-cap', '#fbbf24', 12, 1),
('Direction vétérinaire', 'Veterinary Directorate', 'vet-directorate', 'Direction des services vétérinaires', 'building', '#6366f1', 13, 1),
('Point focal', 'Focal Point', 'focal-point', 'Point focal santé animale', 'target', '#8b5cf6', 14, 1);

-- =========================================
-- 2. EXTEND ORGANIZATIONS TABLE FOR VET LINK
-- =========================================

-- Add new columns for veterinary-specific information
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS specialties JSON DEFAULT NULL COMMENT 'Spécialités vétérinaires (dermatologie, chirurgie, etc.)',
ADD COLUMN IF NOT EXISTS services JSON DEFAULT NULL COMMENT 'Services offerts',
ADD COLUMN IF NOT EXISTS opening_hours JSON DEFAULT NULL COMMENT 'Horaires d''ouverture par jour',
ADD COLUMN IF NOT EXISTS emergency_available TINYINT(1) DEFAULT 0 COMMENT 'Disponible pour urgences 24/7',
ADD COLUMN IF NOT EXISTS species_treated JSON DEFAULT NULL COMMENT 'Espèces traitées (chiens, chats, bovins, etc.)',
ADD COLUMN IF NOT EXISTS payment_methods JSON DEFAULT NULL COMMENT 'Moyens de paiement acceptés',
ADD COLUMN IF NOT EXISTS languages_spoken JSON DEFAULT NULL COMMENT 'Langues parlées',
ADD COLUMN IF NOT EXISTS accreditations JSON DEFAULT NULL COMMENT 'Accréditations et certifications',
ADD COLUMN IF NOT EXISTS staff_count INT DEFAULT NULL COMMENT 'Nombre de personnel',
ADD COLUMN IF NOT EXISTS veterinarians_count INT DEFAULT NULL COMMENT 'Nombre de vétérinaires',
ADD COLUMN IF NOT EXISTS founded_year INT DEFAULT NULL COMMENT 'Année de création',
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT NULL COMMENT 'Note moyenne (1-5)',
ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0 COMMENT 'Nombre d''avis';

-- =========================================
-- 3. CREATE VET LINK SPECIALTIES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS vet_specialties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'stethoscope',
  color VARCHAR(20) DEFAULT '#16a34a',
  category ENUM('medical', 'surgical', 'diagnostic', 'preventive', 'other') DEFAULT 'medical',
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO vet_specialties (name, name_en, slug, category, display_order) VALUES
('Médecine générale', 'General Medicine', 'general-medicine', 'medical', 1),
('Chirurgie', 'Surgery', 'surgery', 'surgical', 2),
('Dermatologie', 'Dermatology', 'dermatology', 'medical', 3),
('Ophtalmologie', 'Ophthalmology', 'ophthalmology', 'medical', 4),
('Cardiologie', 'Cardiology', 'cardiology', 'medical', 5),
('Dentisterie', 'Dentistry', 'dentistry', 'surgical', 6),
('Orthopédie', 'Orthopedics', 'orthopedics', 'surgical', 7),
('Radiologie', 'Radiology', 'radiology', 'diagnostic', 8),
('Échographie', 'Ultrasound', 'ultrasound', 'diagnostic', 9),
('Laboratoire', 'Laboratory', 'laboratory', 'diagnostic', 10),
('Vaccination', 'Vaccination', 'vaccination', 'preventive', 11),
('Stérilisation', 'Sterilization', 'sterilization', 'surgical', 12),
('Nutrition', 'Nutrition', 'nutrition', 'preventive', 13),
('Comportement', 'Behavior', 'behavior', 'medical', 14),
('Urgences', 'Emergency', 'emergency', 'medical', 15),
('Reproduction', 'Reproduction', 'reproduction', 'medical', 16),
('Insémination artificielle', 'Artificial Insemination', 'artificial-insemination', 'medical', 17),
('Nécropsie', 'Necropsy', 'necropsy', 'diagnostic', 18);

-- =========================================
-- 4. CREATE VET LINK SPECIES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS vet_species (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  slug VARCHAR(100) NOT NULL UNIQUE,
  category ENUM('companion', 'livestock', 'poultry', 'equine', 'exotic', 'wildlife', 'aquatic') NOT NULL,
  icon VARCHAR(50) DEFAULT 'paw-print',
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO vet_species (name, name_en, slug, category, display_order) VALUES
-- Animaux de compagnie
('Chiens', 'Dogs', 'dogs', 'companion', 1),
('Chats', 'Cats', 'cats', 'companion', 2),
('NAC (Nouveaux Animaux de Compagnie)', 'Exotic Pets', 'exotic-pets', 'exotic', 3),
('Oiseaux de cage', 'Cage Birds', 'cage-birds', 'exotic', 4),
-- Bétail
('Bovins', 'Cattle', 'cattle', 'livestock', 5),
('Ovins', 'Sheep', 'sheep', 'livestock', 6),
('Caprins', 'Goats', 'goats', 'livestock', 7),
('Porcins', 'Pigs', 'pigs', 'livestock', 8),
-- Volaille
('Poulets', 'Chickens', 'chickens', 'poultry', 9),
('Pintades', 'Guinea Fowl', 'guinea-fowl', 'poultry', 10),
('Canards', 'Ducks', 'ducks', 'poultry', 11),
('Dindes', 'Turkeys', 'turkeys', 'poultry', 12),
-- Équidés
('Chevaux', 'Horses', 'horses', 'equine', 13),
('Ânes', 'Donkeys', 'donkeys', 'equine', 14),
-- Autres
('Lapins', 'Rabbits', 'rabbits', 'livestock', 15),
('Poissons', 'Fish', 'fish', 'aquatic', 16),
('Faune sauvage', 'Wildlife', 'wildlife', 'wildlife', 17);

-- =========================================
-- 5. CREATE ORGANIZATION REVIEWS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS organization_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  user_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  is_verified TINYINT(1) DEFAULT 0,
  is_approved TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 6. UPDATE SITE SETTINGS FOR VET LINK
-- =========================================

INSERT IGNORE INTO settings (setting_key, setting_value, setting_group) VALUES
('vet_link_enabled', 'true', 'features'),
('vet_link_title_fr', 'VET LINK - Annuaire Vétérinaire', 'vet_link'),
('vet_link_title_en', 'VET LINK - Veterinary Directory', 'vet_link'),
('vet_link_description_fr', 'Trouvez les cliniques, laboratoires et services vétérinaires près de chez vous', 'vet_link'),
('vet_link_description_en', 'Find veterinary clinics, laboratories and services near you', 'vet_link');

-- =========================================
-- 7. CREATE INDEX FOR PERFORMANCE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_org_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_org_region ON organizations(region);
CREATE INDEX IF NOT EXISTS idx_org_emergency ON organizations(emergency_available);
CREATE INDEX IF NOT EXISTS idx_org_active ON organizations(is_active);
