const Certificate = require('../models/Certificate');
const DocumentHistory = require('../models/DocumentHistory');
const {
  generateUniqueCertificateId,
  getNextCertificateId,
  peekNextCertificateId
} = require('../services/idGeneratorService');
const { getDbStatus } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Register a new certificate in MongoDB Atlas
 * POST /api/admin/certificates
 */
const registerCertificate = async (req, res) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.connected) {
    return res.status(503).json({
      success: false,
      message: 'Central database connection is offline. Certificate registration in MongoDB Atlas is required before an official certificate can be issued.',
      dbStatus
    });
  }

  try {
    const {
      holderName,
      domain,
      duration,
      startDate,
      completionDate,
      issueDate,
      qrEnabled = true,
      signatoryDesignation = 'Authorized Signatory',
      customCertificateId,
      clientRequestId
    } = req.body;

    // Idempotency check: if clientRequestId provided, check if already registered
    if (clientRequestId) {
      const existing = await Certificate.findOne({ clientRequestId });
      if (existing) {
        logger.info(`Idempotent request matched for clientRequestId: ${clientRequestId}, returning existing certificate: ${existing.certificateId}`);
        return res.status(200).json({
          success: true,
          isDuplicateSubmission: true,
          message: 'Certificate already registered with this request identifier.',
          certificate: existing
        });
      }
    }

    const year = issueDate
      ? new Date(issueDate).getFullYear()
      : (startDate ? new Date(startDate).getFullYear() : new Date().getFullYear());

    let requestedId = customCertificateId ? customCertificateId.trim().toUpperCase() : null;

    if (requestedId) {
      // Validate format: historical C2C-YYYY-XX-XXXXX or standardized C2C-INT-YYYY-XXXXX
      const certIdRegex = /^C2C(-[A-Z0-9]+){2,5}$/i;
      if (!certIdRegex.test(requestedId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Certificate ID format. Format must match: C2C-INT-YYYY-XXXXX (e.g. C2C-INT-2026-48271)'
        });
      }
    }

    // Safe certificate issuance with duplicate-key concurrency handling
    const MAX_SAVE_ATTEMPTS = 5;
    let savedCertificate = null;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_SAVE_ATTEMPTS; attempt++) {
      let candidateId;

      if (requestedId && attempt === 1) {
        // Check MongoDB Atlas code2conquer.certificates for existing matching ID
        const idExists = await Certificate.exists({ certificateId: requestedId });
        if (idExists) {
          logger.warn(`Requested certificate ID "${requestedId}" is already registered. Generating a fresh unique C2C-INT-YYYY-XXXXX ID...`);
          candidateId = await generateUniqueCertificateId(year);
          requestedId = null; // Clear so subsequent retries generate new IDs
        } else {
          candidateId = requestedId;
        }
      } else {
        candidateId = await generateUniqueCertificateId(year);
      }

      try {
        const certificate = new Certificate({
          certificateId: candidateId,
          holderName: holderName.trim(),
          program: 'Internship Program',
          domain: domain.trim(),
          duration: duration.trim(),
          startDate: startDate ? new Date(startDate) : undefined,
          completionDate: completionDate ? new Date(completionDate) : undefined,
          issueDate: issueDate ? new Date(issueDate) : new Date(),
          qrEnabled: Boolean(qrEnabled),
          status: 'valid',
          signatoryDesignation: signatoryDesignation.trim(),
          clientRequestId: clientRequestId || undefined,
          metadata: {
            registeredBy: req.admin ? req.admin.username : 'admin',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
          }
        });

        savedCertificate = await certificate.save();
        break; // Successfully saved into MongoDB Atlas!
      } catch (saveErr) {
        lastError = saveErr;

        if (saveErr.code === 11000) {
          // Check if duplicate on clientRequestId (idempotency key for double-clicks)
          if (
            saveErr.keyPattern?.clientRequestId ||
            (saveErr.message && saveErr.message.includes('clientRequestId'))
          ) {
            const existing = await Certificate.findOne({ clientRequestId });
            if (existing) {
              return res.status(200).json({
                success: true,
                isDuplicateSubmission: true,
                message: 'Certificate already registered with this request identifier.',
                certificate: existing
              });
            }
          }

          // Duplicate key on certificateId: log and retry with a new unique random 5-digit ID
          logger.warn(`MongoDB unique index duplicate-key collision on certificateId "${candidateId}" (attempt ${attempt}/${MAX_SAVE_ATTEMPTS}). Retrying with fresh ID...`);
          requestedId = null;
          continue;
        }

        // Rethrow any non-duplicate-key error
        throw saveErr;
      }
    }

    if (!savedCertificate) {
      throw lastError || new Error('Failed to save certificate after multiple attempts.');
    }

    // Log to DocumentHistory
    try {
      await DocumentHistory.create({
        documentId: savedCertificate.certificateId,
        documentType: 'CERTIFICATE',
        candidateName: savedCertificate.holderName,
        domain: savedCertificate.domain,
        duration: savedCertificate.duration,
        issueDate: savedCertificate.issueDate,
        startDate: savedCertificate.startDate,
        endDate: savedCertificate.completionDate,
        qrEnabled: savedCertificate.qrEnabled,
        status: 'VALID',
        signatoryDesignation: savedCertificate.signatoryDesignation
      });
    } catch (historyErr) {
      logger.warn('Failed to record certificate in DocumentHistory:', historyErr.message);
    }

    logger.info(`Successfully issued and registered Certificate: ${savedCertificate.certificateId} for ${savedCertificate.holderName}`);

    return res.status(201).json({
      success: true,
      message: 'Certificate registered successfully in central database.',
      certificate: savedCertificate
    });
  } catch (err) {
    logger.error('Error registering certificate:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to register certificate in database: ' + err.message
    });
  }
};

/**
 * Retrieve issued certificates with filtering and pagination
 * GET /api/admin/certificates
 */
const getCertificates = async (req, res) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.connected) {
    return res.status(503).json({
      success: false,
      message: 'Database is offline. Connect MongoDB to view issued certificates.',
      certificates: [],
      total: 0
    });
  }

  try {
    const {
      search = '',
      status = 'all', // all, valid, revoked
      qr = 'all',     // all, qr, non-qr
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { certificateId: searchRegex },
        { holderName: searchRegex },
        { domain: searchRegex }
      ];
    }

    if (status !== 'all') {
      query.status = status.toLowerCase();
    }

    if (qr === 'qr') {
      query.qrEnabled = true;
    } else if (qr === 'non-qr') {
      query.qrEnabled = false;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [certificates, total] = await Promise.all([
      Certificate.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Certificate.countDocuments(query)
    ]);

    return res.json({
      success: true,
      certificates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    logger.error('Error fetching certificates:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificates: ' + err.message
    });
  }
};

/**
 * Retrieve a specific certificate by ID
 * GET /api/admin/certificates/:certificateId
 */
const getCertificateById = async (req, res) => {
  try {
    const certificateId = req.params.certificateId.toUpperCase();
    const certificate = await Certificate.findOne({ certificateId }).lean();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: `Certificate with ID ${certificateId} not found.`
      });
    }

    return res.json({
      success: true,
      certificate
    });
  } catch (err) {
    logger.error('Error fetching certificate by ID:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate: ' + err.message
    });
  }
};

/**
 * Revoke an issued certificate
 * PATCH /api/admin/certificates/:certificateId/revoke
 */
const revokeCertificate = async (req, res) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.connected) {
    return res.status(503).json({
      success: false,
      message: 'Database is offline. Central database connection is required to revoke certificates.'
    });
  }

  try {
    const certificateId = req.params.certificateId.toUpperCase();
    const { reason = 'Revoked by administrator' } = req.body;

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: `Certificate with ID ${certificateId} was not found in the database.`
      });
    }

    if (certificate.status === 'revoked') {
      return res.status(400).json({
        success: false,
        message: `Certificate ${certificateId} is already marked as REVOKED.`
      });
    }

    certificate.status = 'revoked';
    certificate.revokedAt = new Date();
    certificate.revokedReason = reason.trim();
    await certificate.save();

    // Update document history
    await DocumentHistory.updateMany(
      { documentId: certificateId },
      { $set: { status: 'REVOKED' } }
    );

    logger.info(`Certificate ${certificateId} was REVOKED. Reason: ${reason}`);

    return res.json({
      success: true,
      message: `Certificate ${certificateId} has been successfully REVOKED in the central database. Public verification will immediately reflect this status.`,
      certificate
    });
  } catch (err) {
    logger.error('Error revoking certificate:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to revoke certificate: ' + err.message
    });
  }
};

/**
 * Preview next certificate ID
 * GET /api/admin/certificates/next-id
 */
const getNextIdPreview = async (req, res) => {
  try {
    const nextCertificateId = await peekNextCertificateId();
    return res.json({
      success: true,
      nextCertificateId
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate next Certificate ID: ' + err.message
    });
  }
};

module.exports = {
  registerCertificate,
  getCertificates,
  getCertificateById,
  revokeCertificate,
  getNextIdPreview
};
