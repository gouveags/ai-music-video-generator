import * as Minio from 'minio';
import { env } from './env.js';

const minioClient = new Minio.Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

const buildPublicUrl = (objectName) => {
  const base = env.MINIO_PUBLIC_BASE_URL.replace(/\/$/, '');
  return `${base}/${env.MINIO_BUCKET}/${objectName}`;
};

export async function ensureBucket() {
  const exists = await minioClient.bucketExists(env.MINIO_BUCKET);
  if (!exists) {
    await minioClient.makeBucket(env.MINIO_BUCKET, 'us-east-1');
  }
}

export async function uploadBuffer({ objectName, buffer, contentType }) {
  await minioClient.putObject(env.MINIO_BUCKET, objectName, buffer, undefined, {
    'Content-Type': contentType,
  });

  return {
    storageKey: objectName,
    publicUrl: buildPublicUrl(objectName),
  };
}
