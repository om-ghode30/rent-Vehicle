const db = require("../config/db");
function acquireVehicleLock(vehicle_id) {

  // Clear expired locks
  db.prepare(`
    UPDATE vehicles
    SET is_temporarily_locked = 0
    WHERE lock_expiry_time < datetime('now')
  `).run();

  const result = db.prepare(`
    UPDATE vehicles
    SET is_temporarily_locked = 1,
        lock_expiry_time = datetime('now', '+10 minutes')
    WHERE id = ?
      AND isBlocked = 0
      AND (
        is_temporarily_locked = 0
        OR lock_expiry_time < datetime('now')
      )
  `).run(vehicle_id);

  if (result.changes === 0) {
    return { success: false, message: "Vehicle already locked by another user" };
  }

  return { success: true };
}

function releaseVehicleLock(vehicle_id) {
  db.prepare(`
    UPDATE vehicles
    SET is_temporarily_locked = 0,
        lock_expiry_time = NULL
    WHERE id = ?
  `).run(vehicle_id);
}

module.exports = {
  acquireVehicleLock,
  releaseVehicleLock
};