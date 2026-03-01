const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const initDatabase = require("./src/config/initDb");

const commonRoutes = require("./src/modules/common/common.routes");
const ownerRoutes = require("./src/modules/owner/owner.routes");
const app = express();

app.use(cors({
  origin: "http://localhost:5173", // React frontend URL
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// Initialize DB
initDatabase();
const errorMiddleware = require("./src/middleware/error.middleware");
const publicRoutes = require("./src/modules/public/public.routes");
const adminRoutes = require("./src/modules/admin/admin.routes");
const bookingRoutes = require("./src/modules/booking/booking.routes");
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/common", commonRoutes);
app.use("/api/owner", ownerRoutes);

app.get("/", (req, res) => {
  res.send("Vehicle Rental API Running");
});
// 👇 Must be after routes
app.use(errorMiddleware);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});