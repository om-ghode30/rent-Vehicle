const db = require("./db");

function initDatabase() {

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      phone_number TEXT NOT NULL,
      address TEXT,
      password TEXT,
      role TEXT CHECK(role IN ('USER','OWNER','ADMIN')) NOT NULL,
      isApproved INTEGER DEFAULT 0,
      isBlocked INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER,
  vehicle_number TEXT UNIQUE,  -- 🔥 unique vehicle number
  brand TEXT,
  model_name TEXT,
  price_per_day REAL,

  status TEXT CHECK(status IN ('PENDING','APPROVED','REJECTED')) DEFAULT 'PENDING',
  availability_status TEXT CHECK(availability_status IN ('AVAILABLE','UNAVAILABLE')) DEFAULT 'AVAILABLE',

  is_temporarily_locked INTEGER DEFAULT 0,
  lock_expiry_time DATETIME,
  isBlocked INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (owner_id) REFERENCES users(id)
  );


  CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  user_id INTEGER NOT NULL,
  vehicle_id INTEGER NOT NULL,

  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,

  total_days INTEGER NOT NULL,
  total_price REAL NOT NULL,

  status TEXT CHECK(status IN (
    'PENDING',
    'CONFIRMED',
    'READY_TO_DELIVER',
    'COMPLETED',
    'CANCELLED'
  )) DEFAULT 'PENDING',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS pending_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  booking_id INTEGER NOT NULL,
  user_id INTEGER,
  owner_id INTEGER,

  amount REAL NOT NULL,

  type TEXT CHECK(type IN (
    'REFUND_TO_USER',
    'PAY_TO_OWNER'
  )) NOT NULL,

  status TEXT CHECK(status IN (
    'PENDING',
    'PAID'
  )) DEFAULT 'PENDING',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

  `);

  console.log("Tables created successfully");
  const adminExists = db.prepare(`
    SELECT * FROM users WHERE role = 'ADMIN'
  `).get();

  if (!adminExists) {

    const hashedPassword = '$2b$10$fu2YC0OMf30PeCAIzihVZud/kVkssRzbYI7XdFWB7BDdPt9pOPjuO';

    db.prepare(`
      INSERT INTO users (name, email, phone_number, password, role, isApproved)
      VALUES (?, ?, ?, ?, 'ADMIN', 1)
    `).run(
      "Super Admin",
      "admin@rentv.com",
      "9999999999",
      hashedPassword
    );

    console.log("Default admin created:");
    console.log("Email: admin@rentv.com");
    console.log("Password: admin123");
  }
}

module.exports = initDatabase;