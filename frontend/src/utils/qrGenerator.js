import QRCode from 'qrcode';

/**
 * Official Code2Conquer Certificate Verification Portal URL
 */
export const OFFICIAL_VERIFICATION_PORTAL_URL = 'https://c2c-verification-portal.vercel.app';

/**
 * Resolves and sanitizes the official verification portal base URL.
 * Strictly prioritizes VITE_VERIFICATION_PORTAL_URL from environment variables,
 * rejects obsolete/random/unrelated legacy domains (such as code2conquer.com or localhost),
 * and enforces HTTPS at all times.
 *
 * @param {string} [configuredUrl] - Optional URL passed from settings
 * @returns {string} Sanitized HTTPS base URL (e.g. "https://c2c-verification-portal.vercel.app")
 */
export const getVerificationBaseUrl = (configuredUrl) => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_VERIFICATION_PORTAL_URL
    : undefined;

  // Prioritize VITE_VERIFICATION_PORTAL_URL, fallback to configuredUrl or official default
  let url = (envUrl && envUrl.trim()) || (configuredUrl && configuredUrl.trim()) || OFFICIAL_VERIFICATION_PORTAL_URL;

  if (typeof url !== 'string' || !url.trim()) {
    url = OFFICIAL_VERIFICATION_PORTAL_URL;
  }
  url = url.trim();

  // Guard against random, third-party, localhost, or obsolete placeholder domains
  if (
    url.includes('code2conquer.com') ||
    url.includes('verify.code2conquer.com') ||
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    !url.includes('c2c-verification-portal.vercel.app')
  ) {
    if (envUrl && envUrl.includes('c2c-verification-portal.vercel.app')) {
      url = envUrl.trim();
    } else {
      url = OFFICIAL_VERIFICATION_PORTAL_URL;
    }
  }

  // Enforce HTTPS
  if (url.startsWith('http://')) {
    url = url.replace(/^http:\/\//i, 'https://');
  } else if (!url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Remove trailing slashes
  return url.replace(/\/+$/, '');
};

/**
 * Generates high-resolution QR Code Data URL locally
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
 * Format: https://c2c-verification-portal.vercel.app/verify/<CERTIFICATE_ID>
 * Safe URL encoding of certificate ID
 *
 * @param {string} certificateId - e.g. "C2C-2026-WD-35034"
 * @param {string} [baseUrl] - Optional base URL
 * @returns {string} e.g. "https://c2c-verification-portal.vercel.app/verify/C2C-2026-WD-35034"
 */
export const buildVerificationUrl = (certificateId, baseUrl) => {
  if (!certificateId) return '';
  const cleanBase = getVerificationBaseUrl(baseUrl);
  const cleanId = encodeURIComponent(String(certificateId).trim());
  return `${cleanBase}/verify/${cleanId}`;
};

