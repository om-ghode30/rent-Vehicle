require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const initDatabase = require("./src/config/initDb");

const app = express();
const server = http.createServer(app);

// CORS
app.use(cors({
 
  origin: "*",
  credentials: true
}));

// Socket
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:5173",
    origin: "*",
    // origin: true,
    credentials: true
  }
});

app.set("io", io);

// 🔥 Socket logic file
const chatSocket = require("./src/socket/chat.socket");
chatSocket(io);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// DB
initDatabase();

// Routes
const errorMiddleware = require("./src/middleware/error.middleware");
const publicRoutes = require("./src/modules/public/public.routes");
const adminRoutes = require("./src/modules/admin/admin.routes");
const bookingRoutes = require("./src/modules/booking/booking.routes");
const commonRoutes = require("./src/modules/common/common.routes");
const ownerRoutes = require("./src/modules/owner/owner.routes");
const chatRoutes = require("./src/modules/chat/chat.routes");

app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/common", commonRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/chat", chatRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Vehicle Rental API Running");
});

// Error handler
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});