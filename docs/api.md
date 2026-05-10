# API Reference (v1)

Base URL: `http://localhost:8080/api/v1`

## `GET /health`

Returns service readiness payload.

## `POST /jobs`

Creates a generation job.

### Request JSON

```json
{
  "mood": "dreamy",
  "genre": "indie pop",
  "topic": "A city waking up before sunrise",
  "language": "english",
  "style": "editorial cinematic",
  "durationSeconds": 90
}
```

### Response

```json
{
  "id": "<uuid>",
  "status": "queued"
}
```

## `GET /jobs/:id`

Returns status, stage, progress, and input payload.

## `GET /jobs/:id/events`

Server-Sent Events stream with `job-event` messages and terminal notification.

## `GET /jobs/:id/artifacts`

Returns generated artifacts and public MinIO URLs.
