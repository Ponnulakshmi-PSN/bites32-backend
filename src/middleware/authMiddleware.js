const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models');

// Verifies JWT sent in Authorization: Bearer <token>
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      return next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token invalid or expired');
    }
  }

  res.status(401);
  throw new Error('Not authorized, no token provided');
});

// Restricts a route to specific roles, e.g. authorize('admin', 'restaurant_owner')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Forbidden: insufficient permissions');
    }
    next();
  };
};

module.exports = { protect, authorize };
