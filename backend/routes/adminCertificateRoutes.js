const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { requireAdminAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { registerCertificateSchema, revokeCertificateSchema } = require('../utils/schemas');

// All routes here require administrator authentication
router.use(requireAdminAuth);

// Get next ID preview
router.get('/next-id', certificateController.getNextIdPreview);

// Register a new certificate
router.post('/', validate(registerCertificateSchema), certificateController.registerCertificate);

// Retrieve issued certificates (with search and filters)
router.get('/', certificateController.getCertificates);

// Retrieve a specific certificate by ID
router.get('/:certificateId', certificateController.getCertificateById);

// Revoke a certificate
router.patch('/:certificateId/revoke', validate(revokeCertificateSchema), certificateController.revokeCertificate);

module.exports = router;
