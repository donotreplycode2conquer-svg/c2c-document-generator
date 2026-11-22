const Certificate = require('../models/Certificate');
const { getDbStatus } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Public Certificate Verification Endpoint
 * GET /api/certificates/verify/:certificateId
 * Consumed by the separate public verification website.
 * Read-only, rate-limited, strictly sanitizes output to exclude all internal/administrative metadata.
 */
const verifyCertificate = async (req, res) => {
  try {
    const rawCertificateId = req.params.certificateId;
    if (!rawCertificateId) {
      return res.status(400).json({
        status: 'NOT_FOUND'
      });
    }

    const certificateId = rawCertificateId.trim().toUpperCase();

    // Check DB status
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      // In production or during maintenance, if DB is unreachable
      logger.warn(`Verification lookup for ${certificateId} failed due to disconnected database.`);
      return res.status(503).json({
        status: 'SERVICE_UNAVAILABLE',
        message: 'Verification service is temporarily unavailable. Please retry in a few moments.'
      });
    }

    const certificate = await Certificate.findOne({ certificateId }).lean();

    if (!certificate) {
      return res.status(404).json({
        status: 'NOT_FOUND'
      });
    }

    // Check if certificate has been revoked
    if (certificate.status === 'revoked') {
      return res.status(200).json({
        status: 'REVOKED',
        certificateId: certificate.certificateId
      });
    }

    // If valid, return only approved public fields
    const safePublicCertificate = {
      certificateId: certificate.certificateId,
      holderName: certificate.holderName,
      program: certificate.program || 'Code2Conquer Internship Program',
      domain: certificate.domain,
      duration: certificate.duration,
      startDate: certificate.startDate ? new Date(certificate.startDate).toISOString().split('T')[0] : '',
      completionDate: certificate.completionDate ? new Date(certificate.completionDate).toISOString().split('T')[0] : '',
      issueDate: certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : ''
    };

    return res.status(200).json({
      status: 'VALID',
      certificate: safePublicCertificate
    });
  } catch (err) {
    logger.error('Error during public certificate verification:', err);
    return res.status(500).json({
      status: 'ERROR',
      message: 'An unexpected error occurred while verifying the certificate.'
    });
  }
};

module.exports = {
  verifyCertificate
};
