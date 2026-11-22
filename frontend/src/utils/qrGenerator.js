import QRCode from 'qrcode';

/**
 * Generates high-resolution QR Code Data URL
 * @param {string} text - URL or text to encode
 * @param {object} options - Optional styling parameters
 * @returns {Promise<string>} Base64 Data URL of the generated QR code image
 */
export const generateQrDataUrl = async (text, options = {}) => {
  if (!text) return '';

  const defaultOptions = {
    errorCorrectionLevel: 'H', // High error tolerance (up to 30% damage/distortion)
    type: 'image/png',
    quality: 1.0,
    margin: 2,
    width: 320,
    color: {
      dark: '#0A192F', // Code2Conquer Navy
      light: '#FFFFFF'
    },
    ...options
  };

  try {
    return await QRCode.toDataURL(text, defaultOptions);
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    return '';
  }
};

/**
 * Builds the standard public verification URL for a given certificate ID
 * @param {string} certificateId
 * @param {string} baseUrl
 * @returns {string} e.g. "https://verify.code2conquer.com/verify/C2C-INT-2026-00125"
 */
export const buildVerificationUrl = (certificateId, baseUrl = 'https://c2c-verification-portal.vercel.app') => {
  if (!certificateId) return '';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/verify/${encodeURIComponent(certificateId)}`;
};
