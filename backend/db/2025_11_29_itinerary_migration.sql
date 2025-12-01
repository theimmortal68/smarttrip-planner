/*
========================================
MIGRATION: Itinerary Structure Update
Date: 2025-11-29
========================================

This migration updates the itinerary system to support multiple booking types:
- Flights
- Lodging (hotels, airbnb, etc.)
- Car Rentals
- Activities
- General items

Changes:
1. Modify itinerary_items table (parent table for common fields)
2. Create specialized child tables for each booking type
3. Add proper indexes and foreign keys

Run this ONCE on existing databases.
========================================
*/

USE smart_trip;

-- ========================================
-- Modify itinerary_items table
-- ========================================

-- Change TIME to DATETIME for start_time and end_time
ALTER TABLE `itinerary_items`
  MODIFY `start_time` DATETIME NULL,
  MODIFY `end_time` DATETIME NULL;

-- Add new fields for common itinerary data
ALTER TABLE `itinerary_items`
  ADD COLUMN `item_type` VARCHAR(50) NULL AFTER `trip_id`,
  ADD COLUMN `venue` VARCHAR(255) NULL AFTER `end_time`,
  ADD COLUMN `address` TEXT NULL AFTER `venue`,
  ADD COLUMN `phone` VARCHAR(50) NULL AFTER `address`,
  ADD COLUMN `website` VARCHAR(255) NULL AFTER `phone`,
  ADD COLUMN `email` VARCHAR(255) NULL AFTER `website`,
  ADD COLUMN `provider` VARCHAR(100) NULL AFTER `email`,
  ADD COLUMN `confirmation_number` VARCHAR(50) NULL AFTER `provider`,
  ADD COLUMN `total_cost` DECIMAL(10,2) NULL AFTER `confirmation_number`,
  ADD COLUMN `number_of_guests` INTEGER NULL AFTER `total_cost`;

-- Drop unused fields (replaced by new structure)
ALTER TABLE `itinerary_items`
  DROP COLUMN `day_index`,
  DROP COLUMN `participants_json`,
  DROP COLUMN `equipment_list`,
  DROP COLUMN `food_plan`,
  DROP COLUMN `transport_mode`,
  DROP COLUMN `duration_hours`;

-- Add constraint for item_type values
ALTER TABLE `itinerary_items`
  ADD CONSTRAINT `chk_item_type`
  CHECK (`item_type` IN ('flight', 'lodging', 'car_rental', 'activity', 'general'));

-- Add new indexes
CREATE INDEX `idx_item_type` ON `itinerary_items` (`item_type`);
CREATE INDEX `idx_trip_type` ON `itinerary_items` (`trip_id`, `item_type`);
CREATE INDEX `idx_trip_timeline` ON `itinerary_items` (`trip_id`, `start_time`, `item_type`);

-- ========================================
-- Create flight_itinerary table
-- ========================================

CREATE TABLE `flight_itinerary` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `itinerary_item_id` INTEGER NOT NULL UNIQUE,
  `flight_number` VARCHAR(20) NULL COMMENT 'e.g., AF1234',
  `airline` VARCHAR(100) NULL COMMENT 'e.g., Air France',
  `departure_airport` VARCHAR(10) NULL COMMENT 'IATA code (JFK, LAX)',
  `arrival_airport` VARCHAR(10) NULL COMMENT 'IATA code (CDG, LHR)',
  `created_at` TIMESTAMP DEFAULT (NOW()),
  `updated_at` TIMESTAMP NULL,

  FOREIGN KEY (`itinerary_item_id`) REFERENCES `itinerary_items` (`id`) ON DELETE CASCADE,
  INDEX `idx_itinerary_item` (`itinerary_item_id`)
) COMMENT='Flight-specific details';

-- ========================================
-- Create lodging_itinerary table
-- ========================================

CREATE TABLE `lodging_itinerary` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `itinerary_item_id` INTEGER NOT NULL UNIQUE,
  `lodging_type` VARCHAR(100) NULL COMMENT 'hotel, airbnb, hostel, resort, motel',
  `rooms` INTEGER NULL COMMENT 'Number of rooms booked',
  `beds` VARCHAR(100) NULL COMMENT 'e.g., 1 King bed, 2 Queen beds',
  `price_per_room` DECIMAL(10,2) NULL COMMENT 'Nightly rate per room',
  `created_at` TIMESTAMP DEFAULT (NOW()),
  `updated_at` TIMESTAMP NULL,

  FOREIGN KEY (`itinerary_item_id`) REFERENCES `itinerary_items` (`id`) ON DELETE CASCADE,
  INDEX `idx_itinerary_item` (`itinerary_item_id`)
) COMMENT='Lodging/hotel-specific details';

-- ========================================
-- Create car_rental_itinerary table
-- ========================================

CREATE TABLE `car_rental_itinerary` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `itinerary_item_id` INTEGER NOT NULL UNIQUE,
  `pickup_location` VARCHAR(255) NULL COMMENT 'Location name (e.g., JFK Airport)',
  `pickup_address` TEXT NULL COMMENT 'Full pickup address',
  `pickup_phone` VARCHAR(50) NULL COMMENT 'Pickup location phone',
  `dropoff_location` VARCHAR(255) NULL COMMENT 'Location name',
  `dropoff_address` TEXT NULL COMMENT 'Full dropoff address',
  `dropoff_phone` VARCHAR(50) NULL COMMENT 'Dropoff location phone',
  `car_type` VARCHAR(100) NULL COMMENT 'e.g., Compact - VW Golf or similar',
  `created_at` TIMESTAMP DEFAULT (NOW()),
  `updated_at` TIMESTAMP NULL,

  FOREIGN KEY (`itinerary_item_id`) REFERENCES `itinerary_items` (`id`) ON DELETE CASCADE,
  INDEX `idx_itinerary_item` (`itinerary_item_id`)
) COMMENT='Car rental-specific details';

-- ========================================
-- Create activity_itinerary table
-- ========================================

CREATE TABLE `activity_itinerary` (
  `id` INTEGER PRIMARY KEY AUTO_INCREMENT,
  `itinerary_item_id` INTEGER NOT NULL UNIQUE,
  `activity_type` VARCHAR(100) NULL COMMENT 'tour, adventure, cultural, entertainment, dining',
  `difficulty_level` VARCHAR(50) NULL COMMENT 'easy, moderate, challenging',
  `meeting_location` VARCHAR(255) NULL COMMENT 'Where to meet guide/group',
  `meeting_instructions` TEXT NULL COMMENT 'Detailed meeting info',
  `certification_required` BOOLEAN DEFAULT FALSE COMMENT 'Requires certification?',
  `certification_details` TEXT NULL COMMENT 'What certifications needed',
  `min_age` INTEGER NULL COMMENT 'Minimum age requirement',
  `max_participants` INTEGER NULL COMMENT 'Maximum group size',
  `equipment_needed` TEXT NULL COMMENT 'What to bring',
  `dress_code` VARCHAR(255) NULL COMMENT 'Attire requirements',
  `booking_required` BOOLEAN DEFAULT FALSE COMMENT 'Advance booking needed?',
  `additional_costs` DECIMAL(10,2) NULL COMMENT 'Extra fees not in base price',
  `additional_costs_description` TEXT NULL COMMENT 'What the extra costs are for',
  `created_at` TIMESTAMP DEFAULT (NOW()),
  `updated_at` TIMESTAMP NULL,

  FOREIGN KEY (`itinerary_item_id`) REFERENCES `itinerary_items` (`id`) ON DELETE CASCADE,
  INDEX `idx_itinerary_item` (`itinerary_item_id`)
) COMMENT='Activity/tour/experience-specific details';

-- ========================================
-- VERIFICATION
-- ========================================

-- Show updated itinerary_items structure
SELECT 'Updated itinerary_items table:' AS Status;
DESCRIBE itinerary_items;

-- Show new tables
SELECT 'New flight_itinerary table:' AS Status;
DESCRIBE flight_itinerary;

SELECT 'New lodging_itinerary table:' AS Status;
DESCRIBE lodging_itinerary;

SELECT 'New car_rental_itinerary table:' AS Status;
DESCRIBE car_rental_itinerary;

SELECT 'New activity_itinerary table:' AS Status;
DESCRIBE activity_itinerary;

-- Show all tables
SELECT 'All tables in smart_trip database:' AS Status;
SHOW TABLES;

SELECT '✅ Migration completed successfully!' AS Status;
