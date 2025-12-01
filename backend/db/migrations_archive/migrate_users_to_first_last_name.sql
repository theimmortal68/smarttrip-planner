/*
========================================
MIGRATION: Update users table to use first_name and last_name
========================================
Run this ONCE on existing databases to update the schema.
========================================
*/

USE smart_trip;

-- Step 1: Add new first_name and last_name columns
ALTER TABLE `users`
  ADD COLUMN `first_name` varchar(255) AFTER `id`,
  ADD COLUMN `last_name` varchar(255) AFTER `first_name`;

-- Step 2: Migrate existing 'name' data (if any exists)
UPDATE `users`
SET
  `first_name` = SUBSTRING_INDEX(`name`, ' ', 1),
  `last_name` = SUBSTRING_INDEX(`name`, ' ', -1)
WHERE `name` IS NOT NULL;

-- Step 3: Drop the old 'name' column
ALTER TABLE `users` DROP COLUMN `name`;

-- Step 4: Make password_hash optional (for OAuth users)
ALTER TABLE `users`
  MODIFY COLUMN `password_hash` varchar(255) NULL;

-- Verification
SELECT 'Migration complete!' AS Status;
DESCRIBE users;
SELECT * FROM users LIMIT 5;