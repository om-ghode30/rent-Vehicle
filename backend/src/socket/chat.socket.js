
module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // Join booking room
    socket.on("joinBooking", (bookingId) => {
      socket.join(`booking_${bookingId}`);
      console.log(`Joined booking_${bookingId}`);
    });

    // Leave room (optional)
    socket.on("leaveBooking", (bookingId) => {
      socket.leave(`booking_${bookingId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

  });

};