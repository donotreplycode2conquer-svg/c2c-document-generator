const Counter = require('../models/Counter');
const Certificate = require('../models/Certificate');
const DocumentHistory = require('../models/DocumentHistory');
const logger = require('../utils/logger');

/**
 * Generates an atomic, collision-free Certificate ID formatted as C2C-INT-YYYY-XXXXX
 * Concurrency-safe: uses MongoDB $inc atomic counter and verifies against existing records.
 */
const getNextCertificateId = async (customYear = null) => {
  const year = customYear || new Date().getFullYear();
  const counterKey = `cert_${year}`;

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    const seq = await Counter.getNextSequence(counterKey);
    const paddedSeq = String(seq).padStart(5, '0');
    const candidateId = `C2C-INT-${year}-${paddedSeq}`;

    // Verify candidateId is not already used in Certificate collection
    const exists = await Certificate.exists({ certificateId: candidateId });
    if (!exists) {
      return candidateId;
    }
    logger.warn(`Generated ID ${candidateId} was already taken. Attempting next sequence...`);
  }

  throw new Error('Could not generate unique Certificate ID after maximum attempts.');
};

/**
 * Peeks at the next likely Certificate ID for preview without consuming sequence.
 */
const peekNextCertificateId = async (customYear = null) => {
  const year = customYear || new Date().getFullYear();
  const counterKey = `cert_${year}`;
  const currentSeq = await Counter.getCurrentSequence(counterKey);
  const nextSeq = currentSeq + 1;
  const paddedSeq = String(nextSeq).padStart(5, '0');
  return `C2C-INT-${year}-${paddedSeq}`;
};

/**
 * Generates an atomic, collision-free Offer Letter ID formatted as C2C-OFF-YYYY-XXXXX
 */
const getNextOfferLetterId = async (customYear = null) => {
  const year = customYear || new Date().getFullYear();
  const counterKey = `offer_${year}`;

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    const seq = await Counter.getNextSequence(counterKey);
    const paddedSeq = String(seq).padStart(5, '0');
    const candidateId = `C2C-OFF-${year}-${paddedSeq}`;

    const exists = await DocumentHistory.exists({ documentId: candidateId });
    if (!exists) {
      return candidateId;
    }
  }

  throw new Error('Could not generate unique Offer Letter ID after maximum attempts.');
};

/**
 * Peeks at the next Offer Letter ID for preview.
 */
const peekNextOfferLetterId = async (customYear = null) => {
  const year = customYear || new Date().getFullYear();
  const counterKey = `offer_${year}`;
  const currentSeq = await Counter.getCurrentSequence(counterKey);
  const nextSeq = currentSeq + 1;
  const paddedSeq = String(nextSeq).padStart(5, '0');
  return `C2C-OFF-${year}-${paddedSeq}`;
};

module.exports = {
  getNextCertificateId,
  peekNextCertificateId,
  getNextOfferLetterId,
  peekNextOfferLetterId
};
