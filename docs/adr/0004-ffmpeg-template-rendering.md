# ADR-0004: FFmpeg Template-Based Video Composition

## Status

Accepted

## Decision

Use FFmpeg template-based rendering (image + audio + subtitle timeline) for v1 output.

## Rationale

- Deterministic, reliable local rendering pipeline.
- Fast enough for iterative local testing.
- Easy to tune style and subtitle treatment.

## Consequences

- Visual variety bounded by templates.
- Future versions may add scene sequencing and richer transitions.
