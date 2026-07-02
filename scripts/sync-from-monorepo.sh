#!/usr/bin/env bash
# One-time sync of platform sources from the monorepo copy.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${BLACKLIGHT_MONOREPO:-$ROOT/../blacklight}/packages/platform"
rsync -a --exclude node_modules --exclude dist --exclude .wrangler \
  "$SRC/src/" "$ROOT/src/"
rsync -a --exclude node_modules \
  "$SRC/tests/" "$ROOT/tests/"
echo "Synced platform sources from $SRC"
