-- Migration 056: Seed known authors

INSERT INTO authors (name, name_normalized, role, is_active) VALUES
  ('Malick Kane', 'malick-kane', 'auteur', 1),
  ('Flora J. Ingah', 'flora-j-ingah', 'auteur', 1),
  ('Mac Juliette Johngwe', 'mac-juliette-johngwe', 'auteur', 1),
  ('Simon Yaya', 'simon-yaya', 'auteur', 1),
  ('Absan Bibou', 'absan-bibou', 'auteur', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
