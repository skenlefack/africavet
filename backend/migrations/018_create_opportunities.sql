-- Migration: Create Opportunities System
-- Jobs, Tenders, and Market Opportunities for veterinary professionals

-- =========================================
-- 1. CREATE OPPORTUNITIES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS opportunities (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Type d'opportunité
  opportunity_type ENUM('job', 'tender', 'market') NOT NULL DEFAULT 'job',

  -- Contenu bilingue
  title_fr VARCHAR(500) NOT NULL,
  title_en VARCHAR(500),
  description_fr TEXT,
  description_en TEXT,

  -- Organisation
  organization_id INT COMMENT 'Reference to organizations table if applicable',
  organization_name VARCHAR(300),
  organization_logo VARCHAR(500),
  contact_name VARCHAR(200),
  contact_email VARCHAR(200),
  contact_phone VARCHAR(50),
  website_url VARCHAR(500),

  -- Localisation
  country VARCHAR(100) DEFAULT 'Cameroun',
  region VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  is_remote TINYINT(1) DEFAULT 0,

  -- Spécifique Emploi (job)
  job_type ENUM('full_time', 'part_time', 'contract', 'internship', 'volunteer', 'freelance') DEFAULT NULL,
  experience_required VARCHAR(100) COMMENT 'e.g., 2-5 years',
  education_required VARCHAR(200),
  salary_min DECIMAL(15, 2),
  salary_max DECIMAL(15, 2),
  salary_currency VARCHAR(10) DEFAULT 'XAF',
  salary_period ENUM('hour', 'day', 'month', 'year', 'project') DEFAULT 'month',
  skills_required JSON COMMENT 'Array of required skills',
  benefits JSON COMMENT 'Array of benefits offered',

  -- Spécifique Appel d'offres (tender)
  tender_reference VARCHAR(100),
  tender_type ENUM('open', 'restricted', 'negotiated', 'competitive_dialogue') DEFAULT 'open',
  budget_min DECIMAL(15, 2),
  budget_max DECIMAL(15, 2),
  budget_currency VARCHAR(10) DEFAULT 'XAF',
  submission_method TEXT,
  eligibility_criteria TEXT,
  required_documents JSON,

  -- Spécifique Marché (market)
  market_category VARCHAR(100) COMMENT 'e.g., Equipment, Supplies, Services',
  quantity VARCHAR(100),
  unit_price DECIMAL(15, 2),

  -- Dates
  start_date DATE,
  deadline DATETIME,
  publication_date DATE DEFAULT (CURRENT_DATE),

  -- Statut et visibilité
  status ENUM('draft', 'pending', 'published', 'closed', 'cancelled') DEFAULT 'pending',
  is_featured TINYINT(1) DEFAULT 0,
  is_urgent TINYINT(1) DEFAULT 0,

  -- Métriques
  views_count INT DEFAULT 0,
  applications_count INT DEFAULT 0,

  -- Soumission
  submitted_by INT COMMENT 'User who submitted',
  approved_by INT,
  approved_at DATETIME,
  rejection_reason TEXT,

  -- SEO & Meta
  slug VARCHAR(300),
  meta_description VARCHAR(500),
  tags JSON,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

  -- Indexes
  INDEX idx_opp_type (opportunity_type),
  INDEX idx_opp_status (status),
  INDEX idx_opp_country (country),
  INDEX idx_opp_deadline (deadline),
  INDEX idx_opp_featured (is_featured),
  INDEX idx_opp_created (created_at),
  INDEX idx_opp_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 2. CREATE OPPORTUNITY APPLICATIONS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS opportunity_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  opportunity_id INT NOT NULL,

  -- Candidat
  user_id INT COMMENT 'If registered user',
  applicant_name VARCHAR(200) NOT NULL,
  applicant_email VARCHAR(200) NOT NULL,
  applicant_phone VARCHAR(50),

  -- Documents
  cv_file VARCHAR(500),
  cover_letter TEXT,
  motivation_letter TEXT,
  additional_documents JSON COMMENT 'Array of file paths',

  -- Infos supplémentaires
  experience_years INT,
  current_position VARCHAR(200),
  current_organization VARCHAR(200),
  availability_date DATE,
  salary_expectation DECIMAL(15, 2),
  notes TEXT,

  -- Statut
  status ENUM('submitted', 'under_review', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn') DEFAULT 'submitted',
  status_notes TEXT,
  reviewed_by INT,
  reviewed_at DATETIME,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,

  -- Indexes
  INDEX idx_app_opportunity (opportunity_id),
  INDEX idx_app_user (user_id),
  INDEX idx_app_status (status),
  INDEX idx_app_email (applicant_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 3. CREATE OPPORTUNITY CATEGORIES TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS opportunity_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_fr VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  description_fr TEXT,
  description_en TEXT,
  opportunity_type ENUM('job', 'tender', 'market', 'all') DEFAULT 'all',
  slug VARCHAR(100) UNIQUE,
  icon VARCHAR(50),
  display_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 4. LINK TABLE: OPPORTUNITIES <-> CATEGORIES
-- =========================================

CREATE TABLE IF NOT EXISTS opportunity_category_links (
  opportunity_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (opportunity_id, category_id),
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES opportunity_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- 5. INSERT DEFAULT CATEGORIES
-- =========================================

INSERT INTO opportunity_categories (name_fr, name_en, opportunity_type, slug, icon, display_order) VALUES
-- Job categories
('Vétérinaire clinicien', 'Clinical Veterinarian', 'job', 'veterinarian', 'stethoscope', 1),
('Vétérinaire de santé publique', 'Public Health Veterinarian', 'job', 'public-health-vet', 'shield', 2),
('Technicien vétérinaire', 'Veterinary Technician', 'job', 'vet-tech', 'wrench', 3),
('Assistant vétérinaire', 'Veterinary Assistant', 'job', 'vet-assistant', 'user', 4),
('Chercheur / Laboratoire', 'Researcher / Laboratory', 'job', 'researcher', 'flask', 5),
('Enseignant / Formateur', 'Teacher / Trainer', 'job', 'teacher', 'graduation-cap', 6),
('Administration / Gestion', 'Administration / Management', 'job', 'admin', 'briefcase', 7),
('Stage / Apprentissage', 'Internship / Apprenticeship', 'job', 'internship', 'book', 8),

-- Tender categories
('Fourniture d''équipements', 'Equipment Supply', 'tender', 'equipment-supply', 'package', 10),
('Services vétérinaires', 'Veterinary Services', 'tender', 'vet-services', 'activity', 11),
('Construction / Réhabilitation', 'Construction / Rehabilitation', 'tender', 'construction', 'building', 12),
('Formation et renforcement', 'Training and Capacity Building', 'tender', 'training', 'users', 13),
('Études et consultance', 'Studies and Consultancy', 'tender', 'consultancy', 'file-text', 14),

-- Market categories
('Médicaments vétérinaires', 'Veterinary Medicines', 'market', 'vet-medicines', 'pill', 20),
('Équipements médicaux', 'Medical Equipment', 'market', 'medical-equipment', 'monitor', 21),
('Alimentation animale', 'Animal Feed', 'market', 'animal-feed', 'wheat', 22),
('Matériel de laboratoire', 'Laboratory Equipment', 'market', 'lab-equipment', 'microscope', 23),
('Services professionnels', 'Professional Services', 'market', 'pro-services', 'briefcase', 24);

-- =========================================
-- 6. INSERT SETTINGS FOR OPPORTUNITIES
-- =========================================

INSERT IGNORE INTO settings (setting_key, setting_value, setting_group) VALUES
('opportunities_enabled', 'true', 'features'),
('opportunities_require_approval', 'true', 'opportunities'),
('opportunities_admin_email', '', 'opportunities'),
('opportunities_allow_anonymous', 'false', 'opportunities'),
('opportunities_default_duration_days', '30', 'opportunities');

-- =========================================
-- 7. GENERATE SLUG TRIGGER
-- Note: Run this trigger separately via MySQL client with DELIMITER support
-- =========================================

-- The trigger should be created manually via phpMyAdmin or MySQL CLI:
/*
DELIMITER //
CREATE TRIGGER generate_opportunity_slug
BEFORE INSERT ON opportunities
FOR EACH ROW
BEGIN
  DECLARE base_slug VARCHAR(300);
  DECLARE final_slug VARCHAR(300);
  DECLARE slug_count INT;

  -- Generate base slug from French title
  SET base_slug = LOWER(REPLACE(REPLACE(REPLACE(LEFT(NEW.title_fr, 200), ' ', '-'), '''', ''), '"', ''));
  SET base_slug = REGEXP_REPLACE(base_slug, '[^a-z0-9-]', '');
  SET base_slug = REGEXP_REPLACE(base_slug, '-+', '-');
  SET base_slug = TRIM(BOTH '-' FROM base_slug);

  -- Check for existing slugs
  SELECT COUNT(*) INTO slug_count FROM opportunities WHERE slug LIKE CONCAT(base_slug, '%');

  IF slug_count > 0 THEN
    SET final_slug = CONCAT(base_slug, '-', slug_count + 1);
  ELSE
    SET final_slug = base_slug;
  END IF;

  SET NEW.slug = final_slug;
END//
DELIMITER ;
*/
