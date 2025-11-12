/*
## MySQL Database Setup Guide

This guide will walk you through setting up the SmartTrip database on your local machine.

## Prerequisites

- MySQL 8.0 or higher installed
- Access to MySQL Workbench or command-line MySQL client
- Admin/root access to your MySQL server

---

## Step 1: Install MySQL (if not already installed)

### Windows
1. Download MySQL Community Server from [mysql.com](https://dev.mysql.com/downloads/mysql/)
2. Run the installer and follow the setup wizard
3. Remember your root password - you'll need it!
4. Default port: `3306`

### Mac
```bash
brew install mysql
brew services start mysql
```

### Linux
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

---

## Step 2: Create Database User

Connect to MySQL as root, then run these commands:

```sql
-- Create a dedicated application user
CREATE USER 'smart_trip_app'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';

-- Grant privileges on the smart_trip database
GRANT ALL PRIVILEGES ON smart_trip.* TO 'smart_trip_app'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;

-- Verify the user was created
SELECT user, host FROM mysql.user WHERE user = 'smart_trip_app';
```

**Important:** Replace `YOUR_SECURE_PASSWORD` with a strong password of your choice.

---

## Step 3: Create the Database Schema

Run the schema file to create the database and all tables:

1. Open MySQL Workbench and connect to your MySQL server
2. Open the file: `database/schemas/v2_standalone/schema.sql`
3. Execute the entire script

This will create:
- Database: `smart_trip`
- 7 tables: `users`, `trips`, `trip_members`, `itinerary_items`, `activities`, `invites`, `cost_items`
- All indexes and foreign key constraints

---

## Step 4: Load Sample Data (Optional but Recommended)

To populate your database with test data:

1. Open the file: `database/test_data/sample_data.sql`
2. Execute the script

This adds:
- 10 sample users
- 5 sample trips (Yosemite, Tokyo, Miami, Paris, Banff)
- 50+ itinerary items
- Reference activities
- Invites and cost items

---

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace `YOUR_PASSWORD_HERE` with the password you set in Step 2:
   ```
   DATABASE_URL="mysql://smart_trip_app:YOUR_SECURE_PASSWORD@localhost:3306/smart_trip"

   DB_USER=smart_trip_app
   DB_PASSWORD=YOUR_SECURE_PASSWORD
   DB_NAME=smart_trip
   ```

3. **NEVER commit your `.env` file to git!** (It's already in `.gitignore`)

---

## Step 6: Verify Your Setup

Run the verification queries to ensure everything is set up correctly:

1. Open: `database/test_data/verify_pks_fks_indexes_v2.sql`
2. Execute the script
3. You should see:
   - ✅ 7 primary keys
   - ✅ 9 foreign keys with CASCADE rules
   - ✅ 10 indexes
   - ✅ 3 unique constraints

---

## Step 7: Test Connection

### Option A: MySQL Workbench
1. Create a new connection
2. Connection Name: `SmartTrip Local`
3. Hostname: `localhost`
4. Port: `3306`
5. Username: `smart_trip_app`
6. Password: (your password)
7. Test Connection

### Option B: Command Line
```bash
mysql -u smart_trip_app -p -h localhost smart_trip
```
Enter your password when prompted.

### Option C: From Your Application
```javascript
// Example Node.js test
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute('SELECT COUNT(*) as user_count FROM users');
console.log('User count:', rows[0].user_count);
```

---

## Troubleshooting

### Error: "Access denied for user"
- Double-check your password in the `.env` file
- Verify the user was created: `SELECT user FROM mysql.user WHERE user = 'smart_trip_app';`

### Error: "Unknown database 'smart_trip'"
- Make sure you ran the schema file from Step 3
- Check existing databases: `SHOW DATABASES;`

### Error: "Can't connect to MySQL server"
- Verify MySQL is running:
  - Windows: Check Services
  - Mac/Linux: `brew services list` or `systemctl status mysql`
- Check the port number (default: 3306)

### Foreign Key Errors
- Make sure you ran the schema file in the correct order
- Tables must be created before foreign keys can be added

---

## Database Architecture Notes

### Free-Text Activity Type
This database uses **V2 architecture** with a free-text `activity_type` field in `itinerary_items`.

- ✅ Users can enter any activity type (flexible)
- ⚠️ May lead to inconsistent data ("Hiking" vs "hiking")
- 💡 The `activities` table exists as reference data for autocomplete suggestions (not enforced)

### Cascade Delete Rules
When a trip is deleted, these records are automatically deleted:
- Trip members
- Itinerary items
- Invites
- Cost items

This prevents orphaned data in the database.

---

## Need Help?

- Check the [database ERD diagrams](../erds/) for visual schema reference
- Review [constraint tests](../test_data/test_constraint_behavior_production.sql) for examples
- Ask the team in the #database channel

---

## Next Steps

Once your database is set up:
1. ✅ Check off "Setup MySQL" in Trello
2. Start building backend API endpoints
3. Test with the sample data
4. Have fun coding! 🚀
*/