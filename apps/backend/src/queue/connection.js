import IORedis from 'ioredis';
import { env } from '../config/env.js';

export const queueConnection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
});

export const workerConnection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

export async function closeRedisConnections() {
  await queueConnection.quit();
  await workerConnection.quit();
}
