-- Create permissions tables

CREATE TABLE IF NOT EXISTS `groups` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_system TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  group_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_group_permission (group_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_group (user_id, group_id)
);

-- Insert admin group
INSERT IGNORE INTO `groups` (name, slug, description, is_system)
VALUES ('Administrateurs', 'admin', 'Accès complet à toutes les fonctionnalités', 1);

-- Insert permissions
INSERT IGNORE INTO permissions (name, slug, description) VALUES
('Tableau de bord', 'dashboard', 'Accès au tableau de bord'),
('Articles', 'posts', 'Gestion des articles'),
('Catégories', 'categories', 'Gestion des catégories'),
('Pages', 'pages', 'Gestion des pages'),
('Médias', 'media', 'Gestion des médias'),
('Menus', 'menus', 'Gestion des menus'),
('Modules', 'modules', 'Gestion des modules'),
('Sliders', 'sliders', 'Gestion des sliders'),
('Page Builder', 'pagebuilder', 'Page builder'),
('Utilisateurs', 'users', 'Gestion des utilisateurs'),
('Groupes', 'groups', 'Gestion des groupes'),
('Thèmes', 'themes', 'Gestion des thèmes'),
('Paramètres', 'settings', 'Paramètres du site');

-- Link all permissions to admin group
INSERT IGNORE INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id FROM `groups` g, permissions p WHERE g.slug = 'admin';

-- Add admin user to admin group
INSERT IGNORE INTO user_groups (user_id, group_id)
SELECT u.id, g.id FROM users u, `groups` g WHERE u.username = 'admin' AND g.slug = 'admin';
