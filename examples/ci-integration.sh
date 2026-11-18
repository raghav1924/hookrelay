#!/usr/bin/env bash
set -euo pipefail

echo "⚡ Running HookRelay CI validation pipeline..."
node dist/bin.js --version
echo "✔ HookRelay executable verified."
