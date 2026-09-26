import type { RequestHandler } from 'express';

import {
  AppError,
} from '../../utils/app-error.js';

import {
  uploadBufferToCloudinary,
} from '../../services/cloudinary.service.js';

import {
  sendSuccess,
} from '../../utils/response.js';

export const uploadImages: RequestHandler =
  async (req, res) => {
    const files =
      req.files as
        | Express.Multer.File[]
        | undefined;

    if (!files?.length) {
      throw new AppError(
        400,
        'At least one image is required.',
        'NO_FILES',
      );
    }

    if (files.length > 3) {
      throw new AppError(
        400,
        'You can upload a maximum of 3 photos.',
        'TOO_MANY_FILES',
      );
    }

    const uploads =
      await Promise.all(
        files.map(
          (file) =>
            uploadBufferToCloudinary(
              file.buffer,
              'ai-political-poster-maker/user-uploads',
            ),
        ),
      );

    sendSuccess(
      res,
      201,
      'Images uploaded successfully.',
      uploads.map(
        (upload) => ({
          url: upload.secure_url,
          publicId:
            upload.public_id,
          width:
            upload.width,
          height:
            upload.height,
        }),
      ),
    );
  };