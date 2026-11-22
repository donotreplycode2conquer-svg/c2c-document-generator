const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

/**
 * Atomically increments and retrieves the next sequence number for a given counter key.
 * @param {string} counterKey e.g. 'cert_2026' or 'offer_2026'
 * @returns {Promise<number>} The newly incremented sequence number
 */
counterSchema.statics.getNextSequence = async function (counterKey) {
  const counter = await this.findByIdAndUpdate(
    counterKey,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

/**
 * Returns current sequence value without incrementing (for preview).
 * @param {string} counterKey
 * @returns {Promise<number>} Current sequence number (or 0 if not yet set)
 */
counterSchema.statics.getCurrentSequence = async function (counterKey) {
  const counter = await this.findById(counterKey);
  return counter ? counter.seq : 0;
};

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
