import { Router } from 'express';
import {
  login,
  register
} from './auth.controller.js';
import {
  loginSchema,
  registerSchema
} from './auth.schema.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { authRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  asyncHandler(register)
);

router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  asyncHandler(login)
);

export default router;