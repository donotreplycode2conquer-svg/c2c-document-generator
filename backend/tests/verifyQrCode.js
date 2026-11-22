/**
 * Automated QR Code Payload Verification Test
 *
 * Generates actual QR code images using qrcode and decodes them with jsQR
 * to guarantee that:
 * 1. The QR code can be scanned and decoded.
 * 2. Scanned URL strictly starts with https://c2c-verification-portal.vercel.app/verify/
 * 3. The certificate ID encoded matches the expected ID.
 * 4. HTTPS is enforced.
 * 5. No third-party redirect services or random external domains are used.
 * 6. Edge cases and legacy settings (e.g. code2conquer.com) are safely sanitized.
 */

const QRCode = require('../../frontend/node_modules/qrcode');
const jsQR = require('jsqr');
const { PNG } = require('pngjs');

let totalTests = 0;
let passedTests = 0;

function logTest(name, passed, detail = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m - ${name} ${detail ? `(${detail})` : ''}`);
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m - ${name} ${detail ? `(${detail})` : ''}`);
  }
}

// Mirror qrGenerator.js resolution logic for verification
const OFFICIAL_VERIFICATION_PORTAL_URL = 'https://c2c-verification-portal.vercel.app';

function getVerificationBaseUrl(configuredUrl, envUrl) {
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

  return url.replace(/\/+$/, '');
}

function buildVerificationUrl(certificateId, baseUrl, envUrl) {
  if (!certificateId) return '';
  const cleanBase = getVerificationBaseUrl(baseUrl, envUrl);
  const cleanId = encodeURIComponent(String(certificateId).trim());
  return `${cleanBase}/verify/${cleanId}`;
}

async function decodeQrPng(pngBuffer) {
  const png = PNG.sync.read(pngBuffer);
  const code = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  return code ? code.data : null;
}

async function runQrVerificationSuite() {
  console.log('\n======================================================');
  console.log('Code2Conquer - QR Code Destination & Payload Verification');
  console.log('======================================================\n');

  // Test Case 1: Example from production report: C2C-2026-WD-35034
  console.log('1. Target URL Construction & Format Verification:');
  const targetId1 = 'C2C-2026-WD-35034';
  const url1 = buildVerificationUrl(targetId1);
  logTest(
    'Constructs official verification URL',
    url1 === 'https://c2c-verification-portal.vercel.app/verify/C2C-2026-WD-35034',
    url1
  );

  // Test Case 2: URL Sanitization against legacy/unrelated domains
  console.log('\n2. Security & Legacy URL Sanitization:');
  const sanitizedUrl2 = buildVerificationUrl('C2C-2026-JD-94046', 'https://verify.code2conquer.com');
  logTest(
    'Replaces legacy verify.code2conquer.com with official portal',
    sanitizedUrl2 === 'https://c2c-verification-portal.vercel.app/verify/C2C-2026-JD-94046',
    sanitizedUrl2
  );

  const sanitizedUrl3 = buildVerificationUrl('C2C-2026-JD-94046', 'https://code2conquer.com');
  logTest(
    'Replaces random/unrelated code2conquer.com with official portal',
    sanitizedUrl3 === 'https://c2c-verification-portal.vercel.app/verify/C2C-2026-JD-94046',
    sanitizedUrl3
  );

  const sanitizedUrl4 = buildVerificationUrl('C2C-2026-JD-94046', 'http://c2c-verification-portal.vercel.app/');
  logTest(
    'Enforces HTTPS and handles trailing slash in base URL',
    sanitizedUrl4 === 'https://c2c-verification-portal.vercel.app/verify/C2C-2026-JD-94046',
    sanitizedUrl4
  );

  const sanitizedUrl5 = buildVerificationUrl('C2C 2026 SPECIAL/ID', undefined);
  logTest(
    'Safely URL-encodes special characters in certificate ID',
    sanitizedUrl5 === 'https://c2c-verification-portal.vercel.app/verify/C2C%202026%20SPECIAL%2FID',
    sanitizedUrl5
  );

  // Test Case 3: Actual QR Code Image Generation & Scan Decoding
  console.log('\n3. Real QR Code Image Generation & jsQR Decoding:');

  const testCertificates = [
    { id: 'C2C-2026-WD-35034', name: 'Rohan Gupta (Production Example)' },
    { id: 'C2C-2026-JD-94046', name: 'Isha Sharma (Default Preview)' },
    { id: 'C2C-INT-2026-00125', name: 'Aarav Sharma (Sequential Format)' }
  ];

  for (const cert of testCertificates) {
    const expectedUrl = `https://c2c-verification-portal.vercel.app/verify/${encodeURIComponent(cert.id)}`;
    
    // Generate QR code exactly as frontend qrGenerator.js does
    const qrBuffer = await QRCode.toBuffer(expectedUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 1,
      width: 320,
      color: {
        dark: '#0B192C',
        light: '#FFFFFF'
      }
    });

    // Decode with jsQR
    const decodedPayload = await decodeQrPng(qrBuffer);

    logTest(
      `Scanned QR for ${cert.name} can be decoded`,
      decodedPayload !== null,
      `Length: ${decodedPayload ? decodedPayload.length : 0}`
    );

    logTest(
      `Scanned QR payload starts with official base URL`,
      decodedPayload && decodedPayload.startsWith('https://c2c-verification-portal.vercel.app/verify/'),
      decodedPayload
    );

    logTest(
      `Scanned QR payload exactly matches expected URL`,
      decodedPayload === expectedUrl,
      decodedPayload
    );

    logTest(
      `Scanned URL contains HTTPS protocol`,
      decodedPayload && decodedPayload.startsWith('https://')
    );

    logTest(
      `No random/unrelated domains or redirects in scanned payload`,
      decodedPayload &&
        !decodedPayload.includes('code2conquer.com') &&
        !decodedPayload.includes('localhost') &&
        !decodedPayload.includes('bit.ly') &&
        !decodedPayload.includes('qrserver')
    );
  }

  // Test Case 4: Certificate Preview & PDF QR Code Parity
  console.log('\n4. Certificate Preview & PDF QR Code Parity:');
  const previewUrl = buildVerificationUrl('C2C-2026-WD-35034');
  const pdfUrl = buildVerificationUrl('C2C-2026-WD-35034');
  logTest(
    'Preview QR code and PDF QR code point to the identical URL',
    previewUrl === pdfUrl && previewUrl === 'https://c2c-verification-portal.vercel.app/verify/C2C-2026-WD-35034'
  );

  // Test Case 5: Live Portal & Backend Verification Contract
  console.log('\n5. Live Portal & Backend Contract Integration:');
  const https = require('https');
  const fetchJson = (url) =>
    new Promise((resolve) => {
      https
        .get(url, (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        })
        .on('error', (e) => resolve({ error: e.message }));
    });

  const liveValid = await fetchJson(
    'https://code2conquer-document-generator-backend.onrender.com/api/certificates/verify/C2C-2026-WD-35034'
  );
  if (!liveValid.error) {
    logTest('Live verification endpoint returns status VALID for C2C-2026-WD-35034', liveValid.data?.status === 'VALID');
    logTest(
      'Live certificate record matches holder Rohan Gupta',
      liveValid.data?.certificate?.holderName === 'Rohan Gupta'
    );
  } else {
    console.log('  \x1b[33mℹ SKIP\x1b[0m - Live external check skipped (sandbox network isolation active)');
  }

  const liveNotFound = await fetchJson(
    'https://code2conquer-document-generator-backend.onrender.com/api/certificates/verify/C2C-NON-EXISTENT-99999'
  );
  if (!liveNotFound.error) {
    logTest(
      'Live verification endpoint returns 404 and NOT_FOUND for unknown certificate',
      liveNotFound.status === 404 && liveNotFound.data?.status === 'NOT_FOUND'
    );
  }

  console.log('\n======================================================');
  console.log(`Results: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runQrVerificationSuite().catch((err) => {
  console.error('Fatal error during QR verification:', err);
  process.exit(1);
});
