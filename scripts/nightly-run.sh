#!/usr/bin/env bash
set -euo pipefail

echo "Starting nightly dry-run ingest + enrich summary..."
DATE=$(date -Is)
RESULT=$(curl -s -X POST "${NEXT_PUBLIC_APP_URL:-http://localhost:3000}/api/cron/run" -H "Content-Type: application/json" -d '{"task":"jobber-ingest","dryRun":true}')
echo "[$DATE] Ingest dry-run: $RESULT"

ENRICH=$(curl -s -X POST "${NEXT_PUBLIC_APP_URL:-http://localhost:3000}/api/property-insights" -H "Content-Type: application/json" -d '{"address":"999 Nightly Ln","enrich":true,"persist":false}')
echo "[$DATE] Enrich sample: $ENRICH"

echo "Nightly run complete."
