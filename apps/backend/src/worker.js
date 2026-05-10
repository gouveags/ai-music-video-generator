import 'dotenv/config';
import { createVideoWorker } from './queue/videoQueue.js';
import { logger } from './config/logger.js';
import { initDatabase } from './config/database.js';
import { ensureBucket } from './config/storage.js';
import { processGenerationJob } from './services/pipelineService.js';
import { withRetry } from './utils/retry.js';

async function bootstrapWorker() {
  await withRetry(() => initDatabase(), { label: 'database initialization' });
  await withRetry(() => ensureBucket(), { label: 'minio bucket setup' });

  const worker = createVideoWorker(processGenerationJob);

  worker.on('completed', (job, result) => {
    logger.info('Job completed', {
      jobId: job.id,
      result,
    });
  });

  worker.on('failed', (job, error) => {
    logger.error('Job failed', {
      jobId: job?.id,
      error,
    });
  });

  worker.on('error', (error) => {
    logger.error('Worker error', error);
  });

  logger.info('Video generation worker started');
}

bootstrapWorker().catch((error) => {
  logger.error('Failed to start worker', error);
  process.exit(1);
});
