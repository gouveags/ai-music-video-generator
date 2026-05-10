import { randomUUID } from 'node:crypto';
import { query } from '../config/database.js';
import { queueConnection } from '../queue/connection.js';
import { videoQueue } from '../queue/videoQueue.js';
import {
  addJobEvent,
  createJob,
  getJobById,
  listArtifacts,
  listJobEvents,
} from '../repositories/jobRepository.js';
import { jobInputSchema } from './validation.js';

export async function createGenerationJob(payload) {
  const input = jobInputSchema.parse(payload);
  const id = randomUUID();

  await createJob({
    id,
    inputJson: input,
  });

  await addJobEvent({
    jobId: id,
    stage: 'queued',
    message: 'Job accepted and queued for processing.',
  });

  await videoQueue.add(
    'generate-video',
    {
      jobId: id,
      input,
    },
    {
      jobId: id,
    }
  );

  return {
    id,
    status: 'queued',
  };
}

export async function getGenerationJob(jobId) {
  const job = await getJobById(jobId);
  if (!job) {
    return null;
  }

  return {
    id: job.id,
    status: job.status,
    stage: job.current_stage,
    progress: job.progress,
    input: job.input_json,
    error: job.error_message,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
}

export async function getGenerationJobArtifacts(jobId) {
  return listArtifacts(jobId);
}

export async function getGenerationJobEvents(jobId, { afterId = 0, limit = 200 } = {}) {
  return listJobEvents(jobId, { afterId, limit });
}

export async function getHealthStatus() {
  await query('SELECT 1 AS ok');
  await queueConnection.ping();

  return {
    status: 'ok',
    service: 'backend-api',
    timestamp: new Date().toISOString(),
  };
}
