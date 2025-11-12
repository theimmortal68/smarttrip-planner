/*
========================================
VERIFICATION QUERIES FOR PRODUCTION DATABASE
========================================
Queries that checks everything was set up correctly in the smart_trip database.
Verifying all Primary Keys, Foreign Keys, Indexes, and Constraints are in place.
========================================
*/

USE smart_trip;

-- ========================================
-- SECTION 1: VERIFY PRIMARY KEYS
-- ========================================
SELECT '=== PRIMARY KEYS ===' AS 'VERIFICATION SECTION';

SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE
    TABLE_SCHEMA = 'smart_trip'
    AND CONSTRAINT_TYPE = 'PRIMARY KEY'
ORDER BY TABLE_NAME;

-- Should see 7 primary keys, one for each table:
-- users, trips, trip_members, itinerary_items, activities, invites, cost_items

-- ========================================
-- SECTION 2: VERIFY FOREIGN KEYS
-- ========================================
SELECT '=== FOREIGN KEYS ===' AS 'VERIFICATION SECTION';

SELECT tc.TABLE_NAME, kcu.COLUMN_NAME, kcu.CONSTRAINT_NAME, kcu.REFERENCED_TABLE_NAME, kcu.REFERENCED_COLUMN_NAME, rc.UPDATE_RULE, rc.DELETE_RULE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
    AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
    LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc ON tc.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
    AND tc.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
WHERE
    tc.TABLE_SCHEMA = 'smart_trip'
    AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
ORDER BY tc.TABLE_NAME, kcu.COLUMN_NAME;

-- Should be 10 Foreign Keys:
-- trips.creator_id -> users.id 
-- trip_members.user_id -> users.id 
-- trip_members.trip_id -> trips.id  - CASCADE DELETE
-- itinerary_items.trip_id -> trips.id  - CASCADE DELETE
-- itinerary_items.created_by -> users.id 
-- itinerary_items.updated_by -> users.id 
-- NOTE: V2 has NO FK for itinerary_items.activity_id 
-- invites.trip_id -> trips.id  - CASCADE DELETE
-- cost_items.trip_id -> trips.id  - CASCADE DELETE
-- cost_items.paid_by -> users.id 

-- ========================================
-- SECTION 3: VERIFY INDEXES
-- ========================================
SELECT '=== INDEXES ===' AS 'VERIFICATION SECTION';

SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    NON_UNIQUE,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE
    TABLE_SCHEMA = 'smart_trip'
ORDER BY
    TABLE_NAME,
    INDEX_NAME,
    SEQ_IN_INDEX;

/*
-Should see 10:
-trips_index_0 on trips 
-trips_index_1 on trips
-trip_members_index_2 on trip_members UNIQUE 
-itinerary_items_index_3 on itinerary_items
-itinerary_items_index_4 on itinerary_items
-itinerary_items_index_5 on itinerary_items
- skips index_6 
-invites_index_7 on invites
-invites_index_8 on invites(token) 
-cost_items_index_9 on cost_items(trip_id) 
-cost_items_index_10 on cost_items(paid_by) 
*/

-- ========================================
-- SECTION 4: VERIFY UNIQUE CONSTRAINTS
-- ========================================
SELECT '=== UNIQUE CONSTRAINTS ===' AS 'VERIFICATION SECTION';

SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE
    TABLE_SCHEMA = 'smart_trip'
    AND CONSTRAINT_TYPE = 'UNIQUE'
ORDER BY TABLE_NAME;

-- Should see 3 unique constraints to prevent duplicates:
-- users.email (UNIQUE) 
-- invites.token (UNIQUE) 
-- trip_members_index_2 (UNIQUE on user_id, trip_id) 

-- ========================================
-- SECTION 5: VERIFY NOT NULL CONSTRAINTS
-- ========================================
SELECT '=== NOT NULL CONSTRAINTS ===' AS 'VERIFICATION SECTION';

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    IS_NULLABLE,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'smart_trip'
    AND IS_NULLABLE = 'NO'
    AND COLUMN_KEY != 'PRI'
ORDER BY TABLE_NAME, COLUMN_NAME;

-- This shows all the required fields (no empty)
-- Looks for important ones like email, password_hash, trip_id, etc.

-- ========================================
-- SECTION 6: CASCADE RULES SUMMARY
-- ========================================
SELECT '=== CASCADE RULES SUMMARY ===' AS 'VERIFICATION SECTION';

SELECT CONCAT(
        tc.TABLE_NAME, '.', kcu.COLUMN_NAME
    ) AS 'Foreign Key', CONCAT(
        kcu.REFERENCED_TABLE_NAME, '.', kcu.REFERENCED_COLUMN_NAME
    ) AS 'References', rc.DELETE_RULE AS 'On Delete', rc.UPDATE_RULE AS 'On Update'
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
    AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
    JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc ON tc.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
    AND tc.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
WHERE
    tc.TABLE_SCHEMA = 'smart_trip'
    AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
ORDER BY tc.TABLE_NAME;

-- CASCADE rules for auto-delete related data when the trip is deleted