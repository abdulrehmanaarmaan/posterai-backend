import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  MONGODB_URI: z.string().min(1),

  JWT_SECRET: z.string().min(32),

  JWT_EXPIRES_IN: z.string().default('7d'),

  CLIENT_URL: z.string().url(),

  GEMINI_API_KEY: z.string().min(1),

  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),

  CLOUDINARY_API_KEY: z.string().min(1),

  CLOUDINARY_API_SECRET: z.string().min(1)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:');
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;