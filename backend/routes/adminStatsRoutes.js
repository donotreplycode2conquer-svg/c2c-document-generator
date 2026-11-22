const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { requireAdminAuth } = require('../middleware/auth');

router.use(requireAdminAuth);

router.get('/', statsController.getDashboardStats);

module.exports = router;
