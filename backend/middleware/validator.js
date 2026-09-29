function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    const target = req.method === 'GET' ? req.query : req.body;

    for (const [field, rules] of Object.entries(schema)) {
      const val = target[field];

      if (rules.required && (val === undefined || val === null || val === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (val !== undefined && val !== null && val !== '') {
        if (rules.type === 'number' && isNaN(Number(val))) {
          errors.push(`${field} must be a number`);
        }
        if (rules.type === 'string' && typeof val !== 'string') {
          errors.push(`${field} must be a string`);
        }
        if (rules.enum && !rules.enum.includes(val)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }
        if (rules.minLength && String(val).length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
}

module.exports = { validate };
