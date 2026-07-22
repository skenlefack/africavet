SET NAMES utf8mb4;

-- Fix any remaining double-encoded text using broader LIKE pattern
-- Target: Ã followed by a space (which is double-encoded à)
UPDATE course_modules SET title_fr = CONVERT(BINARY CONVERT(title_fr USING latin1) USING utf8mb4)
WHERE CAST(title_fr AS BINARY) LIKE '%C383C2A0%';

UPDATE course_modules SET description_fr = CONVERT(BINARY CONVERT(description_fr USING latin1) USING utf8mb4)
WHERE description_fr IS NOT NULL AND CAST(description_fr AS BINARY) LIKE '%C383C2A0%';

UPDATE lessons SET title_fr = CONVERT(BINARY CONVERT(title_fr USING latin1) USING utf8mb4)
WHERE CAST(title_fr AS BINARY) LIKE '%C383C2A0%';

UPDATE lessons SET content_fr = CONVERT(BINARY CONVERT(content_fr USING latin1) USING utf8mb4)
WHERE content_fr IS NOT NULL AND CAST(content_fr AS BINARY) LIKE '%C383C2A0%';

UPDATE courses SET description_fr = CONVERT(BINARY CONVERT(description_fr USING latin1) USING utf8mb4)
WHERE description_fr IS NOT NULL AND CAST(description_fr AS BINARY) LIKE '%C383C2A0%';

-- Also catch any remaining double-encoded chars using binary check
-- C383 = double-encoded Ã pattern start
UPDATE course_modules SET title_fr = CONVERT(BINARY CONVERT(title_fr USING latin1) USING utf8mb4)
WHERE CAST(title_fr AS BINARY) LIKE '%C383C2%';

UPDATE lessons SET content_fr = CONVERT(BINARY CONVERT(content_fr USING latin1) USING utf8mb4)
WHERE content_fr IS NOT NULL AND CAST(content_fr AS BINARY) LIKE '%C383C2%';
