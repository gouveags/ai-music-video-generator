# AI Music Video Generator Platform

Containerized local platform to generate AI music videos end-to-end with:

- Astro frontend dashboard
- Express API + BullMQ worker backend
- Postgres metadata store
- Redis queue broker
- MinIO object storage
- Suno API for music generation
- FFmpeg video composition in backend container

## Monorepo structure

- `apps/frontend`: Astro dashboard (no auth, single-user local UX)
- `apps/backend`: Express API + worker pipeline
- `docs`: architecture, ADRs, runbooks
- `scripts`: automation scripts (Suno bootstrap, curl endpoint checks)

## Quick start

1. Create env file:

```bash
cp .env.example .env
```

2. Fill required secrets in `.env`:

- `OPENAI_API_KEY` (optional, fallback exists for lyrics/image)
- `SUNO_COOKIE` and any required suno-api env keys

3. Install dependencies:

```bash
npm install
```

4. Clone Suno fork into infrastructure folder:

```bash
npm run bootstrap:suno
```

5. Run full local stack:

```bash
npm run up
```

6. Open app:

- Frontend: `http://localhost:4321`
- API: `http://localhost:8080/api/v1`

## Main commands

- `npm run up`: start all containers
- `npm run down`: stop all containers
- `npm run logs`: tail container logs
- `npm run format`: run prettier write
- `npm run lint`: run eslint across workspaces
- `npm run test`: run workspace tests
- `npm run test:api:curls`: backend endpoint smoke/e2e flow via curl
- `npm run check`: format-check + lint + tests

## API endpoints

- `GET /api/v1/health`
- `POST /api/v1/jobs`
- `GET /api/v1/jobs/:id`
- `GET /api/v1/jobs/:id/events` (SSE)
- `GET /api/v1/jobs/:id/artifacts`

## Reliability highlights

- Queue-based async pipeline with retry/backoff
- Persistent metadata + artifact storage split
- Stage events for observability and UI timeline
- FFmpeg subtitle fallback mode for resilient rendering

## Developer workflow requirements

See [AGENTS.md](AGENTS.md) for mandatory lint/format/test and manual verification requirements.
