const { z } = require('zod');

const registerCertificateSchema = z.object({
  holderName: z.string().min(2, 'Candidate full name must have at least 2 characters').max(100),
  domain: z.string().min(2, 'Internship domain is required').max(100),
  duration: z.string().min(2, 'Internship duration is required').max(50),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid start date format' }),
  completionDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid completion date format' }),
  issueDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: 'Invalid issue date format' }),
  qrEnabled: z.boolean().optional().default(true),
  signatoryDesignation: z.string().optional().default('Authorized Signatory'),
  customCertificateId: z.string().optional(),
  clientRequestId: z.string().optional()
});

const revokeCertificateSchema = z.object({
  reason: z.string().min(3, 'Revocation reason must have at least 3 characters').max(250).optional()
});

const recordOfferLetterSchema = z.object({
  candidateName: z.string().min(2, 'Candidate full name is required').max(100),
  domain: z.string().min(2, 'Internship domain is required').max(100),
  duration: z.string().min(2, 'Internship duration is required').max(50),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
  issueDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: 'Invalid issue date' }),
  signatoryDesignation: z.string().optional().default('Authorized Signatory'),
  customOfferId: z.string().optional()
});

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

module.exports = {
  registerCertificateSchema,
  revokeCertificateSchema,
  recordOfferLetterSchema,
  loginSchema
};
