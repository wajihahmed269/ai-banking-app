# Database Backup Plan

## Manual Backup

Run from the repository root:

```bash
phoenix-ops/scripts/backup-mysql.sh
```

The script writes compressed backups to:

```text
phoenix-ops/backups/mysql
```

Default filename format:

```text
bankingdb-YYYYMMDD-HHMMSS.sql.gz
```

## Configuration

Supported environment variables:

```bash
MYSQL_POD_SELECTOR='app=mysql'
MYSQL_DATABASE='bankingdb'
MYSQL_USER='...'
MYSQL_PASSWORD='...'
MYSQL_HOST='127.0.0.1'
MYSQL_PORT='3306'
MYSQL_DOCKER_CONTAINER='mysql-banking'
BACKUP_RETENTION_DAYS=7
BACKUP_DIR='/custom/backup/path'
```

If `MYSQL_USER`, `MYSQL_PASSWORD`, or `MYSQL_DATABASE` are not provided, the script attempts to read Kubernetes secret `banking-secret` keys:

- `mysql-user`
- `mysql-root-password`
- `mysql-database`

No real password is stored in the script or systemd unit.

## Backup Method Order

1. Use `kubectl exec` into the first pod matching `MYSQL_POD_SELECTOR`.
2. If no pod is found, use Docker container `MYSQL_DOCKER_CONTAINER` when it is running.
3. If neither is available, use a local `mysqldump` client against `MYSQL_HOST:MYSQL_PORT`.

## Retention Policy

Default retention is 7 days.

The script removes files matching `*.sql.gz` in the backup directory when they are older than `BACKUP_RETENTION_DAYS`.

## Systemd Timer

Files created:

```text
phoenix-ops/systemd/mysql-backup.service
phoenix-ops/systemd/mysql-backup.timer
```

The timer is configured for daily execution with a randomized delay and `Persistent=true`.

To install and enable manually:

```bash
sudo cp phoenix-ops/systemd/mysql-backup.service /etc/systemd/system/
sudo cp phoenix-ops/systemd/mysql-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mysql-backup.timer
```

The timer was not enabled or started during Phase E.

## Restore Example

Use the target environment's credentials through environment variables:

```bash
gzip -dc phoenix-ops/backups/mysql/bankingdb-YYYYMMDD-HHMMSS.sql.gz \
  | MYSQL_PWD="$MYSQL_PASSWORD" mysql -h "$MYSQL_HOST" -P "${MYSQL_PORT:-3306}" -u "$MYSQL_USER" "$MYSQL_DATABASE"
```

For Kubernetes:

```bash
gzip -dc phoenix-ops/backups/mysql/bankingdb-YYYYMMDD-HHMMSS.sql.gz \
  | kubectl exec -i "$MYSQL_POD" -- env MYSQL_PWD="$MYSQL_PASSWORD" mysql -u "$MYSQL_USER" "$MYSQL_DATABASE"
```

## Security Notes

- Store backups outside web-served directories.
- Restrict backup directory permissions to the service account that runs the job.
- Do not commit backup files or real credentials.
- Test restore in a non-production environment before relying on backups for recovery.
