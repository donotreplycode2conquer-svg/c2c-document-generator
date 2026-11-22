const express = require('express');
const cors = require('cors');
const router = express.Router();
const publicVerificationController = require('../controllers/publicVerificationController');
const { publicVerifyLimiter } = require('../middleware/rateLimiter');

// Open CORS for public read-only verification endpoint (allows Vercel portal and third-party verification)
const publicCors = cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
});

router.options('/verify/:certificateId', publicCors);
router.get('/verify/:certificateId', publicCors, publicVerifyLimiter, publicVerificationController.verifyCertificate);

module.exports = router;
