const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
let token = null;

  if (req.headers.authorization) {
    console.log("AUTH HEADER:", req.headers.authorization);
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  console.log("TOKEN RECEIVED:", token);
  console.log("JWT SECRET VERIFY:", process.env.JWT_SECRET);
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};