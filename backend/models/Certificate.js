const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    holderName: {
      type: String,
      required: [true, 'Candidate full name is required'],
      trim: true
    },
    program: {
      type: String,
      default: 'Internship Program',
      trim: true
    },
    domain: {
      type: String,
      required: [true, 'Internship domain is required'],
      trim: true
    },
    duration: {
      type: String,
      trim: true,
      default: '1 Month'
    },
    startDate: {
      type: Date
    },
    completionDate: {
      type: Date
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
      default: Date.now
    },
    qrEnabled: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['valid', 'revoked'],
      default: 'valid',
      index: true
    },
    revokedAt: {
      type: Date,
      default: null
    },
    revokedReason: {
      type: String,
      trim: true,
      default: ''
    },
    signatoryDesignation: {
      type: String,
      default: 'Authorized Signatory',
      trim: true
    },
    // Idempotency key to safely retry requests without creating duplicates
    clientRequestId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
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

// Method to format public verification response safely (never expose internal DB details)
certificateSchema.methods.toPublicJSON = function () {
  return {
    certificateId: this.certificateId,
    holderName: this.holderName,
    domain: this.domain,
    duration: this.duration,
    startDate: this.startDate ? this.startDate.toISOString().split('T')[0] : '',
    completionDate: this.completionDate ? this.completionDate.toISOString().split('T')[0] : '',
    issueDate: this.issueDate ? this.issueDate.toISOString().split('T')[0] : ''
  };
};

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
