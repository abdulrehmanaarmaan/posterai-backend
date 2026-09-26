import rateLimit from 'express-rate-limit';

// express-rate-limit's NodeNext type declarations have the same CJS/ESM
// default-export mismatch as helmet — this is callable at runtime.
const createRateLimiter = rateLimit as unknown as typeof import('express-rate-limit').default;

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication requests. Please try again later.',
    error: {
      code: 'RATE_LIMITED'
    }
  }
});

export const posterGenerationRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many poster generation requests. Please try again later.',
    error: {
      code: 'RATE_LIMITED'
    }
  }
});