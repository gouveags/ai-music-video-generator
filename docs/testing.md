# Testing Strategy

## Automated

- Backend unit/API tests: `apps/backend/test/*.spec.js`
- Frontend build smoke test via `npm run test` in frontend workspace
- Hook enforcement:
  - pre-commit: lint-staged
  - pre-push: full tests

## Manual E2E

### Backend

1. `npm run up`
2. `npm run test:api:curls`
3. Validate terminal status and artifact URL availability.

### Frontend (Chrome MCP)

1. Open `http://localhost:4321`.
2. Submit generation form with realistic prompt.
3. Observe live status progression.
4. Verify event timeline updates.
5. Verify artifacts render and links open.
6. Repeat in mobile viewport.
