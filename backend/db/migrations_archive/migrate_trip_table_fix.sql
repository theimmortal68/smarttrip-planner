/*
========================================
MIGRATION: Add name field and rename location to location_name in trips table
========================================
Run this ONCE on existing databases.
========================================
*/

USE smart_trip;

-- Step 1: Add the 'name' column
ALTER TABLE `trips`
  ADD COLUMN `name` varchar(255) AFTER `creator_id`;

-- Step 2: Add the new 'location_name' column
ALTER TABLE `trips`
  ADD COLUMN `location_name` varchar(255) AFTER `name`;

-- Step 3: Copy existing 'location' data to 'location_name'
UPDATE `trips`
SET `location_name` = `location`
WHERE `location` IS NOT NULL;

-- Step 4: Drop the old 'location' column
ALTER TABLE `trips`
  DROP COLUMN `location`;

-- Verification
SELECT 'Trips migration complete!' AS Status;
DESCRIBE trips;
SELECT * FROM trips LIMIT 5;