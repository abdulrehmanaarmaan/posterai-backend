import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { uploadImages } from './upload.controller.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 3,
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (
    _req,
    file,
    callback
  ) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/webp'
    ) {
      callback(null, true);
      return;
    }

    callback(
      new Error(
        'Only JPEG, PNG and WebP images are allowed.'
      )
    );
  }
});

router.post(
  '/',
  authenticate,
  upload.array('photos', 3),
  asyncHandler(uploadImages)
);

export default router;