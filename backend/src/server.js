// src/server.js
require("dotenv").config();
const app = require("./app");
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));