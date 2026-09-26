import { Router } from 'express';
import {
  getTemplate,
  listTemplates
} from './template.controller.js';
import { asyncHandler } from '../../utils/async-handler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(listTemplates)
);

router.get(
  '/:id',
  asyncHandler(getTemplate)
);

export default router;