#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

required_vars=(
  "EXPO_PUBLIC_API_URL"
  "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"
  "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"
  "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"
  "EXPO_PUBLIC_GOOGLE_REDIRECT_URI"
)

missing=()

echo "Running EAS mobile preflight..."
for var_name in "${required_vars[@]}"; do
  value="${!var_name:-}"

  if [ -z "$value" ] || [[ "$value" == your-* ]] || [[ "$value" == *"<"* ]]; then
    missing+=("$var_name")
    echo "[WARN] $var_name is missing or still a placeholder."
  else
    echo "[OK]   $var_name is set."
  fi
done

if [ "${#missing[@]}" -gt 0 ]; then
  echo
  echo "Preflight found ${#missing[@]} missing variable(s)."
  echo "Set them locally in .env and in EAS environments before cloud builds."
  echo
  echo "Examples:"
  echo "  npx eas env:create preview --name EXPO_PUBLIC_API_URL --value \"https://api-preview.example.com/api\" --scope project --visibility plaintext --non-interactive"
  echo "  npx eas env:create production --name EXPO_PUBLIC_API_URL --value \"https://api.example.com/api\" --scope project --visibility plaintext --non-interactive"
  echo
  echo "See docs/ops/MOBILE_EAS_SETUP.md for the full command set."
  exit 1
fi

echo
echo "Preflight passed. Local mobile env vars look ready."
