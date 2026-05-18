#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/phoenix-ops/backups/mysql}"
MYSQL_POD_SELECTOR="${MYSQL_POD_SELECTOR:-app=mysql}"
MYSQL_DATABASE="${MYSQL_DATABASE:-}"
MYSQL_USER="${MYSQL_USER:-}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"
MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_DOCKER_CONTAINER="${MYSQL_DOCKER_CONTAINER:-mysql-banking}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

read_secret_key() {
  local key="$1"
  kubectl get secret banking-secret -o "jsonpath={.data.${key}}" 2>/dev/null | base64 --decode 2>/dev/null || true
}

MYSQL_DATABASE="${MYSQL_DATABASE:-$(read_secret_key mysql-database)}"
MYSQL_USER="${MYSQL_USER:-$(read_secret_key mysql-user)}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-$(read_secret_key mysql-root-password)}"

if [[ -z "$MYSQL_DATABASE" ]]; then
  MYSQL_DATABASE="bankingdb"
fi

if [[ -z "$MYSQL_USER" || -z "$MYSQL_PASSWORD" ]]; then
  echo "Backup failed: MYSQL_USER and MYSQL_PASSWORD are required when Kubernetes secret values are unavailable." >&2
  exit 1
fi

timestamp="$(date -u +%Y%m%d-%H%M%S)"
backup_file="$BACKUP_DIR/${MYSQL_DATABASE}-${timestamp}.sql.gz"
tmp_file="${backup_file}.tmp"

cleanup() {
  rm -f "$tmp_file"
}
trap cleanup EXIT

pod_name="$(kubectl get pods -l "$MYSQL_POD_SELECTOR" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true)"

echo "Starting MySQL backup for database '$MYSQL_DATABASE'."
if [[ -n "$pod_name" ]]; then
  echo "Using Kubernetes pod '$pod_name'."
  kubectl exec "$pod_name" -- env MYSQL_PWD="$MYSQL_PASSWORD" \
    mysqldump --single-transaction --quick --routines --triggers -u "$MYSQL_USER" "$MYSQL_DATABASE" \
    | gzip -c > "$tmp_file"
elif docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "$MYSQL_DOCKER_CONTAINER"; then
  echo "Using Docker container '$MYSQL_DOCKER_CONTAINER'."
  docker exec -e MYSQL_PWD="$MYSQL_PASSWORD" "$MYSQL_DOCKER_CONTAINER" \
    mysqldump --single-transaction --quick --routines --triggers -u "$MYSQL_USER" "$MYSQL_DATABASE" \
    | gzip -c > "$tmp_file"
elif command -v mysqldump >/dev/null 2>&1; then
  echo "Using local mysqldump client against $MYSQL_HOST:$MYSQL_PORT."
  MYSQL_PWD="$MYSQL_PASSWORD" mysqldump \
    --single-transaction --quick --routines --triggers \
    -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" "$MYSQL_DATABASE" \
    | gzip -c > "$tmp_file"
else
  echo "Backup failed: no Kubernetes MySQL pod, Docker MySQL container, or local mysqldump client was available." >&2
  exit 1
fi

mv "$tmp_file" "$backup_file"
find "$BACKUP_DIR" -type f -name '*.sql.gz' -mtime +"$BACKUP_RETENTION_DAYS" -print -delete
echo "Backup completed: $backup_file"
echo "Retention applied: backups older than $BACKUP_RETENTION_DAYS days removed."
