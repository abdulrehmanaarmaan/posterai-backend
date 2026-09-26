import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/app-error.js';

export const validateBody = (
  schema: ZodType
): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError(
          400,
          'Validation failed.',
          'VALIDATION_ERROR'
        )
      );
    }

    req.body = result.data;

    next();
  };
};