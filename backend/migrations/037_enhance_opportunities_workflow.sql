-- Migration 037: Enhanced Opportunities Workflow
-- Adds offer_status (separate from editorial status), new fields per audit

-- =========================================
-- 1. EXPAND STATUS ENUM + ADD OFFER_STATUS
-- =========================================

-- Expand editorial status ENUM to support full workflow
ALTER TABLE opportunities
  MODIFY COLUMN status ENUM(
    'draft',
    'pending',
    'submitted',
    'verified',
    'scheduled',
    'published',
    'closed',
    'archived',
    'cancelled',
    'rejected'
  ) DEFAULT 'draft';

-- Add offer_status: the real-world status of the opportunity (separate from editorial)
ALTER TABLE opportunities
  ADD COLUMN offer_status ENUM(
    'open',
    'closing_soon',
    'expired',
    'filled',
    'suspended',
    'cancelled',
    'continuous'
  ) DEFAULT 'open' AFTER status;

CREATE INDEX idx_opp_offer_status ON opportunities(offer_status);

-- =========================================
-- 2. ADD MISSING FIELDS PER AUDIT
-- =========================================

-- Separate contract type from work rhythm
ALTER TABLE opportunities
  ADD COLUMN contract_type ENUM(
    'cdi', 'cdd', 'consultancy', 'internship', 'volunteer',
    'temporary', 'freelance', 'fellowship', 'other'
  ) DEFAULT NULL AFTER job_type;

ALTER TABLE opportunities
  ADD COLUMN work_rhythm ENUM('full_time', 'part_time') DEFAULT NULL AFTER contract_type;

-- Work mode (replaces binary is_remote)
ALTER TABLE opportunities
  ADD COLUMN work_mode ENUM('on_site', 'remote', 'hybrid', 'home_based') DEFAULT 'on_site' AFTER is_remote;

-- Number of positions
ALTER TABLE opportunities
  ADD COLUMN positions_count INT DEFAULT 1 AFTER organization_logo;

-- Grade / Level
ALTER TABLE opportunities
  ADD COLUMN grade VARCHAR(100) DEFAULT NULL AFTER positions_count;

-- Department / Unit
ALTER TABLE opportunities
  ADD COLUMN department VARCHAR(200) DEFAULT NULL AFTER grade;

-- Contract duration
ALTER TABLE opportunities
  ADD COLUMN contract_duration VARCHAR(100) DEFAULT NULL AFTER work_rhythm;

-- Contract dates
ALTER TABLE opportunities
  ADD COLUMN contract_start_date DATE DEFAULT NULL AFTER contract_duration;

ALTER TABLE opportunities
  ADD COLUMN contract_end_date DATE DEFAULT NULL AFTER contract_start_date;

-- Languages required (JSON array)
ALTER TABLE opportunities
  ADD COLUMN languages_required JSON DEFAULT NULL AFTER education_required;

-- Languages desired (JSON array)
ALTER TABLE opportunities
  ADD COLUMN languages_desired JSON DEFAULT NULL AFTER languages_required;

-- Nationality requirements
ALTER TABLE opportunities
  ADD COLUMN nationality_required VARCHAR(200) DEFAULT NULL AFTER languages_desired;

-- Recruitment scope
ALTER TABLE opportunities
  ADD COLUMN recruitment_scope ENUM('national', 'international', 'regional') DEFAULT NULL AFTER nationality_required;

-- Experience range (structured)
ALTER TABLE opportunities
  ADD COLUMN experience_min_years INT DEFAULT NULL AFTER experience_required;

ALTER TABLE opportunities
  ADD COLUMN experience_max_years INT DEFAULT NULL AFTER experience_min_years;

-- Application URL (direct link to apply)
ALTER TABLE opportunities
  ADD COLUMN application_url VARCHAR(500) DEFAULT NULL AFTER website_url;

-- Source URL (original posting)
ALTER TABLE opportunities
  ADD COLUMN source_url VARCHAR(500) DEFAULT NULL AFTER application_url;

-- Salary: gross or net
ALTER TABLE opportunities
  ADD COLUMN salary_type ENUM('gross', 'net', 'undisclosed') DEFAULT NULL AFTER salary_period;

-- Deadline timezone
ALTER TABLE opportunities
  ADD COLUMN deadline_timezone VARCHAR(50) DEFAULT 'UTC' AFTER deadline;

-- Verification date
ALTER TABLE opportunities
  ADD COLUMN verified_at DATETIME DEFAULT NULL AFTER approved_at;

ALTER TABLE opportunities
  ADD COLUMN verified_by INT DEFAULT NULL AFTER verified_at;

-- Last editorial update
ALTER TABLE opportunities
  ADD COLUMN last_updated_by INT DEFAULT NULL AFTER verified_by;

-- =========================================
-- 3. MIGRATE EXISTING DATA
-- =========================================

-- Set offer_status based on current status
UPDATE opportunities SET offer_status = 'open' WHERE status = 'published' AND (deadline IS NULL OR deadline > NOW());
UPDATE opportunities SET offer_status = 'expired' WHERE status = 'closed';
UPDATE opportunities SET offer_status = 'cancelled' WHERE status = 'cancelled';

-- Migrate job_type to contract_type + work_rhythm
UPDATE opportunities SET contract_type = 'cdi', work_rhythm = 'full_time' WHERE job_type = 'full_time';
UPDATE opportunities SET contract_type = 'cdi', work_rhythm = 'part_time' WHERE job_type = 'part_time';
UPDATE opportunities SET contract_type = 'cdd', work_rhythm = 'full_time' WHERE job_type = 'contract';
UPDATE opportunities SET contract_type = 'internship', work_rhythm = 'full_time' WHERE job_type = 'internship';
UPDATE opportunities SET contract_type = 'volunteer', work_rhythm = 'full_time' WHERE job_type = 'volunteer';
UPDATE opportunities SET contract_type = 'freelance' WHERE job_type = 'freelance';
UPDATE opportunities SET contract_type = 'consultancy' WHERE job_type = 'consultancy';

-- Migrate is_remote to work_mode
UPDATE opportunities SET work_mode = 'remote' WHERE is_remote = 1;
UPDATE opportunities SET work_mode = 'on_site' WHERE is_remote = 0 OR is_remote IS NULL;
