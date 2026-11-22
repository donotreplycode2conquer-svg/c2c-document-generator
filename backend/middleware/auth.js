const jwt = require('jsonwebtoken');
const config = require('../config/env');

const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or malformed administrator authentication token.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.admin = {
      username: decoded.username,
      role: decoded.role || 'administrator'
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Administrator session token has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid authentication token.'
    });
  }
};

module.exports = {
  requireAdminAuth
};
