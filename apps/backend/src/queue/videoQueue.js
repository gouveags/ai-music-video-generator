import { Queue, Worker } from 'bullmq';
import { env } from '../config/env.js';
import { queueConnection, workerConnection } from './connection.js';

export const VIDEO_QUEUE = 'video-generation';

export const videoQueue = new Queue(VIDEO_QUEUE, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: env.JOB_MAX_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 500,
    },
  },
});

export function createVideoWorker(processor) {
  return new Worker(VIDEO_QUEUE, processor, {
    connection: workerConnection,
    concurrency: env.WORKER_CONCURRENCY,
  });
}
