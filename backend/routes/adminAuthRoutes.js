const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAdminAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validator');
const { loginSchema } = require('../utils/schemas');

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', requireAdminAuth, authController.getMe);

module.exports = router;
