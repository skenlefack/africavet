-- =====================================================
-- Migration 049: Fix double-encoded UTF-8 in e-learning tables
-- and update branding references
-- =====================================================

SET NAMES utf8mb4;

-- Fix elearning_categories
UPDATE elearning_categories SET name_fr = CONVERT(BINARY CONVERT(name_fr USING latin1) USING utf8mb4)
WHERE name_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE elearning_categories SET name_en = CONVERT(BINARY CONVERT(name_en USING latin1) USING utf8mb4)
WHERE name_en IS NOT NULL AND name_en REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE elearning_categories SET description_fr = CONVERT(BINARY CONVERT(description_fr USING latin1) USING utf8mb4)
WHERE description_fr IS NOT NULL AND description_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

UPDATE elearning_categories SET description_en = CONVERT(BINARY CONVERT(description_en USING latin1) USING utf8mb4)
WHERE description_en IS NOT NULL AND description_en REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- Fix courses
UPDATE courses SET title_fr = CONVERT(BINARY CONVERT(title_fr USING latin1) USING utf8mb4)
WHERE title_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';
UPDATE courses SET title_en = CONVERT(BINARY CONVERT(title_en USING latin1) USING utf8mb4)
WHERE title_en IS NOT NULL AND title_en REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';
UPDATE courses SET description_fr = CONVERT(BINARY CONVERT(description_fr USING latin1) USING utf8mb4)
WHERE description_fr IS NOT NULL AND description_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';
UPDATE courses SET description_en = CONVERT(BINARY CONVERT(description_en USING latin1) USING utf8mb4)
WHERE description_en IS NOT NULL AND description_en REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- Fix modules
UPDATE course_modules SET title_fr = CONVERT(BINARY CONVERT(title_fr USING latin1) USING utf8mb4)
WHERE title_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';
UPDATE course_modules SET description_fr = CONVERT(BINARY CONVERT(description_fr USING latin1) USING utf8mb4)
WHERE description_fr IS NOT NULL AND description_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- Fix lessons
UPDATE lessons SET title_fr = CONVERT(BINARY CONVERT(title_fr USING latin1) USING utf8mb4)
WHERE title_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';
UPDATE lessons SET content_fr = CONVERT(BINARY CONVERT(content_fr USING latin1) USING utf8mb4)
WHERE content_fr IS NOT NULL AND content_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- Fix questions
UPDATE questions SET question_text_fr = CONVERT(BINARY CONVERT(question_text_fr USING latin1) USING utf8mb4)
WHERE question_text_fr IS NOT NULL AND question_text_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';
UPDATE questions SET explanation_fr = CONVERT(BINARY CONVERT(explanation_fr USING latin1) USING utf8mb4)
WHERE explanation_fr IS NOT NULL AND explanation_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- Fix quizzes
UPDATE quizzes SET title_fr = CONVERT(BINARY CONVERT(title_fr USING latin1) USING utf8mb4)
WHERE title_fr IS NOT NULL AND title_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';
UPDATE quizzes SET description_fr = CONVERT(BINARY CONVERT(description_fr USING latin1) USING utf8mb4)
WHERE description_fr IS NOT NULL AND description_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- answer_options may not exist on all installations, skip if missing

-- Fix learning_paths
UPDATE learning_paths SET title_fr = CONVERT(BINARY CONVERT(title_fr USING latin1) USING utf8mb4)
WHERE title_fr IS NOT NULL AND title_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';
UPDATE learning_paths SET description_fr = CONVERT(BINARY CONVERT(description_fr USING latin1) USING utf8mb4)
WHERE description_fr IS NOT NULL AND description_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ';

-- Update certificate prefix from OH to AV
UPDATE certificates SET certificate_number = REPLACE(certificate_number, 'CERT-OH-', 'CERT-AV-')
WHERE certificate_number LIKE 'CERT-OH-%';
