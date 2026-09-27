import type {
  ErrorRequestHandler
} from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';
import { env } from '../config/env.js';

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      error: {
        code: 'VALIDATION_ERROR',
        issues: error.issues
      }
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: {
        code: error.code ?? 'APP_ERROR'
      }
    });
  }

  console.error('[API ERROR]', {
    name: error instanceof Error ? error.name : undefined,
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
  });

  return res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === 'production'
        ? 'Internal server error.'
        : error instanceof Error
          ? error.message
          : 'Internal server error.',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
};