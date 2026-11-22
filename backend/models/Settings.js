const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'global_settings',
      unique: true
    },
    companyName: {
      type: String,
      default: 'Code2Conquer'
    },
    companyEmail: {
      type: String,
      default: 'donotreply.code2conquer@gmail.com'
    },
    companyPhone: {
      type: String,
      default: ''
    },
    companyAddress: {
      type: String,
      default: ''
    },
    companyWebsite: {
      type: String,
      default: ''
    },
    authorizedSignatoryDesignation: {
      type: String,
      default: 'Authorised Signatory'
    },
    verificationBaseUrl: {
      type: String,
      default: 'https://c2c-verification-portal.vercel.app'
    },
    defaultCertificateDesign: {
      type: String,
      default: 'navy-gold'
    },
    defaultOfferLetterDesign: {
      type: String,
      default: 'corporate-classic'
    },
    companyLogoBase64: {
      type: String,
      default: ''
    },
    signatureImageBase64: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

/**
 * Helper to fetch or initialize default settings singleton
 */
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne({ key: 'global_settings' });
  if (!settings) {
    settings = await this.create({ key: 'global_settings' });
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
