import { z } from 'zod';

export const updateUserSchema = z.object({
  username: z.string().min(1),
});
