const db = require("./db");

async function initDatabase() {
  const connection = await db.getConnection();

  try {
    // USERS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        phone_number VARCHAR(20) NOT NULL,
        address TEXT,
        password TEXT,
        role ENUM('USER','OWNER','ADMIN') NOT NULL,
        isApproved BOOLEAN DEFAULT 1,
        isBlocked BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // VEHICLES
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT,
        vehicle_number VARCHAR(50) UNIQUE,
        brand VARCHAR(100),
        model_name VARCHAR(100),
        price_per_day DECIMAL(10,2),

        status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
        availability_status ENUM('AVAILABLE','UNAVAILABLE') DEFAULT 'AVAILABLE',

        is_temporarily_locked BOOLEAN DEFAULT 0,
        lock_expiry_time DATETIME,
        isBlocked BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `);

    // BOOKINGS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        vehicle_id INT NOT NULL,

        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        d_name TEXT NOT NULL,

        total_days INT NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,

        status ENUM(
          'PENDING','CONFIRMED','READY_TO_DELIVER','COMPLETED','CANCELLED'
        ) DEFAULT 'PENDING',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);

    // PAYMENTS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pending_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        user_id INT,
        owner_id INT,
        amount DECIMAL(10,2) NOT NULL,

        type ENUM('REFUND_TO_USER','PAY_TO_OWNER') NOT NULL,
        status ENUM('PENDING','PAID') DEFAULT 'PENDING',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `);

    // CHAT
    await connection.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT,
        sender_role ENUM('USER','OWNER','ADMIN'),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (booking_id) REFERENCES bookings(id)
      )
    `);

    // OTP
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        otp VARCHAR(10),
        expires_at DATETIME
      )
    `);

    console.log("✅ Tables created successfully");

    // CHECK ADMIN
    const [rows] = await connection.query(
      `SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1`
    );

    if (rows.length === 0) {
      const hashedPassword =
        "$2b$10$fu2YC0OMf30PeCAIzihVZud/kVkssRzbYI7XdFWB7BDdPt9pOPjuO";

      await connection.query(
        `INSERT INTO users (name, email, phone_number, password, role, isApproved)
         VALUES (?, ?, ?, ?, 'ADMIN', 1)`,
        ["Super Admin", "admin@rentv.com", "9999999999", hashedPassword]
      );

      console.log("✅ Default admin created");
      console.log("Email: admin@rentv.com");
      console.log("Password: admin123");
    }
  } catch (err) {
    console.error("❌ DB Init Error:", err);
  } finally {
    connection.release();
  }
}

module.exports = initDatabase;