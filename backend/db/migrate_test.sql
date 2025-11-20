-- 1. Check table structure
DESCRIBE users;

-- 2. Check if data exists and columns are correct
SELECT id, first_name, last_name, email, 
       CASE WHEN password_hash IS NULL THEN 'NULL' ELSE 'HAS_HASH' END as password_hash,
       created_at
FROM users
LIMIT 10;

-- 3. Verify password_hash can be NULL
SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'smart_trip'
  AND TABLE_NAME = 'users';