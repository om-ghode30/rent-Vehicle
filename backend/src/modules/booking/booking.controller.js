const db = require("../../config/db");
const fs = require("fs");
const { encryptAndUploadFile} = require("../../utils/fileEncryption");
const { encryptFile } = require("../../utils/fileEncryption");
const { processPayment } = require("../../services/payment.service");
const { acquireVehicleLock, releaseVehicleLock } = require("../../services/lock.service");
const dayjs = require("dayjs");

// Helper for single row fetching
async function getOne(conn, query, params) {
  const [rows] = await conn.query(query, params);
  return rows[0] || null;
}


exports.createBooking = async (req, res) => {
  const conn = await db.getConnection();
  let lockAcquired = false;
  try {
    const bookingUserId = req.user.id;
    // const bookingUserId = 1;

    const { vehicle_id, booking_type, pickup_datetime, days, driver_name,phone_no } = req.body;
    // files
    const license = req.files?.license?.[0];
    const aadhar = req.files?.aadhar?.[0];
    console.log(pickup_datetime);

    // validation
    if (!vehicle_id || !booking_type || !pickup_datetime || !driver_name || !license || !aadhar) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!phone_no) {
      return res.status(400).json({
        success: false,
        message: "Missing phone number"
      });
    }
    console.log(driver_name, phone_no);
    await conn.query(
      `UPDATE booking_users
      SET name = ?, phone_number = ?
      WHERE id = ?`,
      [driver_name, phone_no, bookingUserId]
    );

    await conn.beginTransaction();

    // vehicle
    const vehicle = await getOne(conn, `
      SELECT *
      FROM vehicles
      WHERE id = ?
        AND status = 'APPROVED'
        AND availability_status = 'AVAILABLE'
        AND isBlocked = 0
    `, [vehicle_id]);

    if (!vehicle) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Vehicle unavailable"
      });
    }

    // pickup
    const pickup =
  dayjs(
    pickup_datetime,
    "YYYY-MM-DDTHH:mm:ss"
  );
  // console.log(pickup);
    if (!pickup.isValid()) {
  await conn.rollback();
  return res.status(400).json({
    success: false,
    message: "Invalid pickup datetime"
  });
}
    let drop;
    let totalDays;
    let totalPrice;


    // HOURLY AND DAILY
    if (booking_type === "HOURLY") {
      drop = pickup.add(8, "hour");
      totalDays = 1;
      totalPrice = vehicle.hourly_price;
    }
    else if (booking_type === "DAILY") {
      
      if (!days || Number(days) < 1) {
        await conn.rollback();
        return res.status(400).json({
          success: false,
          message: "Invalid days"
        });
      }

      totalDays = Number(days);
      drop = pickup.add(totalDays, "day");
      totalPrice = totalDays * vehicle.daily_price;
    }
    else {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid booking type"
      });
    }

    // overlap check
    const overlap = await getOne(conn, `
      SELECT id
      FROM bookings
      WHERE vehicle_id = ?
        AND status IN (
          'PENDING',
          'CONFIRMED',
          'READY_TO_DELIVER'
        )
        AND (
          start_datetime < ?
          AND end_datetime > ?
        )
    `, [
      vehicle_id,
      drop.format("YYYY-MM-DD HH:mm:ss"),
      pickup.format("YYYY-MM-DD HH:mm:ss")
    ]);

    if (overlap) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Vehicle already booked"
      });
    }

    // lock
    const lockResult =
      await acquireVehicleLock(vehicle_id);
    if (!lockResult.success) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: lockResult.message
      });
    }
    lockAcquired = true;

    // insert booking first
    const [result] = await conn.query(`
      INSERT INTO bookings (
        booking_user_id, vehicle_id,
        booking_type,
        start_datetime,  end_datetime,
        total_days, total_price,
        driver_name, status
      )
      VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED' )
    `, [ bookingUserId, vehicle_id, booking_type, pickup.format("YYYY-MM-DD HH:mm:ss"), drop.format("YYYY-MM-DD HH:mm:ss"), totalDays, totalPrice, driver_name]);

    const bookingId =
      result.insertId;

    // upload files
    const licenseUpload =
      await encryptAndUploadFile(
        license.path,
        `${bookingId}_license.enc`
      );

    const aadharUpload =
      await encryptAndUploadFile(
        aadhar.path,
        `${bookingId}_aadhar.enc`
      );

    // save URLs
    await conn.query(`
      UPDATE bookings
      SET
        license_url = ?,
        aadhar_url = ?
      WHERE id = ?
    `, [
      licenseUpload.secure_url,
      aadharUpload.secure_url,
      bookingId
    ]);

    await conn.commit();

    if (lockAcquired) {
      await releaseVehicleLock(
        vehicle_id
      );
    }

    res.json({
      success: true,
      booking_id: bookingId,
      total_price: totalPrice,
      pickup: pickup.format("YYYY-MM-DD HH:mm:ss"),
      drop: drop.format("YYYY-MM-DD HH:mm:ss")
    });

  } catch (error) {
    await conn.rollback();
    if (lockAcquired) {
      await releaseVehicleLock(
        vehicle_id
      );
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  } finally {
    conn.release();
  }
};

// =====================================
// CHECK AVAILABILITY
// =====================================
exports.checkAvailability = async (req, res) => {
  try {
    const {vehicle_id, booking_type, pickup_datetime, days} = req.body;

    // validation
    if (!vehicle_id || !booking_type || !pickup_datetime) {
      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });
    }

    // vehicle
    const [rows] = await db.query(`
  SELECT *
  FROM vehicles
  WHERE id = ?
    AND status = 'APPROVED'
    AND availability_status = 'AVAILABLE'
    AND isBlocked = 0`, [vehicle_id]);

const vehicle = rows[0];

    if (!vehicle) {

      return res.status(400).json({
        success: false,
        available: false,
        message: "Vehicle unavailable"
      });
    }

    // pickup
    const pickup = dayjs(pickup_datetime);
    if (!pickup.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid datetime"
      });
    }

    let drop;
    // HOURLY
    if (booking_type === "HOURLY") {
      drop = pickup.add(8, "hour");
    }
    else if (booking_type === "DAILY") {
      if (!days || Number(days) < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid days"
        });
      }
      drop = pickup.add(Number(days),"day");
    }
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid booking type"
      });
    }

    // overlap check
    const [overlapRows] = await db.query(`
      SELECT id
      FROM bookings
      WHERE vehicle_id = ?
        AND status IN (
          'PENDING',
          'CONFIRMED',
          'READY_TO_DELIVER'
        )
        AND (
          start_datetime < ?
          AND end_datetime > ?
        )
      LIMIT 1
    `, [vehicle_id, drop.format("YYYY-MM-DD HH:mm:ss"), pickup.format("YYYY-MM-DD HH:mm:ss") ]);
    const overlap = overlapRows[0];
    if (overlap) {

      return res.json({
        success: true,
        available: false,
        message: "Vehicle already booked"
      });
    }

    res.json({
      success: true,
      available: true,
      pickup:
        pickup.format(
          "YYYY-MM-DD HH:mm:ss"
        ),
      drop:
        drop.format(
          "YYYY-MM-DD HH:mm:ss"
        )
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// =====================================
// GET MY BOOKINGS
// =====================================
exports.getMyBookings=async(req,res)=>{

  try{

    const bookingUserId=req.user.id;

    const [bookings]=await db.query(`
      SELECT
        b.id,
        b.booking_type,
        b.start_datetime,
        b.end_datetime,
        b.total_days,
        b.total_price,
        b.driver_name,
        b.phone_number,
        b.status,
        b.created_at,
        v.id as vehicle_id,
        v.vehicle_number,
        v.brand,
        v.pickup_address,
        v.model_name,
        v.hourly_price,
        v.daily_price,
        v.pickup_map_link
      FROM bookings b
      JOIN vehicles v
        ON b.vehicle_id=v.id
      WHERE b.booking_user_id=?
      ORDER BY b.created_at DESC
    `,[bookingUserId]);

    res.json({
      success:true,
      data:bookings
    });

  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};
exports.getl_b_phone_name=async(req,res)=>{

  try{
    const bookingUserId=req.user.id;
    const [bookings]=await db.query(`
      SELECT 
      name as driver_name, phone_number as phone_no
      FROM booking_users where id =?;
      `,[bookingUserId]);

    res.json({
      success:true,
      data:bookings
    });

  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

// =====================================
// GET PARTICULAR BOOKING
// =====================================
exports.getPerticularBooking = async (req, res) => {

  try {

    const bookingId = req.params.id;

    const bookingUserId = req.user.id;

    const [rows] = await db.query(`

      SELECT 
        b.id as booking_id, 
        b.booking_type,
        b.start_datetime, b.end_datetime,
        b.total_days, b.total_price,
        b.driver_name,
        b.aadhar_url, b.license_url,
        b.status, b.created_at,

        v.id as vehicle_id,
        v.vehicle_number,
        v.brand, v.model_name,
        v.hourly_price, v.daily_price,
        v.pickup_address,v.pickup_map_link,

        o.id as owner_id,
        o.name as owner_name,
        o.phone_number

      FROM bookings b

      JOIN vehicles v
        ON b.vehicle_id = v.id

      JOIN users o
        ON v.owner_id = o.id

      WHERE
        b.id = ?
        AND b.booking_user_id = ?

      LIMIT 1

    `, [bookingId, bookingUserId]);

    const booking = rows[0];

    if (!booking) {

      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


exports.getVehicleAvailability =
  async (req, res) => {

    const vehicleId =
      req.params.id;

    try {

      const dates = [];

      for (let i = 0; i < 5; i++) {

        const current =
          new Date();

        current.setDate(
          current.getDate() + i
        );

        const start =
          new Date(current);

        start.setHours(0,0,0,0);

        const end =
          new Date(current);

        end.setHours(
          23,59,59,999
        );

        const [rows] =
          await db.query(
            `
            SELECT id
            FROM bookings
            WHERE vehicle_id = ?
            AND status IN (
              'PENDING',
              'CONFIRMED'
            )
            AND start_datetime <= ?
            AND end_datetime >= ?
            LIMIT 1
            `,
            [
              vehicleId,
              end,
              start
            ]
          );

        dates.push({

          day:
            current.toLocaleDateString(
              "en-IN",
              {
                weekday: "short",
              }
            ),

          date:
            current.getDate(),

          booked:
            rows.length > 0,

        });

      }

      res.json({
        success: true,
        data: dates,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

};