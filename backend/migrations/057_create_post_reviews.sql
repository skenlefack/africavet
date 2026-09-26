-- Migration 057: Create post_reviews table and add workflow_status to posts

CREATE TABLE IF NOT EXISTS post_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  step ENUM('draft', 'submitted', 'fact_check', 'scientific_review', 'editorial_review', 'seo_check', 'approved', 'rejected') NOT NULL,
  previous_step VARCHAR(50) DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected', 'revision_requested') DEFAULT 'pending',
  notes TEXT DEFAULT NULL,
  checklist_data JSON DEFAULT NULL,
  validation_level ENUM('N1', 'N2', 'N3', 'N4') DEFAULT 'N1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

ALTER TABLE posts ADD COLUMN workflow_status ENUM('draft','submitted','in_review','approved','published','revision_requested','rejected') DEFAULT 'draft';
