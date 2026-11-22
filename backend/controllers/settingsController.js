const Settings = require('../models/Settings');
const { getDbStatus, connectDB } = require('../config/db');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Get system settings
 * GET /api/admin/settings
 */
const getSettings = async (req, res) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.connected) {
    return res.json({
      success: true,
      settings: {
        companyName: 'Code2Conquer',
        companyEmail: 'donotreply.code2conquer@gmail.com',
        companyPhone: '',
        companyAddress: '',
        companyWebsite: '',
        authorizedSignatoryDesignation: 'Authorised Signatory',
        verificationBaseUrl: config.publicVerifyBaseUrl,
        defaultCertificateDesign: 'navy-blue',
        defaultOfferLetterDesign: 'corporate-classic',
        companyLogoBase64: '',
        signatureImageBase64: ''
      },
      isOffline: true
    });
  }

  try {
    const settings = await Settings.getSingleton();
    // Sanitize verificationBaseUrl in case legacy or random domain was stored in DB
    if (
      !settings.verificationBaseUrl ||
      settings.verificationBaseUrl.includes('code2conquer.com') ||
      !settings.verificationBaseUrl.includes('c2c-verification-portal.vercel.app')
    ) {
      settings.verificationBaseUrl = config.publicVerifyBaseUrl;
    }
    return res.json({
      success: true,
      settings
    });
  } catch (err) {
    logger.error('Error fetching settings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch settings: ' + err.message
    });
  }
};

/**
 * Update system settings
 * PUT /api/admin/settings
 */
const updateSettings = async (req, res) => {
  const dbStatus = getDbStatus();
  if (!dbStatus.connected) {
    return res.status(503).json({
      success: false,
      message: 'Database is offline. Settings cannot be persisted to database while disconnected.'
    });
  }

  try {
    const updateData = req.body;
    // Don't allow key or _id changes
    delete updateData.key;
    delete updateData._id;

    // Sanitize verificationBaseUrl to prevent saving obsolete or random domains
    if (
      updateData.verificationBaseUrl &&
      (updateData.verificationBaseUrl.includes('code2conquer.com') ||
        !updateData.verificationBaseUrl.includes('c2c-verification-portal.vercel.app'))
    ) {
      updateData.verificationBaseUrl = config.publicVerifyBaseUrl;
    }

    const settings = await Settings.findOneAndUpdate(
      { key: 'global_settings' },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: 'Settings updated successfully.',
      settings
    });
  } catch (err) {
    logger.error('Error updating settings:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings: ' + err.message
    });
  }
};

/**
 * Re-trigger database connection attempt or test ping
 * POST /api/admin/settings/test-db
 */
const testDbConnection = async (req, res) => {
  try {
    const connected = await connectDB();
    const dbStatus = getDbStatus();
    return res.json({
      success: connected,
      dbStatus,
      message: connected
        ? 'Successfully established connection to MongoDB!'
        : 'Could not connect to MongoDB. Please check your MONGODB_URI connection string and IP whitelist.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database test error: ' + err.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  testDbConnection
};
