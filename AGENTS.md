# AGENTS.md

## Mandatory Local Quality Gate

Every change must run these commands before commit/push:

1. `npm run format`
2. `npm run lint`
3. `npm run test`
4. `npm run test:api:curls` (when backend containers are up)

If any command fails, fix the issue before creating a commit or PR.

## Backend Verification Protocol

- Bring the stack up with `npm run up`.
- Run `npm run test:api:curls` to verify end-to-end backend endpoints:
  - `GET /api/v1/health`
  - `POST /api/v1/jobs`
  - `GET /api/v1/jobs/:id`
  - `GET /api/v1/jobs/:id/artifacts`
- Validate that status transitions are observed (`queued -> running -> done` or `failed`).

## Frontend Verification Protocol (Chrome MCP)

When frontend changes are introduced, run end-to-end browser checks with Chrome MCP:

1. Open `http://localhost:4321`.
2. Submit the generation form.
3. Confirm pipeline status updates in real time.
4. Confirm event timeline renders incremental events.
5. Confirm artifact previews render for image/audio/video outputs.
6. Confirm responsive behavior in desktop and mobile viewport widths.

## Reliability Rules

- Keep generation processing asynchronous via queue workers.
- Do not bypass BullMQ for direct synchronous generation from the request path.
- Maintain durable metadata in Postgres and binary assets in MinIO.
- Keep provider calls observable (`provider_calls` table + job events).
- Add retries for startup dependencies and transient provider failures.
