#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v node >/dev/null || [[ "$(node -p 'process.versions.node.split(".")[0]')" != 26 ]]; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    source "$NVM_DIR/nvm.sh"
    nvm install 26
    nvm use 26
  else
    echo 'Node.js 26 is required. Install it or enable nvm.' >&2
    exit 1
  fi
fi
node scripts/worktree.mjs setup
