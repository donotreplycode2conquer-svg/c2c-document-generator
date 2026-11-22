const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const logger = require('../utils/logger');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Validate username
    if (username !== config.adminUsername) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    // Validate password: either compare with hash if supplied, or direct constant-time check with adminPassword
    let isMatch = false;
    if (config.adminPasswordHash) {
      isMatch = await bcrypt.compare(password, config.adminPasswordHash);
    } else {
      isMatch = (password === config.adminPassword);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        username: config.adminUsername,
        role: 'administrator'
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        username: config.adminUsername,
        role: 'administrator'
      }
    });
  } catch (err) {
    logger.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: {
      username: req.admin.username,
      role: req.admin.role
    }
  });
};

module.exports = {
  login,
  getMe
};
