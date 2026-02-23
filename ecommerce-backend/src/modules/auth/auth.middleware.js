const jwt = require("jsonwebtoken");
const AppError = require("../../common/errors/AppError");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Set tenantId from JWT if not already set by tenant middleware
    if (!req.tenantId && decoded.tenantId) {
      req.tenantId = decoded.tenantId;
    }

    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError("Invalid token", 401, "INVALID_TOKEN"));
  }
};

module.exports = { authenticate };
