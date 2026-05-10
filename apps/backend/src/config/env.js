import { z } from 'zod';

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}, z.boolean());

const numberFromEnv = (defaultValue) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    if (typeof value === 'number') {
      return value;
    }
    return Number(value);
  }, z.number().int().positive());

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  API_PORT: numberFromEnv(8080),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:4321'),
  WORKER_CONCURRENCY: numberFromEnv(2),
  JOB_MAX_ATTEMPTS: numberFromEnv(3),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_TEXT_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_IMAGE_MODEL: z.string().default('gpt-image-1'),

  SUNO_API_BASE_URL: z.string().url().default('http://localhost:3000'),
  SUNO_POLL_INTERVAL_MS: numberFromEnv(5000),
  SUNO_POLL_TIMEOUT_MS: numberFromEnv(900000),

  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: numberFromEnv(5432),
  POSTGRES_DB: z.string().default('music_video'),
  POSTGRES_USER: z.string().default('music_video'),
  POSTGRES_PASSWORD: z.string().default('music_video'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: numberFromEnv(6379),

  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: numberFromEnv(9000),
  MINIO_USE_SSL: booleanFromEnv.default(false),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET: z.string().default('music-video-assets'),
  MINIO_PUBLIC_BASE_URL: z.string().url().default('http://localhost:9000'),

  FFMPEG_PATH: z.string().default('ffmpeg'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${errors.join('\n')}`);
}

export const env = parsed.data;
