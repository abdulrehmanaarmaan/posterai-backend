import { z } from 'zod';

const photoSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional()
});

export const createPosterSchema =
  z.object({
    templateId: z.string().min(1),

    name: z
      .string()
      .trim()
      .min(2)
      .max(80),

    designation: z
      .string()
      .trim()
      .min(2)
      .max(100),

    party: z
      .string()
      .trim()
      .min(2)
      .max(120),

    union: z
      .string()
      .trim()
      .min(2)
      .max(100),

    thana: z
      .string()
      .trim()
      .min(2)
      .max(100),

    district: z
      .string()
      .trim()
      .min(2)
      .max(100),

    occasionType: z
      .string()
      .trim()
      .min(1)
      .max(100),

    headline: z
      .string()
      .trim()
      .min(2)
      .max(200),

    photos: z
      .array(photoSchema)
      .min(1)
      .max(3)
  });