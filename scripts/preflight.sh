#!/usr/bin/env bash
set -euo pipefail

REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "JOBBER_AUTH_URL"
  "JOBBER_CLIENT_ID"
  "JOBBER_CLIENT_SECRET"
  "JOBBER_REDIRECT_URI"
)

missing=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    missing+=("$var")
  fi
done

if [ ${#missing[@]} -ne 0 ]; then
  echo "Missing required env vars:"
  printf -- " - %s\n" "${missing[@]}"
  exit 1
fi

echo "Preflight OK: all required env vars present."
