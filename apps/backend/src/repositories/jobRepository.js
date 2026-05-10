import { randomUUID } from 'node:crypto';
import { query } from '../config/database.js';

export async function createJob({ id, inputJson }) {
  await query(
    `
    INSERT INTO jobs (id, status, current_stage, progress, input_json)
    VALUES ($1, 'queued', 'queued', 0, $2)
  `,
    [id, inputJson]
  );
}

export async function updateJobState({ jobId, status, stage, progress, errorMessage = null }) {
  await query(
    `
      UPDATE jobs
      SET status = $2,
          current_stage = $3,
          progress = $4,
          error_message = $5,
          updated_at = NOW()
      WHERE id = $1
    `,
    [jobId, status, stage, progress, errorMessage]
  );
}

export async function addJobEvent({ jobId, stage, message, metadata = {} }) {
  const { rows } = await query(
    `
      INSERT INTO job_events (job_id, stage, message, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING id, job_id, stage, message, metadata, created_at
    `,
    [jobId, stage, message, metadata]
  );

  return rows[0];
}

export async function getJobById(jobId) {
  const { rows } = await query(
    `
      SELECT id, status, current_stage, progress, input_json, error_message, created_at, updated_at
      FROM jobs
      WHERE id = $1
    `,
    [jobId]
  );

  return rows[0] ?? null;
}

export async function listJobEvents(jobId, { afterId = 0, limit = 200 } = {}) {
  const { rows } = await query(
    `
      SELECT id, job_id, stage, message, metadata, created_at
      FROM job_events
      WHERE job_id = $1 AND id > $2
      ORDER BY id ASC
      LIMIT $3
    `,
    [jobId, afterId, limit]
  );

  return rows;
}

export async function createArtifact({
  jobId,
  artifactType,
  storageKey,
  publicUrl,
  mimeType = null,
}) {
  const id = randomUUID();
  const { rows } = await query(
    `
      INSERT INTO artifacts (id, job_id, artifact_type, storage_key, public_url, mime_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, job_id, artifact_type, storage_key, public_url, mime_type, created_at
    `,
    [id, jobId, artifactType, storageKey, publicUrl, mimeType]
  );

  return rows[0];
}

export async function listArtifacts(jobId) {
  const { rows } = await query(
    `
      SELECT id, job_id, artifact_type, storage_key, public_url, mime_type, created_at
      FROM artifacts
      WHERE job_id = $1
      ORDER BY created_at ASC
    `,
    [jobId]
  );

  return rows;
}

export async function recordProviderCall({
  jobId,
  provider,
  operation,
  status,
  requestPayload,
  responsePayload,
  errorMessage,
}) {
  const id = randomUUID();
  await query(
    `
      INSERT INTO provider_calls (
        id,
        job_id,
        provider,
        operation,
        status,
        request_payload,
        response_payload,
        error_message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [id, jobId, provider, operation, status, requestPayload, responsePayload, errorMessage]
  );
}
