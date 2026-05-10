import { z } from 'zod';

export const jobInputSchema = z.object({
  mood: z.string().min(2).max(120),
  genre: z.string().min(2).max(120),
  topic: z.string().min(2).max(240),
  language: z.string().min(2).max(80).default('english'),
  style: z.string().min(2).max(120).default('cinematic'),
  durationSeconds: z.number().int().min(30).max(240).default(90),
});
