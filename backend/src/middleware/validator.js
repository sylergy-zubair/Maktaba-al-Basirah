import Joi from 'joi';
import { ValidationError } from '../utils/errors.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.reduce((acc, detail) => {
        acc[detail.path.join('.')] = detail.message;
        return acc;
      }, {});

      throw new ValidationError('Validation failed', details);
    }

    req.validated = value;
    next();
  };
};

