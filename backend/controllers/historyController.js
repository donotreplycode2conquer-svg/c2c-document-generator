const DocumentHistory = require('../models/DocumentHistory');
const { getNextOfferLetterId, peekNextOfferLetterId } = require('../services/idGeneratorService');
const { getDbStatus } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Record a generated offer letter in document history
 * POST /api/admin/offer-letters
 */
const recordOfferLetter = async (req, res) => {
  try {
    const {
      candidateName,
      domain,
      duration,
      startDate,
      endDate,
      issueDate,
      signatoryDesignation = 'Authorized Signatory',
      customOfferId,
      metadata = {}
    } = req.body;

    let offerLetterId = customOfferId ? customOfferId.trim().toUpperCase() : null;

    if (!offerLetterId) {
      const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();
      offerLetterId = await getNextOfferLetterId(year);
    }

    const dbStatus = getDbStatus();
    let historyEntry = null;

    // Save to DocumentHistory in database if connected
    if (dbStatus.connected) {
      historyEntry = await DocumentHistory.create({
        documentId: offerLetterId,
        documentType: 'OFFER_LETTER',
        candidateName: candidateName.trim(),
        domain: domain.trim(),
        duration: duration.trim(),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        qrEnabled: false,
        status: 'VALID',
        signatoryDesignation: signatoryDesignation.trim(),
        metadata
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Offer letter recorded successfully.',
      documentId: offerLetterId,
      historyEntry
    });
  } catch (err) {
    logger.error('Error recording offer letter:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record offer letter: ' + err.message
    });
  }
};

/**
 * Get preview of next Offer Letter ID
 * GET /api/admin/offer-letters/next-id
 */
const getNextOfferIdPreview = async (req, res) => {
  try {
    const nextOfferId = await peekNextOfferLetterId();
    return res.json({
      success: true,
      nextOfferId
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get next offer letter ID preview: ' + err.message
    });
  }
};

/**
 * Get all document history records with pagination and filters
 * GET /api/admin/history
 */
const getDocumentHistory = async (req, res) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.connected) {
    return res.status(200).json({
      success: true,
      history: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      isOffline: true,
      message: 'Database is offline. Showing empty database history.'
    });
  }

  try {
    const {
      type = 'all', // all, OFFER_LETTER, CERTIFICATE
      search = '',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (type !== 'all') {
      query.documentType = type.toUpperCase();
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { documentId: searchRegex },
        { candidateName: searchRegex },
        { domain: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [history, total] = await Promise.all([
      DocumentHistory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DocumentHistory.countDocuments(query)
    ]);

    return res.json({
      success: true,
      history,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    logger.error('Error fetching document history:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch document history: ' + err.message
    });
  }
};

module.exports = {
  recordOfferLetter,
  getNextOfferIdPreview,
  getDocumentHistory
};
