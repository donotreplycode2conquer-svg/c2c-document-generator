const Certificate = require('../models/Certificate');
const DocumentHistory = require('../models/DocumentHistory');
const { getDbStatus } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Get aggregated dashboard statistics
 * GET /api/admin/stats
 */
const getDashboardStats = async (req, res) => {
  const dbStatus = getDbStatus();

  if (!dbStatus.connected) {
    return res.json({
      success: true,
      stats: {
        totalOfferLetters: 0,
        totalCertificates: 0,
        qrCertificates: 0,
        nonQrCertificates: 0,
        revokedCertificates: 0,
        recentDocuments: []
      },
      dbStatus: {
        ...dbStatus,
        warning: 'MongoDB is currently disconnected. Configure MONGODB_URI in backend/.env to access live cloud records.'
      }
    });
  }

  try {
    const [
      totalCertificates,
      qrCertificates,
      nonQrCertificates,
      revokedCertificates,
      totalOfferLetters,
      recentDocuments
    ] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ qrEnabled: true }),
      Certificate.countDocuments({ qrEnabled: false }),
      Certificate.countDocuments({ status: 'revoked' }),
      DocumentHistory.countDocuments({ documentType: 'OFFER_LETTER' }),
      DocumentHistory.find().sort({ createdAt: -1 }).limit(10).lean()
    ]);

    return res.json({
      success: true,
      stats: {
        totalOfferLetters,
        totalCertificates,
        qrCertificates,
        nonQrCertificates,
        revokedCertificates,
        recentDocuments
      },
      dbStatus
    });
  } catch (err) {
    logger.error('Error fetching dashboard stats:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics: ' + err.message
    });
  }
};

module.exports = {
  getDashboardStats
};
