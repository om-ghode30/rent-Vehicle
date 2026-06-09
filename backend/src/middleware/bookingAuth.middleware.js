const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  let token = null;

  // ONLY booking user token
  if (req.cookies?.booking_token) {

    token = req.cookies.booking_token;

  }

  if (!token) {

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });

  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });

  }

};