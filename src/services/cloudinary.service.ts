import { UploadApiResponse } from 'cloudinary';

import cloudinary from '../config/cloudinary.js';

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'video' = 'image'
): Promise<UploadApiResponse> => {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType
          },
          (
            error,
            result
          ) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(
                new Error(
                  'Cloudinary upload returned no result.'
                )
              );
              return;
            }

            resolve(result);
          }
        );

      uploadStream.end(buffer);
    }
  );
};

export const deleteCloudinaryAsset = async (
  publicId: string,
  resourceType:
    | 'image'
    | 'raw'
    | 'video' = 'image'
): Promise<void> => {
  await cloudinary.uploader.destroy(
    publicId,
    {
      resource_type: resourceType
    }
  );
};