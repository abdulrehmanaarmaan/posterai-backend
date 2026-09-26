import type { RequestHandler } from 'express';
import { AppError } from '../utils/app-error.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticate: RequestHandler = (
  req,
  _res,
  next
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return next(
      new AppError(
        401,
        'Authentication required.',
        'UNAUTHORIZED'
      )
    );
  }

  const token = authorization.split(' ')[1];

  try {
    const payload = verifyToken(token);

    req.user = payload;

    next();
  } catch {
    next(
      new AppError(
        401,
        'Invalid or expired token.',
        'INVALID_TOKEN'
      )
    );
  }
};