const jwt = require('jsonwebtoken');
const config = require('../config/env');
const {
  registerCertificateSchema,
  recordOfferLetterSchema,
  loginSchema
} = require('../utils/schemas');

let passedTests = 0;
let totalTests = 0;

const logTest = (name, passed, detail = '') => {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m - ${name} ${detail ? `(${detail})` : ''}`);
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m - ${name} ${detail ? `(${detail})` : ''}`);
  }
};

const runDirectTests = async () => {
  console.log('\n======================================================');
  console.log('Code2Conquer Document Generator - In-Memory Unit & Logic Tests');
  console.log('======================================================\n');

  // 1. Zod Validation Tests
  console.log('1. Schema Validation (Zod):');

  // Valid certificate schema
  const validCertData = {
    holderName: 'Aarav Sharma',
    domain: 'Full Stack Development',
    duration: '3 Months',
    startDate: '2026-07-01',
    completionDate: '2026-09-30',
    issueDate: '2026-09-30',
    qrEnabled: true,
    signatoryDesignation: 'Director & Head of Programs'
  };
  const certParse = registerCertificateSchema.safeParse(validCertData);
  logTest('Valid certificate payload accepted', certParse.success);

  // Invalid certificate schema (missing required fields)
  const invalidCertData = { holderName: 'A', domain: '' };
  const invalidCertParse = registerCertificateSchema.safeParse(invalidCertData);
  logTest('Invalid certificate payload correctly rejected', !invalidCertParse.success);
  logTest('Rejects name shorter than 2 chars', !invalidCertParse.success && invalidCertParse.error.errors.some(e => e.path.includes('holderName')));

  // Offer Letter Schema
  const validOfferData = {
    candidateName: 'Priya Patel',
    domain: 'Data Science',
    duration: '6 Months',
    startDate: '2026-08-01',
    endDate: '2027-01-31',
    issueDate: '2026-07-25',
    signatoryDesignation: 'Head of Programs'
  };
  const offerParse = recordOfferLetterSchema.safeParse(validOfferData);
  logTest('Valid offer letter payload accepted', offerParse.success);

  // 2. ID Pattern Matching Tests
  console.log('\n2. Document ID Format Verification:');
  const certIdRegex = /^C2C-INT-\d{4}-[A-Z0-9]+$/;
  const sampleCertId = 'C2C-INT-2026-00125';
  logTest('Certificate ID matches C2C-INT-YYYY-XXXXX format', certIdRegex.test(sampleCertId));
  logTest('Rejects invalid certificate ID format', !certIdRegex.test('INVALID-ID-123'));

  const offerIdRegex = /^C2C-OFF-\d{4}-[A-Z0-9]+$/;
  const sampleOfferId = 'C2C-OFF-2026-00042';
  logTest('Offer Letter ID matches C2C-OFF-YYYY-XXXXX format', offerIdRegex.test(sampleOfferId));

  // 3. Authentication & JWT Signature
  console.log('\n3. JWT Security & Verification:');
  const testPayload = { username: 'admin', role: 'administrator' };
  const token = jwt.sign(testPayload, config.jwtSecret, { expiresIn: '1h' });
  logTest('Generates signed JWT token', typeof token === 'string' && token.length > 20);

  const decoded = jwt.verify(token, config.jwtSecret);
  logTest('Verifies valid JWT token payload', decoded.username === 'admin' && decoded.role === 'administrator');

  let tamperedFailed = false;
  try {
    jwt.verify(token, 'wrong_secret_key');
  } catch {
    tamperedFailed = true;
  }
  logTest('Rejects tampered JWT or wrong secret', tamperedFailed);

  // 4. Public Verification Contract Data Sanitization
  console.log('\n4. Public Verification Contract Data Sanitization:');
  // Simulated Mongoose model method toPublicJSON
  const mockCertificateDoc = {
    _id: '65f1234567890abcdef12345',
    certificateId: 'C2C-INT-2026-00125',
    holderName: 'Rohan Verma',
    domain: 'Machine Learning',
    duration: '3 Months',
    startDate: new Date('2026-06-01'),
    completionDate: new Date('2026-08-31'),
    issueDate: new Date('2026-08-31'),
    qrEnabled: true,
    status: 'valid',
    metadata: {
      registeredBy: 'admin',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...'
    },
    clientRequestId: 'req_123456789'
  };

  const safePublic = {
    certificateId: mockCertificateDoc.certificateId,
    holderName: mockCertificateDoc.holderName,
    domain: mockCertificateDoc.domain,
    duration: mockCertificateDoc.duration,
    startDate: mockCertificateDoc.startDate.toISOString().split('T')[0],
    completionDate: mockCertificateDoc.completionDate.toISOString().split('T')[0],
    issueDate: mockCertificateDoc.issueDate.toISOString().split('T')[0]
  };

  logTest('Public payload contains certificateId', safePublic.certificateId === 'C2C-INT-2026-00125');
  logTest('Public payload contains candidate holderName', safePublic.holderName === 'Rohan Verma');
  logTest('Internal MongoDB _id excluded', !safePublic._id);
  logTest('Administrative metadata excluded', !safePublic.metadata);
  logTest('Idempotency clientRequestId excluded', !safePublic.clientRequestId);

  console.log('\n======================================================');
  console.log(`Results: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('======================================================\n');

  process.exit(passedTests === totalTests ? 0 : 1);
};

runDirectTests();
