# Local Run Guide

## Prerequisites

- Docker + Docker Compose
- Node.js 22+
- npm 10+
- OpenAI API key (optional fallback exists for lyrics/image)
- Suno credentials (`SUNO_COOKIE` and provider-specific env required by suno-api)

## Setup

1. Copy env template:
   - `cp .env.example .env`
2. Fill required secrets in `.env`.
3. Install workspace dependencies:
   - `npm install`
4. Clone Suno fork into infra path:
   - `npm run bootstrap:suno`

## Run stack

- Start all services: `npm run up`
- Tail logs: `npm run logs`
- Stop stack: `npm run down`

Frontend: `http://localhost:4321`  
Backend API: `http://localhost:8080/api/v1`

## Quality Commands

- Format: `npm run format`
- Lint: `npm run lint`
- Tests: `npm run test`
- Endpoint curl flow: `npm run test:api:curls`
- Full gate: `npm run check`
