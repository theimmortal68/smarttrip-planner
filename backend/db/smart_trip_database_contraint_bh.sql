/*
========================================
CONSTRAINT BEHAVIOR TESTS - PRODUCTION DATABASE
========================================
This file contains tests that actually TRY to violate constraints
to prove they're working correctly.

Tests 1-6 are SHOULD FAIL!
Each test should make an error, proves the constraint works.

Tests 7-10 should SUCCEED WITH cascade delete behavior.


***Manipulate the comment brackets to test each at a time.***

========================================
*/

USE smart_trip;

/*
-- ========================================
-- TEST 1: PRIMARY KEY - Cannot insert duplicate PK
-- ========================================
SELECT '=== TEST 1: Try to insert duplicate PRIMARY KEY ===' AS 'TEST';

-- What IDs exist
SELECT id, email FROM users LIMIT 5;

-- Try to manually insert a user with an existing ID
-- Should see: Duplicate entry for key 'PRIMARY'
INSERT INTO users (id, email, password_hash)
VALUES (1, 'duplicate.test@example.com', 'hash123');
*/
/*
-- ========================================
-- TEST 2: UNIQUE CONSTRAINT - Cannot insert duplicate email
-- ========================================
SELECT '=== TEST 2: Try to insert duplicate EMAIL ===' AS 'TEST';

-- user with an email that already exists
-- Duplicate entry for key 'email'
INSERT INTO users (email, password_hash)
VALUES ('alice@example.com', 'hash456');
*/
/*
-- ========================================
-- TEST 3: FOREIGN KEY - Cannot insert invalid FK reference
-- ========================================
SELECT '=== TEST 3: Try to insert invalid FOREIGN KEY reference ===' AS 'TEST';

-- trip with a non-existent creator_id
-- cant add or update a child row: a foreign key constraint fails
INSERT INTO trips (creator_id, location, start_date, end_date)
VALUES (99999, 'Invalid Location', '2025-01-15', '2025-01-20');
*/
/*
-- ========================================
-- TEST 4: NOT NULL CONSTRAINT - Cannot insert NULL
-- ========================================
SELECT '=== TEST 4: Try to insert NULL in NOT NULL field ===' AS 'TEST';

-- user without email (which is NOT NULL)
-- Column 'email' cannot be null
INSERT INTO users (name, email, password_hash)
VALUES ('Test User', NULL, 'hash789');
*/
/*
-- ========================================
-- TEST 5: UNIQUE INDEX - Cannot create duplicate membership
-- ========================================
SELECT '=== TEST 5: Try to create duplicate trip membership ===' AS 'TEST';

-- First, see existing memberships for trip 1
SELECT user_id, trip_id, role FROM trip_members WHERE trip_id = 1;

-- same user to the same trip twice
-- Duplicate entry for key 'trip_members_index_2'
INSERT INTO trip_members (user_id, trip_id, role)
VALUES (1, 1, 'viewer');
*/
/*
-- ========================================
-- TEST 6: UNIQUE TOKEN - Cannot create duplicate invite token
-- ========================================
SELECT '=== TEST 6: Try to create duplicate invite TOKEN ===' AS 'TEST';

-- First, see an existing token
SELECT token FROM invites LIMIT 1;

-- invite with an existing token
-- Duplicate entry for key 'token'
INSERT INTO invites (trip_id, email, role, token, expires_at)
VALUES (1, 'newuser@example.com', 'viewer', 'abc123token456def', '2025-12-31 23:59:59');
*/




/*
-- ========================================
-- SECTION 2: CASCADE DELETE TESTS
-- ========================================
-- These tests will SUCCEED but should demonstrate cascade behavior
-- WARNING: will modify data! Only run on test databases!

-- ========================================
-- TEST 7: CASCADE DELETE - Deleting trip deletes members
-- ========================================
SELECT '=== TEST 7: Test CASCADE DELETE on trip_members ===' AS 'TEST';


-- Check members before delete
SELECT 'BEFORE DELETE:' AS 'Status';
SELECT trip_id, COUNT(*) as member_count FROM trip_members GROUP BY trip_id;



-- test trip with added members
INSERT INTO trips (creator_id, location, start_date, end_date)
VALUES (1, 'Test Location CASCADE', '2025-02-01', '2025-02-05');

SET @test_trip_id = LAST_INSERT_ID();

INSERT INTO trip_members (user_id, trip_id, role)
VALUES (1, @test_trip_id, 'owner'),
       (2, @test_trip_id, 'viewer');


-- Verify members were added
SELECT 'AFTER INSERT:' AS 'Status';
SELECT COUNT(*) as member_count FROM trip_members WHERE trip_id = @test_trip_id;


-- Delete the trip (should cascade delete members)
DELETE FROM trips WHERE id = @test_trip_id;


-- Verify members were deleted
SELECT 'AFTER CASCADE DELETE:' AS 'Status';
SELECT COUNT(*) as member_count FROM trip_members WHERE trip_id = @test_trip_id;
-- should be: 0 rows returned (members were cascade deleted)

-- ========================================
-- TEST 8: CASCADE DELETE - Deleting trip deletes itinerary
-- ========================================
SELECT '=== TEST 8: Test CASCADE DELETE on itinerary_items ===' AS 'TEST';


-- Create test trip with itinerary
INSERT INTO trips (creator_id, location, start_date, end_date)
VALUES (1, 'Test CASCADE Itinerary', '2025-03-01', '2025-03-05');

SET @test_trip_id2 = LAST_INSERT_ID();

INSERT INTO itinerary_items (trip_id, day_index, title, created_by)
VALUES (@test_trip_id2, 1, 'Activity 1', 1),
       (@test_trip_id2, 2, 'Activity 2', 1);

-- Check before delete
SELECT 'BEFORE DELETE:' AS 'Status';
SELECT COUNT(*) as itinerary_count FROM itinerary_items WHERE trip_id = @test_trip_id2;


-- Delete trip
DELETE FROM trips WHERE id = @test_trip_id2;


-- Check after delete
SELECT 'AFTER CASCADE DELETE:' AS 'Status';
SELECT COUNT(*) as itinerary_count FROM itinerary_items WHERE trip_id = @test_trip_id2;
-- EXPECTED: 0 (itinerary items were cascade deleted)



-- ========================================
-- TEST 9: CASCADE DELETE - Deleting trip deletes invites
-- ========================================
SELECT '=== TEST 9: Test CASCADE DELETE on invites ===' AS 'TEST';


-- Create test trip with invite
INSERT INTO trips (creator_id, location, start_date, end_date)
VALUES (1, 'Test CASCADE Invites', '2025-04-01', '2025-04-05');

SET @test_trip_id3 = LAST_INSERT_ID();

INSERT INTO invites (trip_id, email, role, token, expires_at)
VALUES (@test_trip_id3, 'testinvite@example.com', 'viewer', 'test_token_cascade', '2025-12-31 23:59:59');


-- Check before delete
SELECT 'BEFORE DELETE:' AS 'Status';
SELECT COUNT(*) as invite_count FROM invites WHERE trip_id = @test_trip_id3;


-- Delete trip
DELETE FROM trips WHERE id = @test_trip_id3;


-- Check after delete
SELECT 'AFTER CASCADE DELETE:' AS 'Status';
SELECT COUNT(*) as invite_count FROM invites WHERE trip_id = @test_trip_id3;
-- EXPECTED: 0 (invites were cascade deleted)



-- ========================================
-- TEST 10: CASCADE DELETE - Deleting trip deletes cost items
-- ========================================
SELECT '=== TEST 10: Test CASCADE DELETE on cost_items ===' AS 'TEST';


-- Create test trip with costs
INSERT INTO trips (creator_id, location, start_date, end_date)
VALUES (1, 'Test CASCADE Costs', '2025-05-01', '2025-05-05');

SET @test_trip_id4 = LAST_INSERT_ID();

INSERT INTO cost_items (trip_id, label, amount, paid_by)
VALUES (@test_trip_id4, 'Test Expense 1', 50.00, 1),
       (@test_trip_id4, 'Test Expense 2', 75.50, 1);


-- Check before delete
SELECT 'BEFORE DELETE:' AS 'Status';
SELECT COUNT(*) as cost_count FROM cost_items WHERE trip_id = @test_trip_id4;


-- Delete trip
DELETE FROM trips WHERE id = @test_trip_id4;


-- Check after delete
SELECT 'AFTER CASCADE DELETE:' AS 'Status';
SELECT COUNT(*) as cost_count FROM cost_items WHERE trip_id = @test_trip_id4;
-- EXPECTED: 0 (cost items were cascade deleted)

*/

-- ========================================
-- SUMMARY
-- ========================================
SELECT '
========================================
TEST SUMMARY - PRODUCTION DATABASE
========================================
Tests 1-6: Should FAIL with constraint errors (proving constraints work)
           These are commented out - uncomment to run one at a time

Tests 7-10: Should SUCCEED and show cascade deletes working

NOTE: Production database uses free-text activity_type field,
      so there is NO Test 11 (activity FK constraint) like in V1.

If any test that should fail does NOT produce an error,
that constraint is not working correctly!

If cascade deletes do not remove related records,
the CASCADE rules are not set up properly!
========================================
' AS 'INSTRUCTIONS';

