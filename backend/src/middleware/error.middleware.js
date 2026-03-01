// src/middleware/error.middleware.js

module.exports = (err, req, res, next) => {

  console.error("🔥 Error:", err);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Max size is 5MB."
    });
  }

  // Custom file type error
  if (err.message === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      message: "Only JPG, PNG, and PDF files are allowed."
    });
  }

  // SQLite UNIQUE constraint
  if (err.message && err.message.includes("UNIQUE")) {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry not allowed."
    });
  }

  // Default fallback
  return res.status(500).json({
    success: false,
    message: err.message
  });
};