-- Add 'opportunity' to page_type enum in page_visits
ALTER TABLE page_visits MODIFY COLUMN page_type ENUM('home','article','page','category','elearning','annuaire','opportunity','other') DEFAULT 'other';
