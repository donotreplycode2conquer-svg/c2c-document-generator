const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://c2c-verification-portal.vercel.app'
];

const envOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/code2conquer_docs',
  jwtSecret: process.env.ADMIN_JWT_SECRET || 'c2c_default_dev_secret_replace_in_prod',
  jwtExpiresIn: '7d',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  frontendOrigin: allowedOrigins,
  publicVerifyBaseUrl: process.env.PUBLIC_VERIFY_BASE_URL || 'https://c2c-verification-portal.vercel.app',
  isProduction: process.env.NODE_ENV === 'production'
};

module.exports = config;
