#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
required="$(tr -d '[:space:]' < .nvmrc)"
current="$(node -p 'process.versions.node' 2>/dev/null || true)"
if [[ "$current" != "$required" && "$current" != "$required".* ]]; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    source "$NVM_DIR/nvm.sh"
    nvm install
    nvm use
  else
    echo "Node.js $required is required (.nvmrc). Install it or enable nvm." >&2
    exit 1
  fi
fi
node scripts/worktree.mjs setup
