# ADR-0002: Postgres for Metadata, MinIO for Artifacts

## Status

Accepted

## Decision

Store relational state in Postgres and binary artifacts in MinIO.

## Rationale

- Metadata queries/events are relational and transactional.
- Binary media storage is better handled by object storage.
- Enables larger artifacts without DB bloat.

## Consequences

- Two persistence systems to provision.
- Artifact URLs must be tracked in metadata rows.
