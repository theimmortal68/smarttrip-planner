// ============================================================================
//  src/server.js
//  Entry point for the SmartTrip backend. Loads environment variables,
//  starts the Express app, and listens on the configured port.
// ============================================================================

require('dotenv').config();

const app = require('./app');

// Default port is 3000 if not provided by the environment.
const port = process.env.PORT || 3000;

// Start the HTTP server.
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});