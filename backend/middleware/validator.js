const { z } = require('zod');

/**
 * Higher-order middleware function to validate incoming request data against a Zod schema.
 * @param {z.ZodSchema} schema
 * @param {'body' | 'query' | 'params'} property
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[property]);
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      req[property] = result.data;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Internal error during validation'
      });
    }
  };
};

module.exports = {
  validate
};
