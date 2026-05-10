# ADR-0001: Redis + BullMQ for Job Orchestration

## Status

Accepted

## Decision

Use BullMQ with Redis for generation job orchestration.

## Rationale

- Durable async execution decoupled from API request lifecycle.
- Built-in retries, backoff, concurrency controls.
- Straightforward operational model for local container stack.

## Consequences

- Requires Redis service lifecycle and monitoring.
- Worker process must remain separate from API process.
