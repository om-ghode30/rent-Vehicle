const db = require("../../config/db");

exports.getVehicles = async (req, res) => { // Added async
  try {
    // MySQL returns an array [rows, fields], we destructure the first element
    const [vehicles] = await db.query(`
      SELECT owner_id, id, vehicle_number, brand, model_name, price_per_day
      FROM vehicles
      WHERE status = 'APPROVED'
        AND availability_status = 'AVAILABLE'
        AND is_temporarily_locked = 0
    `);

    res.json({
      success: true,
      data: vehicles,
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles"
    });
  }
};