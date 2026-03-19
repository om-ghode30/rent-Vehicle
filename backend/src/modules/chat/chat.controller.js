exports.sendMessage = (req, res) => {

  const userId = req.user.id;
  const role = req.user.role;
  const io = req.app.get("io");
  const { booking_id, message } = req.body;

  if (!booking_id || !message) {
    return res.status(400).json({
      success: false,
      message: "Booking ID and message required"
    });
  }
try {
  // Check user is part of this booking
  const booking = db.prepare(`
    SELECT b.id, b.user_id, v.owner_id
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.id = ?
  `).get(booking_id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  const isAllowed =
    (role === "USER" && booking.user_id === userId) ||
    (role === "OWNER" && booking.owner_id === userId) ||
    (role === "ADMIN");

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message: "Not allowed in this chat"
    });
  }

  db.prepare(`
    INSERT INTO chat_messages (booking_id, sender_role, message)
    VALUES (?, ?, ?)
  `).run(booking_id, role, message);
  io.to(`booking_${booking_id}`).emit("receiveMessage", {
  booking_id,
  message,
  sender_role: role
});

  res.json({
    success: true,
    message: "Message sent"
  });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }

};

exports.getMessages = (req, res) => {

  const bookingId = req.params.bookingId;
  const userId = req.user.id;
  const role = req.user.role;
try{
  // Check access
  const booking = db.prepare(`
    SELECT b.user_id, v.owner_id
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.id = ?
  `).get(bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found"
    });
  }

  const isAllowed =
    (role === "USER" && booking.user_id === userId) ||
    (role === "OWNER" && booking.owner_id === userId) ||
    (role === "ADMIN");

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message: "Not allowed"
    });
  }

  const messages = db.prepare(`
    SELECT 
      id,
      sender_role,
      message,
      created_at
    FROM chat_messages
    WHERE booking_id = ?
    ORDER BY created_at ASC
  `).all(bookingId);

  res.json({
    success: true,
    data: messages
  });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch message"
    });
  }
};