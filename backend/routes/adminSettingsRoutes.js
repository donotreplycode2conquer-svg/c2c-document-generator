const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAdminAuth } = require('../middleware/auth');

router.use(requireAdminAuth);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/test-db', settingsController.testDbConnection);

module.exports = router;
