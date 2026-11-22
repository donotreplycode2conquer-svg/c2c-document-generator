const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { requireAdminAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { recordOfferLetterSchema } = require('../utils/schemas');

router.use(requireAdminAuth);

// Record generated offer letter (supports POST /api/admin/offer-letters and POST /api/admin/history/offer-letters)
router.post('/', validate(recordOfferLetterSchema), historyController.recordOfferLetter);
router.post('/offer-letters', validate(recordOfferLetterSchema), historyController.recordOfferLetter);

// Preview next offer letter ID (supports GET /api/admin/offer-letters/next-id and GET /api/admin/history/offer-letters/next-id)
router.get('/next-id', historyController.getNextOfferIdPreview);
router.get('/offer-letters/next-id', historyController.getNextOfferIdPreview);

// Get document history (supports GET /api/admin/history)
router.get('/', historyController.getDocumentHistory);

module.exports = router;
