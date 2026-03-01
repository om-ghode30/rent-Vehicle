const db = require("../../config/db");

exports.getVehicles = (req, res) => {
  const vehicles = db.prepare(`
    SELECT owner_id,id, vehicle_number, brand, model_name, price_per_day
    FROM vehicles
    WHERE status = 'APPROVED'
      AND availability_status = 'AVAILABLE'
      AND is_temporarily_locked = 0
  `).all();
    
  res.json({
    success: true,
    data: vehicles,
  });
};