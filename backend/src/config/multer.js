const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 5MB limit
const MAX_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/temp/");
  },
  filename: function (req, file, cb) {
    // const ownerId = req.user?.id || "temp";
    // const uniqueName =
    //   ownerId +
    //   "-" +
    //   Date.now() +
    //   "-" +
    //   Math.floor(Math.random() * 100000) +
    //   path.extname(file.originalname);

    // cb(null, uniqueName);
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("Only JPG, PNG, and PDF files allowed"));
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
});

module.exports = upload;