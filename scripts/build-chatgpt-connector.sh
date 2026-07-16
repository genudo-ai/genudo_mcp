#!/usr/bin/env bash
# Rebuild the vendored ChatGPT plugin connector from the bridge source.
# Run after ANY change to index.js / guides.js / package.json, before committing chatgpt/.
set -euo pipefail
cd "$(dirname "$0")/.."
npx -y esbuild index.js --bundle --platform=node --target=node18 \
  --outfile=chatgpt/genudo-chatgpt-plugin/connector/index.js --log-level=warning
echo "rebuilt chatgpt/genudo-chatgpt-plugin/connector/index.js ($(du -h chatgpt/genudo-chatgpt-plugin/connector/index.js | cut -f1))"
