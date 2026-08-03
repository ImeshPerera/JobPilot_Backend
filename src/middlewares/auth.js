const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authenticate user by verifying JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_key");

      // Get user from the token (exclude password)
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      if (user.user_state === "Deactive") {
        return res.status(403).json({ message: "User account is deactivated" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Restrict access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user ? req.user.role : "unknown"}) is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
