import 'dotenv/config';
import { createApp } from './createApp.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initDatabase } from './config/database.js';
import { ensureBucket } from './config/storage.js';
import * as jobService from './services/jobService.js';
import { withRetry } from './utils/retry.js';

async function bootstrap() {
  await withRetry(() => initDatabase(), { label: 'database initialization' });
  await withRetry(() => ensureBucket(), { label: 'minio bucket setup' });

  const app = createApp(jobService);

  app.listen(env.API_PORT, () => {
    logger.info('Backend API listening', {
      port: env.API_PORT,
    });
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start backend API', error);
  process.exit(1);
});
