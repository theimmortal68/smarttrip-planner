/*
========================================
SAMPLE DATA FOR SMART_TRIP DATABASE
========================================
10 users, 5 trips with diff scenarios
Multiple trip members with different roles
Lots of itinerary items with free-text activity types
Reference activities for autocomplete
Pending and accepted invites
Cost items with different payers
========================================
*/

USE smart_trip;

-- ========================================
-- Just clearing existing data 
-- ========================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE cost_items;
TRUNCATE TABLE invites;
TRUNCATE TABLE itinerary_items;
TRUNCATE TABLE trip_members;
TRUNCATE TABLE trips;
TRUNCATE TABLE activities;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- USERS
-- ========================================
INSERT INTO users (name, email, password_hash, created_at) VALUES
('Alice Johnson', 'alice@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', '2024-01-15 10:00:00'),
('Bob Smith', 'bob@example.com', '$2a$10$bcdefghijklmnopqrstuvwxyz234567', '2024-01-16 11:30:00'),
('Charlie Brown', 'charlie@example.com', '$2a$10$cdefghijklmnopqrstuvwxyz345678', '2024-01-17 09:15:00'),
('Diana Prince', 'diana@example.com', '$2a$10$defghijklmnopqrstuvwxyz456789', '2024-01-18 14:20:00'),
('Eve Martinez', 'eve@example.com', '$2a$10$efghijklmnopqrstuvwxyz567890', '2024-01-19 16:45:00'),
('Frank Miller', 'frank@example.com', '$2a$10$fghijklmnopqrstuvwxyz678901', '2024-01-20 08:30:00'),
('Grace Lee', 'grace@example.com', '$2a$10$ghijklmnopqrstuvwxyz789012', '2024-01-21 12:00:00'),
('Henry Chen', 'henry@example.com', '$2a$10$hijklmnopqrstuvwxyz890123', '2024-01-22 15:30:00'),
('Iris Wang', 'iris@example.com', '$2a$10$ijklmnopqrstuvwxyz901234', '2024-01-23 10:45:00'),
('Jack Davis', 'jack@example.com', '$2a$10$jklmnopqrstuvwxyz012345', '2024-01-24 13:15:00');

-- ========================================
-- ACTIVITIES
-- ========================================
-- These are for autocomplete suggestions (not enforced by FK in V2)
INSERT INTO activities (name, description, category, default_duration_hours, created_at) VALUES
('Hiking', 'Outdoor trail hiking', 'Outdoor', 3.00, '2024-01-01 00:00:00'),
('Museum Visit', 'Cultural museum exploration', 'Culture', 2.00, '2024-01-01 00:00:00'),
('Beach Day', 'Relaxing at the beach', 'Leisure', 4.00, '2024-01-01 00:00:00'),
('Restaurant Dinner', 'Dining experience', 'Food', 2.00, '2024-01-01 00:00:00'),
('City Walking Tour', 'Guided city exploration', 'Sightseeing', 3.00, '2024-01-01 00:00:00'),
('Kayaking', 'Water kayaking adventure', 'Water Sports', 2.50, '2024-01-01 00:00:00'),
('Wine Tasting', 'Vineyard wine tasting', 'Food & Drink', 2.00, '2024-01-01 00:00:00'),
('Rock Climbing', 'Indoor or outdoor climbing', 'Adventure', 3.00, '2024-01-01 00:00:00'),
('Shopping', 'Local market or mall shopping', 'Leisure', 2.00, '2024-01-01 00:00:00'),
('Spa Day', 'Wellness and relaxation', 'Wellness', 3.00, '2024-01-01 00:00:00'),
('Snorkeling', 'Underwater exploration', 'Water Sports', 2.00, '2024-01-01 00:00:00'),
('Cooking Class', 'Learn local cuisine', 'Food', 3.00, '2024-01-01 00:00:00'),
('Zip Lining', 'Aerial adventure', 'Adventure', 2.00, '2024-01-01 00:00:00'),
('Brewery Tour', 'Local brewery visit', 'Food & Drink', 2.00, '2024-01-01 00:00:00'),
('Bike Rental', 'City bike exploration', 'Active', 3.00, '2024-01-01 00:00:00');

-- ========================================
-- TRIPS
-- ========================================
INSERT INTO trips (creator_id, location, start_date, end_date, notes, created_at, updated_at) VALUES
(1, 'Yosemite National Park, CA', '2025-03-15', '2025-03-20', 'Spring camping and hiking adventure with the crew!', '2024-12-01 10:00:00', '2024-12-01 10:00:00'),
(2, 'Tokyo, Japan', '2025-05-01', '2025-05-10', 'Cherry blossom season trip - culture, food, and temples', '2024-12-05 14:30:00', '2024-12-05 14:30:00'),
(3, 'Miami Beach, FL', '2025-07-04', '2025-07-07', 'July 4th beach weekend with friends', '2024-12-10 09:15:00', '2024-12-10 09:15:00'),
(4, 'Paris, France', '2025-09-12', '2025-09-19', 'Romantic getaway - art, wine, and romance', '2024-12-12 16:45:00', '2024-12-12 16:45:00'),
(5, 'Banff National Park, Canada', '2025-11-20', '2025-11-25', 'Winter wonderland skiing trip', '2024-12-15 11:20:00', '2024-12-15 11:20:00');

-- ========================================
-- TRIP MEMBERS
-- ========================================
-- Trip 1: Yosemite (Alice's trip - 4 members)
INSERT INTO trip_members (user_id, trip_id, role, joined_at) VALUES
(1, 1, 'owner', '2024-12-01 10:00:00'),
(2, 1, 'co_owner', '2024-12-01 11:00:00'),
(3, 1, 'editor', '2024-12-01 12:00:00'),
(6, 1, 'viewer', '2024-12-01 13:00:00');

-- Trip 2: Tokyo (Bob's trip - 3 members)
INSERT INTO trip_members (user_id, trip_id, role, joined_at) VALUES
(2, 2, 'owner', '2024-12-05 14:30:00'),
(1, 2, 'editor', '2024-12-05 15:00:00'),
(4, 2, 'editor', '2024-12-05 16:00:00');

-- Trip 3: Miami (Charlie's trip - 5 members)
INSERT INTO trip_members (user_id, trip_id, role, joined_at) VALUES
(3, 3, 'owner', '2024-12-10 09:15:00'),
(5, 3, 'co_owner', '2024-12-10 10:00:00'),
(7, 3, 'editor', '2024-12-10 11:00:00'),
(8, 3, 'viewer', '2024-12-10 12:00:00'),
(9, 3, 'viewer', '2024-12-10 13:00:00');

-- Trip 4: Paris (Diana's trip - 2 members, romantic)
INSERT INTO trip_members (user_id, trip_id, role, joined_at) VALUES
(4, 4, 'owner', '2024-12-12 16:45:00'),
(10, 4, 'co_owner', '2024-12-12 17:00:00');

-- Trip 5: Banff (Eve's trip - 4 members)
INSERT INTO trip_members (user_id, trip_id, role, joined_at) VALUES
(5, 5, 'owner', '2024-12-15 11:20:00'),
(6, 5, 'editor', '2024-12-15 12:00:00'),
(7, 5, 'editor', '2024-12-15 13:00:00'),
(8, 5, 'viewer', '2024-12-15 14:00:00');

-- ========================================
-- ITINERARY ITEMS
-- ========================================
-- Trip 1
INSERT INTO itinerary_items (trip_id, day_index, title, description, start_time, duration_hours, location_name, activity_type, created_by, created_at, sort_order) VALUES
-- Day 1
(1, 1, 'Drive to Yosemite', 'Road trip from SF to Yosemite Valley', '08:00:00', 4.00, 'Highway 120', 'Driving', 1, '2024-12-01 10:30:00', 1),
(1, 1, 'Check into campground', 'Set up tents at Upper Pines', '14:00:00', 2.00, 'Upper Pines Campground', 'camping setup', 1, '2024-12-01 10:35:00', 2),
(1, 1, 'Evening campfire', 'Dinner and stories around the fire', '18:00:00', 2.00, 'Campsite', 'campfire', 2, '2024-12-01 11:00:00', 3),
-- Day 2
(1, 2, 'Half Dome hike', 'Challenging all-day hike with permits', '06:00:00', 10.00, 'Half Dome Trail', 'HIKING', 1, '2024-12-01 10:40:00', 4),
(1, 2, 'Rest and recovery', 'Relax at camp after the hike', '18:00:00', 2.00, 'Campsite', 'relaxing', 2, '2024-12-01 11:05:00', 5),
-- Day 3
(1, 3, 'Yosemite Falls hike', 'Morning hike to upper falls', '07:00:00', 5.00, 'Yosemite Falls Trail', 'hiking', 3, '2024-12-01 12:00:00', 6),
(1, 3, 'Lunch at Ahwahnee', 'Nice lunch at historic hotel', '13:00:00', 2.00, 'The Ahwahnee', 'Restaurant Dining', 1, '2024-12-01 10:45:00', 7),
(1, 3, 'Photography session', 'Sunset photos at Glacier Point', '18:00:00', 2.00, 'Glacier Point', 'photography', 2, '2024-12-01 11:10:00', 8),
-- Day 4
(1, 4, 'Rock climbing lesson', 'Beginner climbing at El Cap meadow', '09:00:00', 4.00, 'El Capitan', 'Rock Climbing', 3, '2024-12-01 12:05:00', 9),
(1, 4, 'Swimming at Mirror Lake', 'Afternoon swim and picnic', '15:00:00', 3.00, 'Mirror Lake', 'Swimming', 1, '2024-12-01 10:50:00', 10),
-- Day 5
(1, 5, 'Pack up camp', 'Break down tents and gear', '08:00:00', 2.00, 'Campsite', 'packing', 1, '2024-12-01 10:55:00', 11),
(1, 5, 'Drive home', 'Return to SF', '11:00:00', 4.00, 'Highway 120', 'driving', 1, '2024-12-01 11:00:00', 12);

-- Trip 2
INSERT INTO itinerary_items (trip_id, day_index, title, description, start_time, duration_hours, location_name, activity_type, created_by, created_at, sort_order) VALUES
-- Day 1
(2, 1, 'Arrive at Narita', 'Flight arrival and customs', '16:00:00', 2.00, 'Narita Airport', 'Travel', 2, '2024-12-05 15:00:00', 1),
(2, 1, 'Hotel check-in', 'Check into Shinjuku hotel', '19:00:00', 1.00, 'Shinjuku Hotel', 'check-in', 2, '2024-12-05 15:05:00', 2),
(2, 1, 'Ramen dinner', 'First meal in Tokyo!', '20:00:00', 1.50, 'Ichiran Ramen', 'restaurant dinner', 1, '2024-12-05 15:10:00', 3),
-- Day 2
(2, 2, 'Tsukiji Fish Market', 'Fresh sushi breakfast', '06:00:00', 2.00, 'Tsukiji Outer Market', 'Food Tour', 2, '2024-12-05 15:15:00', 4),
(2, 2, 'Imperial Palace', 'Tour the palace gardens', '10:00:00', 2.00, 'Imperial Palace East Gardens', 'Sightseeing', 1, '2024-12-05 15:20:00', 5),
(2, 2, 'Ginza shopping', 'Luxury shopping district', '14:00:00', 3.00, 'Ginza', 'Shopping', 4, '2024-12-05 16:00:00', 6),
(2, 2, 'TeamLab Borderless', 'Digital art museum', '18:00:00', 2.50, 'Odaiba', 'museum visit', 2, '2024-12-05 15:25:00', 7),
-- Day 3
(2, 3, 'Senso-ji Temple', 'Ancient Buddhist temple', '09:00:00', 2.00, 'Asakusa', 'temple visit', 1, '2024-12-05 15:30:00', 8),
(2, 3, 'Nakamise Shopping Street', 'Traditional crafts and snacks', '11:00:00', 1.50, 'Asakusa', 'shopping', 4, '2024-12-05 16:05:00', 9),
(2, 3, 'Ueno Park', 'Cherry blossom viewing', '14:00:00', 3.00, 'Ueno Park', 'hanami', 2, '2024-12-05 15:35:00', 10),
(2, 3, 'Izakaya dinner', 'Japanese pub experience', '19:00:00', 2.50, 'Shinjuku Omoide Yokocho', 'Restaurant Dinner', 1, '2024-12-05 15:40:00', 11),
-- Day 4-5 
(2, 4, 'Day trip to Nikko', 'UNESCO World Heritage temples', '07:00:00', 10.00, 'Nikko', 'Day Trip', 2, '2024-12-05 15:45:00', 12),
(2, 5, 'Cooking class', 'Learn to make sushi', '10:00:00', 3.00, 'Shibuya', 'Cooking Class', 1, '2024-12-05 15:50:00', 13),
(2, 5, 'Shibuya Crossing', 'Famous intersection photo op', '15:00:00', 1.00, 'Shibuya', 'sightseeing', 4, '2024-12-05 16:10:00', 14),
(2, 5, 'Karaoke night', 'Private room karaoke', '20:00:00', 3.00, 'Shinjuku', 'Karaoke', 2, '2024-12-05 15:55:00', 15);

-- Trip 3
INSERT INTO itinerary_items (trip_id, day_index, title, description, start_time, duration_hours, location_name, activity_type, created_by, created_at, sort_order) VALUES
-- Day 1
(3, 1, 'Beach arrival', 'Check into beachfront hotel', '14:00:00', 1.00, 'South Beach Hotel', 'check-in', 3, '2024-12-10 09:30:00', 1),
(3, 1, 'Beach time', 'Afternoon swimming and sunbathing', '16:00:00', 3.00, 'South Beach', 'Beach Day', 3, '2024-12-10 09:35:00', 2),
(3, 1, 'Ocean Drive dinner', 'Seafood restaurant', '19:00:00', 2.00, 'Ocean Drive', 'restaurant dinner', 5, '2024-12-10 10:00:00', 3),
(3, 1, 'Art Deco night walk', 'Explore the colorful architecture', '21:00:00', 1.50, 'Art Deco District', 'walking tour', 3, '2024-12-10 09:40:00', 4),
-- Day 2
(3, 2, 'Jet ski rental', 'Morning water sports', '09:00:00', 2.00, 'South Beach', 'jet skiing', 7, '2024-12-10 11:00:00', 5),
(3, 2, 'Beach volleyball', 'Pickup game on the sand', '11:30:00', 1.50, 'South Beach', 'volleyball', 3, '2024-12-10 09:45:00', 6),
(3, 2, 'Pool party', 'Hotel rooftop pool', '14:00:00', 4.00, 'Hotel Rooftop', 'pool party', 5, '2024-12-10 10:05:00', 7),
(3, 2, 'Wynwood Walls', 'Street art district tour', '19:00:00', 2.00, 'Wynwood', 'Art Gallery', 7, '2024-12-10 11:05:00', 8),
-- Day 3
(3, 3, 'Kayaking', 'Mangrove kayak tour', '08:00:00', 3.00, 'Oleta River State Park', 'Kayaking', 3, '2024-12-10 09:50:00', 9),
(3, 3, 'Cuban lunch', 'Little Havana food tour', '13:00:00', 2.00, 'Little Havana', 'food tour', 5, '2024-12-10 10:10:00', 10),
(3, 3, 'Salsa dancing', 'Outdoor dancing lesson', '16:00:00', 2.00, 'Little Havana', 'dancing', 7, '2024-12-10 11:10:00', 11),
(3, 3, 'Fireworks', 'July 4th beach fireworks', '21:00:00', 1.00, 'South Beach', 'fireworks show', 3, '2024-12-10 09:55:00', 12),
-- Day 4
(3, 4, 'Beach yoga', 'Sunrise yoga session', '06:30:00', 1.00, 'South Beach', 'yoga', 5, '2024-12-10 10:15:00', 13),
(3, 4, 'Brunch', 'Farewell brunch', '10:00:00', 2.00, 'Lincoln Road', 'Brunch', 3, '2024-12-10 10:00:00', 14),
(3, 4, 'Last beach swim', 'Final beach time before flight', '13:00:00', 2.00, 'South Beach', 'swimming', 3, '2024-12-10 10:05:00', 15);

-- Trip 4
INSERT INTO itinerary_items (trip_id, day_index, title, description, start_time, duration_hours, location_name, activity_type, created_by, created_at, sort_order) VALUES
-- Day 1-2 samples
(4, 1, 'Arrive in Paris', 'CDG airport arrival', '18:00:00', 2.00, 'Charles de Gaulle Airport', 'travel', 4, '2024-12-12 17:00:00', 1),
(4, 1, 'Hotel Le Marais', 'Boutique hotel check-in', '20:00:00', 1.00, 'Le Marais', 'check-in', 4, '2024-12-12 17:05:00', 2),
(4, 2, 'Louvre Museum', 'Mona Lisa and more', '09:00:00', 4.00, 'Louvre', 'Museum Visit', 4, '2024-12-12 17:10:00', 3),
(4, 2, 'Seine River cruise', 'Romantic boat ride', '14:00:00', 2.00, 'Seine River', 'boat tour', 10, '2024-12-12 17:15:00', 4),
(4, 2, 'Eiffel Tower dinner', 'Restaurant Jules Verne', '19:00:00', 3.00, 'Eiffel Tower', 'Fine Dining', 4, '2024-12-12 17:20:00', 5),
-- Day 3-4
(4, 3, 'Versailles day trip', 'Palace and gardens', '08:00:00', 8.00, 'Versailles', 'Day Trip', 4, '2024-12-12 17:25:00', 6),
(4, 4, 'Montmartre morning', 'Sacré-Cœur and artists', '09:00:00', 3.00, 'Montmartre', 'sightseeing', 10, '2024-12-12 17:30:00', 7),
(4, 4, 'Wine tasting', 'French wine bar', '14:00:00', 2.00, 'Saint-Germain', 'Wine Tasting', 4, '2024-12-12 17:35:00', 8),
(4, 4, 'Latin Quarter walk', 'Evening stroll', '18:00:00', 2.00, 'Latin Quarter', 'walking', 10, '2024-12-12 17:40:00', 9);

-- Trip 5
INSERT INTO itinerary_items (trip_id, day_index, title, description, start_time, duration_hours, location_name, activity_type, created_by, created_at, sort_order) VALUES
-- Day 1-2
(5, 1, 'Drive to Banff', 'Calgary to Banff drive', '08:00:00', 2.00, 'Trans-Canada Highway', 'driving', 5, '2024-12-15 11:30:00', 1),
(5, 1, 'Ski rental pickup', 'Get gear sorted', '11:00:00', 1.00, 'Banff Sports Shop', 'gear rental', 5, '2024-12-15 11:35:00', 2),
(5, 1, 'Hot springs', 'Relax in Banff Upper Hot Springs', '16:00:00', 2.00, 'Banff Upper Hot Springs', 'hot springs', 6, '2024-12-15 12:00:00', 3),
(5, 2, 'Skiing - Lake Louise', 'Full day on the slopes', '08:00:00', 8.00, 'Lake Louise Ski Resort', 'skiing', 5, '2024-12-15 11:40:00', 4),
(5, 2, 'Apres ski', 'Drinks and food at lodge', '17:00:00', 2.00, 'Lake Louise Lodge', 'apres ski', 7, '2024-12-15 13:00:00', 5),
-- Day 3-4
(5, 3, 'Snowshoeing', 'Johnston Canyon frozen waterfalls', '09:00:00', 4.00, 'Johnston Canyon', 'snowshoeing', 6, '2024-12-15 12:05:00', 6),
(5, 3, 'Ice skating', 'Lake Louise frozen lake', '15:00:00', 2.00, 'Lake Louise', 'ice skating', 5, '2024-12-15 11:45:00', 7),
(5, 4, 'Skiing - Sunshine', 'Different resort', '08:00:00', 8.00, 'Sunshine Village', 'Skiing', 7, '2024-12-15 13:05:00', 8),
(5, 5, 'Dog sledding', 'Husky sled experience', '10:00:00', 2.00, 'Canmore', 'dog sledding', 5, '2024-12-15 11:50:00', 9),
(5, 5, 'Farewell dinner', 'Steak house in Banff', '19:00:00', 2.50, 'Banff Avenue', 'Restaurant Dinner', 5, '2024-12-15 11:55:00', 10);

-- ========================================
-- INSERT INVITES
-- ========================================
INSERT INTO invites (trip_id, email, role, token, expires_at, accepted_at, created_at) VALUES
-- Pending invites
(1, 'sarah@example.com', 'viewer', 'abc123token456def', '2025-02-15 23:59:59', NULL, '2024-12-20 10:00:00'),
(2, 'mike@example.com', 'editor', 'xyz789token012abc', '2025-04-01 23:59:59', NULL, '2024-12-18 14:30:00'),
(3, 'lisa@example.com', 'viewer', 'qwe456token789rty', '2025-06-15 23:59:59', NULL, '2024-12-22 09:00:00'),
(4, 'tom@example.com', 'viewer', 'uio123token456plm', '2025-08-01 23:59:59', NULL, '2024-12-19 16:00:00'),
(5, 'amy@example.com', 'editor', 'bnm789token012vfr', '2025-10-20 23:59:59', NULL, '2024-12-21 11:00:00'),
-- Accepted invites (these resulted in trip_members entries above)
(1, 'bob@example.com', 'co_owner', 'accepted001', '2025-02-01 23:59:59', '2024-12-01 11:00:00', '2024-12-01 10:05:00'),
(1, 'charlie@example.com', 'editor', 'accepted002', '2025-02-01 23:59:59', '2024-12-01 12:00:00', '2024-12-01 10:10:00'),
(2, 'alice@example.com', 'editor', 'accepted003', '2025-04-15 23:59:59', '2024-12-05 15:00:00', '2024-12-05 14:35:00'),
(3, 'eve@example.com', 'co_owner', 'accepted004', '2025-06-20 23:59:59', '2024-12-10 10:00:00', '2024-12-10 09:20:00'),
(4, 'jack@example.com', 'co_owner', 'accepted005', '2025-08-15 23:59:59', '2024-12-12 17:00:00', '2024-12-12 16:50:00');

-- ========================================
-- COST ITEMS
-- ========================================
-- Trip 1: Yosemite
INSERT INTO cost_items (trip_id, label, amount, paid_by, created_at) VALUES
(1, 'Campground reservation', 120.00, 1, '2024-12-01 10:30:00'),
(1, 'Gas for road trip', 85.50, 2, '2024-12-01 11:15:00'),
(1, 'Groceries for camping', 156.75, 1, '2024-12-01 10:35:00'),
(1, 'Half Dome permits', 40.00, 1, '2024-12-01 10:40:00'),
(1, 'Lunch at Ahwahnee', 85.00, 3, '2024-12-01 12:10:00'),
(1, 'Rock climbing lesson', 200.00, 2, '2024-12-01 11:20:00'),
(1, 'Firewood', 25.00, 1, '2024-12-01 10:45:00');

-- Trip 2: Tokyo
INSERT INTO cost_items (trip_id, label, amount, paid_by, created_at) VALUES
(2, 'Flights (3 people)', 2850.00, 2, '2024-12-05 15:00:00'),
(2, 'Hotel - 10 nights', 1500.00, 2, '2024-12-05 15:05:00'),
(2, 'JR Rail Pass (3x)', 810.00, 1, '2024-12-05 15:30:00'),
(2, 'TeamLab tickets', 90.00, 2, '2024-12-05 15:35:00'),
(2, 'Cooking class', 180.00, 4, '2024-12-05 16:15:00'),
(2, 'Various restaurant meals', 450.00, 2, '2024-12-05 15:40:00'),
(2, 'Souvenirs and shopping', 320.00, 4, '2024-12-05 16:20:00'),
(2, 'Karaoke night', 75.00, 1, '2024-12-05 15:45:00');

-- Trip 3: Miami
INSERT INTO cost_items (trip_id, label, amount, paid_by, created_at) VALUES
(3, 'Beachfront hotel (4 nights)', 800.00, 3, '2024-12-10 09:30:00'),
(3, 'Jet ski rental', 150.00, 7, '2024-12-10 11:15:00'),
(3, 'Kayaking tour', 200.00, 3, '2024-12-10 10:00:00'),
(3, 'Food and drinks - Day 1', 185.50, 5, '2024-12-10 10:20:00'),
(3, 'Food and drinks - Day 2', 220.00, 3, '2024-12-10 10:05:00'),
(3, 'Salsa dancing lesson', 120.00, 7, '2024-12-10 11:20:00'),
(3, 'Uber/Lyft rides', 95.00, 5, '2024-12-10 10:25:00');

-- Trip 4: Paris
INSERT INTO cost_items (trip_id, label, amount, paid_by, created_at) VALUES
(4, 'Round-trip flights', 1600.00, 4, '2024-12-12 17:05:00'),
(4, 'Boutique hotel (8 nights)', 1920.00, 10, '2024-12-12 17:10:00'),
(4, 'Louvre tickets', 34.00, 4, '2024-12-12 17:15:00'),
(4, 'Seine River cruise', 30.00, 10, '2024-12-12 17:20:00'),
(4, 'Eiffel Tower dinner', 420.00, 4, '2024-12-12 17:25:00'),
(4, 'Versailles tickets and transport', 80.00, 10, '2024-12-12 17:30:00'),
(4, 'Wine tasting', 95.00, 4, '2024-12-12 17:35:00'),
(4, 'Various cafe meals', 280.00, 10, '2024-12-12 17:40:00');

-- Trip 5: Banff
INSERT INTO cost_items (trip_id, label, amount, paid_by, created_at) VALUES
(5, 'Ski lift tickets (4 people x 3 days)', 960.00, 5, '2024-12-15 11:35:00'),
(5, 'Ski rental (4 sets)', 480.00, 6, '2024-12-15 12:10:00'),
(5, 'Accommodation (6 nights)', 720.00, 5, '2024-12-15 11:40:00'),
(5, 'Gas for drive', 120.00, 7, '2024-12-15 13:10:00'),
(5, 'Hot springs entry', 40.00, 5, '2024-12-15 11:45:00'),
(5, 'Snowshoeing tour', 160.00, 6, '2024-12-15 12:15:00'),
(5, 'Dog sledding', 240.00, 5, '2024-12-15 11:50:00'),
(5, 'Restaurants and apres ski', 380.00, 7, '2024-12-15 13:15:00');

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
SELECT '=== DATA INSERTED SUCCESSFULLY ===' AS 'STATUS';
SELECT
    'Users' AS 'Table', COUNT(*) AS 'Count' FROM users
UNION ALL SELECT 'Trips', COUNT(*) FROM trips
UNION ALL SELECT 'Trip Members', COUNT(*) FROM trip_members
UNION ALL SELECT 'Itinerary Items', COUNT(*) FROM itinerary_items
UNION ALL SELECT 'Activities', COUNT(*) FROM activities
UNION ALL SELECT 'Invites', COUNT(*) FROM invites
UNION ALL SELECT 'Cost Items', COUNT(*) FROM cost_items;

SELECT '=== SAMPLE DATA SUMMARY ===' AS 'INFO';
SELECT
    t.location AS 'Trip Location',
    COUNT(DISTINCT tm.user_id) AS 'Members',
    COUNT(DISTINCT ii.id) AS 'Activities',
    COUNT(DISTINCT ci.id) AS 'Expenses',
    SUM(ci.amount) AS 'Total Cost'
FROM trips t
LEFT JOIN trip_members tm ON t.id = tm.trip_id
LEFT JOIN itinerary_items ii ON t.id = ii.trip_id
LEFT JOIN cost_items ci ON t.id = ci.trip_id
GROUP BY t.id, t.location
ORDER BY t.start_date;
