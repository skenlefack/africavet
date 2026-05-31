-- Migration 031: Add permissions for Documents, Alerts, and Opportunities modules

-- Documents permissions
INSERT IGNORE INTO permissions (name, slug, description, category) VALUES
('Voir les documents', 'documents_view', 'Consulter les documents', 'documents'),
('Créer des documents', 'documents_create', 'Ajouter de nouveaux documents', 'documents'),
('Modifier les documents', 'documents_edit', 'Modifier les documents existants', 'documents'),
('Supprimer des documents', 'documents_delete', 'Supprimer des documents', 'documents'),
('Gérer les catégories de documents', 'documents_categories_manage', 'Créer, modifier et supprimer les catégories de documents', 'documents');

-- Alerts permissions
INSERT IGNORE INTO permissions (name, slug, description, category) VALUES
('Modérer les alertes', 'alerts_moderate', 'Valider, rejeter et gérer les alertes vétérinaires', 'alerts');

-- Opportunities permissions
INSERT IGNORE INTO permissions (name, slug, description, category) VALUES
('Gérer les opportunités', 'opportunities_manage', 'Créer, modifier, approuver et supprimer les opportunités', 'opportunities');

-- Assign all new permissions to admin group
INSERT IGNORE INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM `groups` g, permissions p
WHERE g.slug = 'admin'
AND p.slug IN (
  'documents_view',
  'documents_create',
  'documents_edit',
  'documents_delete',
  'documents_categories_manage',
  'alerts_moderate',
  'opportunities_manage'
);
