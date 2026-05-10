# Architecture Overview

## Goal

Provide a local-first AI music video platform that reliably converts a creative brief into downloadable artifacts (lyrics, image, audio, final video).

## High-Level Components

- **Frontend (`apps/frontend`)**: Astro + vanilla JS dashboard for job submission, live status tracking (SSE), and artifact previews.
- **Backend API (`apps/backend/src/server.js`)**: Express service exposing job lifecycle endpoints.
- **Worker (`apps/backend/src/worker.js`)**: BullMQ consumer executing the generation pipeline.
- **Queue**: Redis + BullMQ for durable async processing with retries/backoff.
- **Metadata Store**: Postgres (`jobs`, `job_events`, `artifacts`, `provider_calls`).
- **Object Storage**: MinIO (S3-compatible) for generated artifacts.
- **Music Provider**: Suno API service from forked repository (`gouveags/suno-api`).
- **Media Composer**: FFmpeg in backend container for final video rendering.

## Data Flow

1. Frontend calls `POST /api/v1/jobs` with generation input.
2. API validates payload, creates DB job row, emits `queued` event, and enqueues BullMQ job.
3. Worker consumes queue job and executes stages:
   - lyrics generation (OpenAI)
   - image generation (OpenAI)
   - music generation + polling (Suno)
   - ffmpeg composition
   - artifact upload to MinIO + DB registration
4. API exposes polling + SSE for timeline updates.
5. Frontend consumes SSE (`/jobs/:id/events`) and status polling (`/jobs/:id`) then displays artifacts (`/jobs/:id/artifacts`).

## Reliability Design

- Queue-based async orchestration avoids blocking HTTP request lifecycle.
- BullMQ retries with exponential backoff for transient stage failures.
- Startup dependency retries for Postgres/MinIO initialization.
- Stage-level events and provider-call records for traceability.
- Artifact persistence separated from metadata persistence.
- FFmpeg subtitle fallback path if subtitle rendering filter fails.

## Storage Model

- `jobs`: canonical state (`queued`, `running`, `done`, `failed`), current stage, progress.
- `job_events`: timeline feed for SSE and observability.
- `artifacts`: typed output references with MinIO URLs.
- `provider_calls`: request/response/error ledger for OpenAI/Suno calls.
