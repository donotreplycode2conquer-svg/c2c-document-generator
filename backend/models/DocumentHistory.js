const mongoose = require('mongoose');

const documentHistorySchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    documentType: {
      type: String,
      enum: ['OFFER_LETTER', 'CERTIFICATE'],
      required: true,
      index: true
    },
    candidateName: {
      type: String,
      required: true,
      trim: true
    },
    domain: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    qrEnabled: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: 'VALID'
    },
    signatoryDesignation: {
      type: String,
      default: 'Authorized Signatory'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const DocumentHistory = mongoose.model('DocumentHistory', documentHistorySchema);

module.exports = DocumentHistory;
