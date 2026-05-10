# ADR-0003: SSE for Live Job Timeline

## Status

Accepted

## Decision

Expose job progress updates using Server-Sent Events endpoint.

## Rationale

- Simpler than WebSocket for unidirectional status feed.
- Native browser support with minimal client code.
- Works well with queue/event timeline model.

## Consequences

- Requires reconnection handling client-side.
- Event stream currently backed by DB polling in API process.
