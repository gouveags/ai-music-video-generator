#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:8080}"

echo "Checking backend health..."
curl -fsS "$API_BASE_URL/api/v1/health" >/dev/null

echo "Creating generation job..."
payload='{
  "mood": "relaxed",
  "genre": "ambient",
  "topic": "dawn over the ocean",
  "language": "english",
  "style": "cinematic",
  "durationSeconds": 60
}'

create_response=$(curl -fsS -X POST "$API_BASE_URL/api/v1/jobs" -H "Content-Type: application/json" -d "$payload")

echo "Create response: $create_response"

job_id=$(node -e "const payload = JSON.parse(process.argv[1]); console.log(payload.id || '');" "$create_response")

if [ -z "$job_id" ]; then
  echo "Could not parse job id from response"
  exit 1
fi

echo "Polling job $job_id"
for _ in $(seq 1 120); do
  status_response=$(curl -fsS "$API_BASE_URL/api/v1/jobs/$job_id")
  status=$(node -e "const payload = JSON.parse(process.argv[1]); console.log(payload.status || '');" "$status_response")

  echo "Current status: $status"
  if [ "$status" = "done" ]; then
    echo "Job completed successfully"
    curl -fsS "$API_BASE_URL/api/v1/jobs/$job_id/artifacts"
    exit 0
  fi

  if [ "$status" = "failed" ]; then
    echo "Job failed"
    echo "$status_response"
    exit 1
  fi

  sleep 5
done

echo "Timed out waiting for job completion"
exit 1
