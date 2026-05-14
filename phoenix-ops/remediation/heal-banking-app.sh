#!/usr/bin/env bash
set -euo pipefail

OLLAMA_URL="http://172.31.38.136:11434/api/generate"
OLLAMA_MODEL="llama3.2:3b"
OLLAMA_DIAGNOSIS_ENABLED="${OLLAMA_DIAGNOSIS_ENABLED:-false}"
OLLAMA_CONNECT_TIMEOUT_SECONDS="${OLLAMA_CONNECT_TIMEOUT_SECONDS:-2}"
OLLAMA_MAX_TIME_SECONDS="${OLLAMA_MAX_TIME_SECONDS:-10}"
OLLAMA_CONTEXT_CHARS="${OLLAMA_CONTEXT_CHARS:-6000}"
LOG_TAIL_LINES="${LOG_TAIL_LINES:-20}"
ROLLOUT_TIMEOUT="${ROLLOUT_TIMEOUT:-300s}"
APP_LABEL="app=banking-app"
DEPLOYMENT="deployment/banking-app"
OLLAMA_OUTPUT_FILE=""
OLLAMA_PID=""

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Error: required command not found: $command_name" >&2
    exit 1
  fi
}

require_command kubectl

if [[ "$OLLAMA_DIAGNOSIS_ENABLED" == "true" ]]; then
  require_command jq
  require_command curl
fi

cleanup() {
  if [[ -n "$OLLAMA_PID" ]] && kill -0 "$OLLAMA_PID" >/dev/null 2>&1; then
    kill "$OLLAMA_PID" >/dev/null 2>&1 || true
  fi

  if [[ -n "$OLLAMA_OUTPUT_FILE" ]]; then
    rm -f "$OLLAMA_OUTPUT_FILE"
  fi
}

trap cleanup EXIT

truncate_text() {
  local max_chars="$1"

  head -c "$max_chars"
}

start_ollama_diagnosis() {
  if [[ "$OLLAMA_DIAGNOSIS_ENABLED" != "true" ]]; then
    echo "AI diagnosis: skipped. Set OLLAMA_DIAGNOSIS_ENABLED=true to enable optional Ollama diagnosis."
    return
  fi

  local pod_status="$1"
  local deployment_logs="$2"
  local prompt
  local payload

  prompt="$(
    cat <<EOF
You are diagnosing a Kubernetes banking application incident.

Pod status:
$pod_status

Recent deployment logs, capped to ${LOG_TAIL_LINES} lines and ${OLLAMA_CONTEXT_CHARS} chars:
$deployment_logs

Respond in under 120 words. Give: 1) probable cause, 2) safe remediation, 3) verification command. Do not explain Kubernetes basics.
EOF
  )"

  payload="$(jq -n \
    --arg model "$OLLAMA_MODEL" \
    --arg prompt "$prompt" \
    '{model: $model, prompt: $prompt, stream: false, options: {num_predict: 120}}')"

  OLLAMA_OUTPUT_FILE="$(mktemp)"

  (
    local response
    local curl_status

    set +e
    response="$(curl \
      --connect-timeout "$OLLAMA_CONNECT_TIMEOUT_SECONDS" \
      --max-time "$OLLAMA_MAX_TIME_SECONDS" \
      -sS \
      -X POST "$OLLAMA_URL" \
      -H "Content-Type: application/json" \
      -d "$payload" 2>&1)"
    curl_status="$?"
    set -e

    {
      echo
      echo "AI diagnosis:"
      if [[ "$curl_status" -eq 0 ]]; then
        printf "%s" "$response" | jq -r '.response // .error // .' 2>/dev/null || printf "%s\n" "$response"
      elif [[ "$curl_status" -eq 28 ]]; then
        echo "Ollama diagnosis timed out after ${OLLAMA_MAX_TIME_SECONDS}s; continuing with deterministic safe remediation."
      else
        echo "Ollama diagnosis unavailable (curl exit ${curl_status}); continuing with deterministic safe remediation."
        printf "%s\n" "$response"
      fi
      echo
    } >"$OLLAMA_OUTPUT_FILE"
  ) &

  OLLAMA_PID="$!"
  echo "AI diagnosis: requested in background with ${OLLAMA_MAX_TIME_SECONDS}s timeout."
}

print_ollama_diagnosis() {
  if [[ -z "$OLLAMA_PID" ]]; then
    return
  fi

  if kill -0 "$OLLAMA_PID" >/dev/null 2>&1; then
    echo
    echo "AI diagnosis:"
    echo "Ollama diagnosis did not complete before remediation finished; continuing without AI output."
    echo
    kill "$OLLAMA_PID" >/dev/null 2>&1 || true
    wait "$OLLAMA_PID" 2>/dev/null || true
    OLLAMA_PID=""
    return
  fi

  wait "$OLLAMA_PID" 2>/dev/null || true
  OLLAMA_PID=""

  if [[ -n "$OLLAMA_OUTPUT_FILE" && -s "$OLLAMA_OUTPUT_FILE" ]]; then
    cat "$OLLAMA_OUTPUT_FILE"
  fi
}

print_rollout_debug() {
  echo
  echo "Rollout failed or timed out after ${ROLLOUT_TIMEOUT}. Debugging output follows."
  echo
  echo "Deployment:"
  kubectl get "$DEPLOYMENT" -o wide || true
  echo
  kubectl describe "$DEPLOYMENT" || true
  echo
  echo "ReplicaSets:"
  kubectl get replicasets -l "$APP_LABEL" -o wide || true
  echo
  echo "Pods:"
  kubectl get pods -l "$APP_LABEL" -o wide || true
  echo
  echo "Recent cluster events:"
  kubectl get events --sort-by=.lastTimestamp 2>/dev/null | tail -n 30 || true
  echo
  echo "Recent deployment logs:"
  kubectl logs "$DEPLOYMENT" --tail=50 --all-containers=true 2>&1 || true
}

echo "Collecting banking-app pod status..."
pod_status="$(kubectl get pods -l "$APP_LABEL" -o wide 2>&1 || true)"

echo "Collecting last ${LOG_TAIL_LINES} log lines from $DEPLOYMENT for bounded context..."
deployment_logs="$(kubectl logs "$DEPLOYMENT" --tail="$LOG_TAIL_LINES" --all-containers=true 2>&1 | truncate_text "$OLLAMA_CONTEXT_CHARS" || true)"

start_ollama_diagnosis "$pod_status" "$deployment_logs"

echo "Restarting $DEPLOYMENT..."
kubectl rollout restart "$DEPLOYMENT"

echo "Waiting for rollout completion with timeout ${ROLLOUT_TIMEOUT}..."
if ! kubectl rollout status "$DEPLOYMENT" --timeout="$ROLLOUT_TIMEOUT"; then
  print_rollout_debug
  print_ollama_diagnosis
  exit 1
fi

echo
echo "Final banking-app pod status:"
kubectl get pods -l "$APP_LABEL"

print_ollama_diagnosis
