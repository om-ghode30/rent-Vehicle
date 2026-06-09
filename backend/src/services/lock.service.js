const db = require("../config/db");

async function acquireVehicleLock(vehicle_id) {
  try {
    // 1. Clear expired locks globally
    // MySQL equivalent of datetime('now') is NOW()
    await db.query(`
      UPDATE vehicles 
      SET is_temporarily_locked = 0 
      WHERE lock_expiry_time < NOW()
    `);

    // 2. Attempt to acquire lock
    // MySQL equivalent of datetime('now', '+10 minutes') is NOW() + INTERVAL 10 MINUTE
    const [result] = await db.query(`
      UPDATE vehicles
      SET is_temporarily_locked = 1,
          lock_expiry_time = NOW() + INTERVAL 10 MINUTE
      WHERE id = ? 
        AND isBlocked = 0 
        AND (
          is_temporarily_locked = 0 
          OR lock_expiry_time < NOW()
        )
    `, [vehicle_id]);

    // In mysql2, 'affectedRows' is the equivalent of SQLite's 'changes'
    if (result.affectedRows === 0) {
      return { success: false, message: "Vehicle already locked or blocked" };
    }

    return { success: true };
  } catch (error) {
    console.error("Lock Acquisition Error:", error);
    return { success: false, message: error.message };
  }
}

async function releaseVehicleLock(vehicle_id) {
  try {
    await db.query(`
      UPDATE vehicles
      SET is_temporarily_locked = 0,
          lock_expiry_time = NULL
      WHERE id = ?
    `, [vehicle_id]);
  } catch (error) {
    console.error("Lock Release Error:", error);
  }
}

module.exports = {
  acquireVehicleLock,
  releaseVehicleLock
};