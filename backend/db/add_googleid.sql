/*

This updates the user table to support Google OAUTH Sign-Ups

Changes:
1. Modify user table to all NULL password hash
2. Add a field in user table for googleId

Run this ONCE on existing databases.
========================================
*/

USE smart_trip;

-- ========================================
-- Modify users table
-- ========================================

-- Make password_hash nullable
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- Add google_id column (nullable and unique)
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL UNIQUE;
