import { z } from 'zod';

export const templateIdSchema = z.object({
  id: z.string().min(1)
});