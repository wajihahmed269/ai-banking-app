# Phoenix-Ops Remediation Webhook systemd Service

## Install

```bash
sudo cp /home/ubuntu/ai-banking-app/phoenix-ops/systemd/phoenix-remediation-webhook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable phoenix-remediation-webhook.service
```

## Start, Stop, and Status

```bash
sudo systemctl start phoenix-remediation-webhook.service
sudo systemctl stop phoenix-remediation-webhook.service
sudo systemctl restart phoenix-remediation-webhook.service
sudo systemctl status phoenix-remediation-webhook.service
```

## Logs

```bash
sudo journalctl -u phoenix-remediation-webhook.service
sudo journalctl -u phoenix-remediation-webhook.service -f
sudo journalctl -u phoenix-remediation-webhook.service --since "1 hour ago"
```

## Test

```bash
curl -sS -X POST http://localhost:9090/alertmanager \
  -H "Content-Type: application/json" \
  -d '{"alerts":[{"labels":{"alertname":"BankingAppDown"}}]}' | jq
```

## Ignored Alert Test

```bash
curl -sS -X POST http://localhost:9090/alertmanager \
  -H "Content-Type: application/json" \
  -d '{"alerts":[{"labels":{"alertname":"RandomAlert"}}]}' | jq
```
