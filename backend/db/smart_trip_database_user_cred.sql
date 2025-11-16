CREATE USER 'smart_trip_app'@'localhost' IDENTIFIED BY 'smart=$123$=TRIP';
GRANT ALL PRIVILEGES ON smart_trip.* TO 'smart_trip_app'@'localhost';
SELECT user, host FROM mysql.user WHERE user = 'smart_trip_app';
FLUSH PRIVILEGES;

ALTER USER 'smart_trip_app'@'localhost'
IDENTIFIED BY 'SmartTrip123!';
FLUSH PRIVILEGES;
