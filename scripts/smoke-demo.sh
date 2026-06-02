#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-default}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:30081}"
BACKEND_URL="${BACKEND_URL:-http://localhost:30080}"

check_url() {
  local name="$1"
  local url="$2"

  printf 'Checking %s at %s ...\n' "$name" "$url"
  if curl -fsS --max-time 8 -o /dev/null "$url"; then
    printf '%s responded successfully.\n' "$name"
    return 0
  fi

  printf '%s did not respond at %s.\n' "$name" "$url" >&2
  return 1
}

check_url "frontend" "$FRONTEND_URL"
check_url "backend" "$BACKEND_URL"

printf '\nDeployment status in namespace %s:\n' "$NAMESPACE"
kubectl get deployments -n "$NAMESPACE"

printf '\nPod status in namespace %s:\n' "$NAMESPACE"
kubectl get pods -n "$NAMESPACE" -o wide

printf '\nDemo smoke check complete.\n'
