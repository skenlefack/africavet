-- Add superadmin role to users ENUM
ALTER TABLE users MODIFY COLUMN role ENUM('superadmin', 'admin', 'editor', 'author', 'subscriber') DEFAULT 'subscriber';
