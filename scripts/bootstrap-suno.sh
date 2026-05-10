#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${SUNO_FORK_REPO:-https://github.com/gouveags/suno-api.git}"
TARGET_DIR="infra/suno-api"

if [ -d "$TARGET_DIR/.git" ]; then
  echo "Suno API fork already present at $TARGET_DIR"
  exit 0
fi

echo "Cloning $REPO_URL into $TARGET_DIR"
git clone "$REPO_URL" "$TARGET_DIR"

echo "Suno API fork ready."
