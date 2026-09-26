import { Router } from 'express';

import {
  create,
  getMine,
  getOne,
  regenerate,
  remove
} from './poster.controller.js';

import {
  authenticate
} from '../../middleware/auth.middleware.js';

import {
  validateBody
} from '../../middleware/validate.middleware.js';

import {
  posterGenerationRateLimiter
} from '../../middleware/rate-limit.middleware.js';

import {
  createPosterSchema
} from './poster.schema.js';

import {
  asyncHandler
} from '../../utils/async-handler.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  posterGenerationRateLimiter,
  validateBody(createPosterSchema),
  asyncHandler(create)
);

router.get(
  '/me',
  asyncHandler(getMine)
);

router.get(
  '/:id',
  asyncHandler(getOne)
);

router.post(
  '/:id/regenerate',
  posterGenerationRateLimiter,
  asyncHandler(regenerate)
);

router.delete(
  '/:id',
  asyncHandler(remove)
);

export default router;