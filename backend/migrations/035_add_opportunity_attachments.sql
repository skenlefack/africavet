-- Migration: Add attachments field to opportunities
-- Date: 2026-05-31

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'opportunities' AND COLUMN_NAME = 'attachments');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE opportunities ADD COLUMN attachments JSON DEFAULT NULL COMMENT ''Fichiers joints (JSON array)'' AFTER tags', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
