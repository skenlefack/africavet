-- Fix double-encoded UTF-8 in document_categories and documents tables
SET NAMES utf8mb4;

UPDATE document_categories SET name_fr = CONVERT(BINARY CONVERT(name_fr USING latin1) USING utf8mb4)
WHERE name_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ' OR CAST(name_fr AS BINARY) LIKE '%C383C2%';

UPDATE document_categories SET description_fr = CONVERT(BINARY CONVERT(description_fr USING latin1) USING utf8mb4)
WHERE description_fr IS NOT NULL AND (description_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ' OR CAST(description_fr AS BINARY) LIKE '%C383C2%');

UPDATE documents SET title_fr = CONVERT(BINARY CONVERT(title_fr USING latin1) USING utf8mb4)
WHERE title_fr IS NOT NULL AND (title_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ' OR CAST(title_fr AS BINARY) LIKE '%C383C2%');

UPDATE documents SET description_fr = CONVERT(BINARY CONVERT(description_fr USING latin1) USING utf8mb4)
WHERE description_fr IS NOT NULL AND (description_fr REGEXP 'Ã©|Ã¨|Ãª|Ã |Ã¢|Ã®|Ã´|Ã¹|Ã§|Ã‰|Ã«|Ã¯|Ã»|Ãˆ' OR CAST(description_fr AS BINARY) LIKE '%C383C2%');
