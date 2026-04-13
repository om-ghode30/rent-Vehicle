require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

// 🔥 Catch hidden crashes
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err);
});

const initDatabase = require("./src/config/initDb");

const app = express();
const server = http.createServer(app);

console.log("🚀 Starting Server...");
console.log("🌍 ENV PORT:", process.env.PORT);

// ✅ FIXED CORS (IMPORTANT)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://rent-vehicle-nine.vercel.app"
  ],
  credentials: true
}));

// 🔥 Request logger (VERY IMPORTANT)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// 🔥 Socket setup
const io = new Server(server, {
  cors: {
     origin: [
    "http://localhost:5173",
    "https://rent-vehicle-nine.vercel.app"
  ],
    credentials: true
  }
});

app.set("io", io);

// 🔥 Socket logic
const chatSocket = require("./src/socket/chat.socket");
chatSocket(io);

// 🔥 DB Init with logging
(async () => {
  try {
    console.log("📦 Connecting to Database...");
    await initDatabase();
    console.log("✅ Database Ready");
  } catch (err) {
    console.error("❌ DB ERROR:", err);
  }
})();

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

// ✅ Health check route (IMPORTANT for Railway)
app.get("/", (req, res) => {
  res.status(200).send("✅ Vehicle Rental API Running");
});

// Error handler
app.use(errorMiddleware);

// ✅ Railway PORT FIX (CRITICAL)
const PORT = process.env.PORT;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});