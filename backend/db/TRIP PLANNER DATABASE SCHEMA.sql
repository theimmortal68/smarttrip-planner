/*
========================================
TRIP PLANNER DATABASE SCHEMA 
========================================
*/

CREATE DATABASE IF NOT EXISTS smart_trip;
USE smart_trip;

CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `first_name` varchar(255),
  `last_name` varchar(255),
  `email` varchar(255) UNIQUE NOT NULL,
  `password_hash` varchar(255),
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `trips` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `creator_id` integer NOT NULL,
  `name` varchar(255),
  `location_name` varchar(255),
  `start_date` date,
  `end_date` date,
  `notes` text,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp
);

CREATE TABLE `trip_members` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `trip_id` integer NOT NULL,
  `role` varchar(255) NOT NULL COMMENT 'ENUM: owner, co_owner, editor, viewer',
  `joined_at` timestamp DEFAULT (now())
);

CREATE TABLE `itinerary_items` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `trip_id` integer NOT NULL,
  `day_index` integer,
  `title` varchar(255) NOT NULL,
  `description` text,
  `start_time` time,
  `end_time` time,
  `duration_hours` decimal(5,2),
  `location_name` varchar(255),
  `google_place_id` varchar(255),
  `activity_type` varchar(255), 
  `participants_json` json,
  `equipment_list` json,
  `food_plan` text,
  `transport_mode` varchar(255),
  `notes` text,
  `sort_order` integer,
  `created_by` integer,
  `created_at` timestamp DEFAULT (now()),
  `updated_by` integer,
  `updated_at` timestamp
);

CREATE TABLE `activities` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(255),
  `default_duration_hours` decimal(5,2),
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `invites` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `trip_id` integer NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL COMMENT 'ENUM: owner, co_owner, editor, viewer',
  `token` varchar(255) UNIQUE NOT NULL,
  `expires_at` timestamp NOT NULL,
  `accepted_at` timestamp,
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `cost_items` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `trip_id` integer NOT NULL,
  `label` varchar(255) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `paid_by` integer NOT NULL,
  `created_at` timestamp DEFAULT (now())
);

-- Fast lookups- all trips, specific user
CREATE INDEX `trips_index_0` ON `trips` (`creator_id`);

-- Better queries- "trips in date range"
CREATE INDEX `trips_index_1` ON `trips` (`start_date`, `end_date`);

-- Fast lookups, stops dups of memeberships
CREATE UNIQUE INDEX `trip_members_index_2` ON `trip_members` (`user_id`, `trip_id`);

-- Fast lookups- activities for trips
CREATE INDEX `itinerary_items_index_3` ON `itinerary_items` (`trip_id`);

-- Who created each item
CREATE INDEX `itinerary_items_index_4` ON `itinerary_items` (`created_by`);

-- Improved sorting for activities by the day
CREATE INDEX `itinerary_items_index_5` ON `itinerary_items` (`trip_id`, `day_index`);

-- finds the invites for a trip
CREATE INDEX `invites_index_7` ON `invites` (`trip_id`);

-- Faster validation for tokens
CREATE INDEX `invites_index_8` ON `invites` (`token`);

-- Gets the expenses for a trip
CREATE INDEX `cost_items_index_9` ON `cost_items` (`trip_id`);

-- Who pays what
CREATE INDEX `cost_items_index_10` ON `cost_items` (`paid_by`);

-- One user to many trips
ALTER TABLE `trips` ADD FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`);

-- === MANY-TO-MANY RELATIONSHIP (via trip_members) ===
-- One user to many trip memberships
ALTER TABLE `trip_members` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

-- Remove the memberships when trip is deleted
ALTER TABLE `trip_members` ADD FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE;

-- One trip to many itinerary items
-- Delete the activities when trip is deleted
ALTER TABLE `itinerary_items` ADD FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE;

-- One user to many itinerary items (creator)
ALTER TABLE `itinerary_items` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

-- One user to many itinerary items (updater)
ALTER TABLE `itinerary_items` ADD FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

-- One trip to many invites
-- Cancel the pending invites when trip is deleted
ALTER TABLE `invites` ADD FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE;

-- One trip to many expenses
-- Remove all expenses when trip is deleted
ALTER TABLE `cost_items` ADD FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE;

-- One user to many cost items (payer)
ALTER TABLE `cost_items` ADD FOREIGN KEY (`paid_by`) REFERENCES `users` (`id`);
