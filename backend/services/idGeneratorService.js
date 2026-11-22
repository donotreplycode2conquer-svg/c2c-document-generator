const crypto = require('crypto');
const Counter = require('../models/Counter');
const Certificate = require('../models/Certificate');
const DocumentHistory = require('../models/DocumentHistory');
const logger = require('../utils/logger');

/**
 * Generates a random 5-digit string between "10000" and "99999".
 * Uses crypto.randomInt for cryptographically secure pseudo-randomness.
 */
const generateRandom5Digit = () => {
  return String(crypto.randomInt(10000, 100000));
};

/**
 * Standard Certificate ID Format: C2C-INT-YYYY-XXXXX
 * 
 * Guarantee globally unique IDs:
 * 1. Generates a random 5-digit suffix (10000 to 99999).
 * 2. Constructs the complete certificate ID: C2C-INT-YYYY-XXXXX
 * 3. Checks MongoDB Atlas code2conquer.certificates for an existing matching certificate ID.
 * 4. If it already exists, generates another ID and retries.
 * 5. Handles collisions safely up to maxRetries.
 * 
 * @param {number|string} [customYear] - Issuance year (defaults to current year)
 * @param {number} [maxRetries=20] - Maximum collision retry limit
 * @returns {Promise<string>} e.g. "C2C-INT-2026-48271"
 */
const generateUniqueCertificateId = async (customYear = null, maxRetries = 20) => {
  const year = customYear || new Date().getFullYear();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const randomSuffix = generateRandom5Digit();
    const candidateId = `C2C-INT-${year}-${randomSuffix}`;

    // 3. Check MongoDB Atlas code2conquer.certificates for an existing matching certificate ID
    const certExists = await Certificate.exists({ certificateId: candidateId });
    if (certExists) {
      logger.warn(`Certificate ID collision detected on certificates collection for ${candidateId} (attempt ${attempt}/${maxRetries}). Retrying...`);
      continue;
    }

    // Secondary check against DocumentHistory
    const historyExists = await DocumentHistory.exists({ documentId: candidateId });
    if (historyExists) {
      logger.warn(`Certificate ID collision detected on history collection for ${candidateId} (attempt ${attempt}/${maxRetries}). Retrying...`);
      continue;
    }

    return candidateId;
  }

  throw new Error(`Failed to generate a globally unique Certificate ID after ${maxRetries} attempts.`);
};

/**
 * Generates an atomic, collision-free Certificate ID formatted as C2C-INT-YYYY-XXXXX
 */
const getNextCertificateId = async (customYear = null) => {
  return generateUniqueCertificateId(customYear);
};

/**
 * Peeks at the next likely Certificate ID for preview.
 */
const peekNextCertificateId = async (customYear = null) => {
  return generateUniqueCertificateId(customYear);
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
  generateUniqueCertificateId,
  generateRandom5Digit,
  getNextCertificateId,
  peekNextCertificateId,
  getNextOfferLetterId,
  peekNextOfferLetterId
};
