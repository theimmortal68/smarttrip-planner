/*
========================================
ROLLBACK/DROP SCRIPT - SMART_TRIP DATABASE
========================================
Drops all tables and resets the smart_trip database.
Use this when you need to start fresh during development.

WARNING: Not insulting anyones intelligences but this 
will DELETE ALL DATA
========================================
*/

-- pick the database
USE smart_trip;

-- Disables foreign key checks, stops all the dependency errors
-- Drop tables in reverse order
-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS cost_items;
DROP TABLE IF EXISTS invites;
DROP TABLE IF EXISTS itinerary_items;
DROP TABLE IF EXISTS trip_members;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ***Optional***: Drop the entire database 
-- (uncomment belowe if needed)

-- DROP DATABASE IF EXISTS smart_trip;

-- Success message
SELECT 'All tables dropped successfully! Database reset complete.' AS Status;