#!/usr/bin/env bash
set -euo pipefail

echo "Running preflight..."
./scripts/preflight.sh

echo "Running lint..."
npm run lint

echo "Running tests..."
npm test

echo "Running build..."
npm run build

echo "Build verification completed."
