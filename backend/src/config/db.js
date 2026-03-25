// const Database = require("better-sqlite3");
// const path = require("path");

// // Create DB file in root folder
// const dbPath = path.join(__dirname, "../../database.sqlite");

// const db = new Database(dbPath);

// // Enable foreign keys
// db.pragma("foreign_keys = ON");

// console.log("SQLite Database Connected");

// module.exports = db;

// const mysql = require("mysql2/promise");

// const pool = mysql.createPool({
//   host: process.env.MYSQL_HOST,
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
//   port: process.env.MYSQL_PORT,
// });

// console.log("MySQL Connected");

// module.exports = pool;



const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

console.log("MySQL Connected");

module.exports = pool;