const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {


  console.log("Cookies:", req.cookies);
  console.log("Auth Header:", req.headers.authorization);

  let token = null;

  // Authorization header
  if (req.headers.authorization) {
    token =req.headers.authorization.split(" ")[1];
  }

  // ONLY admin/owner token
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }
   console.log("Resolved Token:", token);

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