-- Migration 022: Enhance user profiles with professional fields
-- Each ALTER TABLE is separate so that already-existing columns don't block others

SET @db = DATABASE();

-- Helper procedure to add columns safely
DROP PROCEDURE IF EXISTS _add_col;
CREATE PROCEDURE _add_col(IN tbl VARCHAR(64), IN col VARCHAR(64), IN col_def VARCHAR(500))
BEGIN
  SET @exists = (SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema = @db AND table_name = tbl AND column_name = col);
  IF @exists = 0 THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', col_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END;

CALL _add_col('users', 'profession', "VARCHAR(200) DEFAULT NULL");
CALL _add_col('users', 'specialization', "VARCHAR(200) DEFAULT NULL");
CALL _add_col('users', 'skills', "JSON DEFAULT NULL");
CALL _add_col('users', 'country', "VARCHAR(100) DEFAULT 'Cameroun'");
CALL _add_col('users', 'city', "VARCHAR(100) DEFAULT NULL");
CALL _add_col('users', 'years_experience', "INT DEFAULT 0");
CALL _add_col('users', 'education_level', "ENUM('high_school','bachelor','master','doctorate','post_doctorate','professional_certificate','other') DEFAULT NULL");
CALL _add_col('users', 'cv_url', "VARCHAR(500) DEFAULT NULL");
CALL _add_col('users', 'cv_original_name', "VARCHAR(255) DEFAULT NULL");
CALL _add_col('users', 'phone', "VARCHAR(50) DEFAULT NULL");
CALL _add_col('users', 'preferred_language', "ENUM('fr','en') DEFAULT 'fr'");

DROP PROCEDURE IF EXISTS _add_col;
