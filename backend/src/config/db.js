const Database = require("better-sqlite3");
const path = require("path");

// Create DB file in root folder
const dbPath = path.join(__dirname, "../../database.sqlite");

const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

console.log("SQLite Database Connected");

module.exports = db;