const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

let isConnected = false;
let connectionError = null;
let lastAttemptTime = null;

/**
 * Connect to MongoDB Atlas
 */
const connectDB = async () => {
  lastAttemptTime = new Date();

  if (!config.mongodbUri) {
    connectionError = 'MONGODB_URI is not set in environment variables.';
    logger.error('MongoDB URI is not configured.');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);

    const options = {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      autoIndex: true
    };

    const maskedUri = config.mongodbUri.replace(/:([^@]+)@/, ':****@');
    logger.info(`Connecting to MongoDB Atlas... (${maskedUri})`);

    await mongoose.connect(config.mongodbUri, options);
    isConnected = true;
    connectionError = null;

    console.log('MongoDB Atlas connected successfully!');
    console.log(`Database: ${mongoose.connection.name || 'code2conquer'}`);
    logger.info(`MongoDB Atlas connected successfully! Database: ${mongoose.connection.name || 'code2conquer'}`);

    return true;
  } catch (err) {
    isConnected = false;
    connectionError = err.message || 'Failed to connect to MongoDB Atlas';
    console.error('MongoDB Atlas connection failed:', err.message);
    logger.error('MongoDB Atlas connection failure:', err.message);
    return false;
  }
};

mongoose.connection.on('connected', () => {
  isConnected = true;
  connectionError = null;
  logger.info('Mongoose Atlas connection active.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  connectionError = err.message;
  logger.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB Atlas connection disconnected.');
});

const getDbStatus = () => {
  const readyState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    connected: readyState === 1,
    state: states[readyState] || 'disconnected',
    readyState,
    database: mongoose.connection.name || 'code2conquer',
    error: connectionError,
    lastAttemptTime,
    uriMasked: config.mongodbUri ? config.mongodbUri.replace(/:([^@]+)@/, ':****@') : 'Not Configured'
  };
};

module.exports = {
  connectDB,
  getDbStatus
};
