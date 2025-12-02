#!/usr/bin/env bash
set -euo pipefail
echo "Running lint..."
npm run lint
echo "Running tests..."
npm test
echo "Running production build..."
npm run build
echo "Build verification complete."
