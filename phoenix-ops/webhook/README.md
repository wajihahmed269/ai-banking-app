# Alertmanager Remediation Webhook

Small Flask webhook for Phase 16.5 Alertmanager automation. It accepts Alertmanager JSON payloads on `POST /alertmanager` and only runs remediation for these alert names:

- `BankingAppDown`
- `BankingAppHighRestarts`

Allowed alerts run `phoenix-ops/remediation/heal-banking-app.sh`. Each run captures stdout and stderr in `phoenix-ops/evidence/remediation-run-<timestamp>.log`.

## Install

```bash
cd phoenix-ops/webhook
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
cd ../..
python3 phoenix-ops/webhook/remediation-webhook.py
```

The service listens on port `8080` by default.

## Test

Send an allowed alert:

```bash
curl -sS -X POST http://localhost:8080/alertmanager \
  -H 'Content-Type: application/json' \
  -d '{"alerts":[{"labels":{"alertname":"BankingAppDown"}}]}'
```

Send an ignored alert:

```bash
curl -sS -X POST http://localhost:8080/alertmanager \
  -H 'Content-Type: application/json' \
  -d '{"alerts":[{"labels":{"alertname":"UnapprovedAlert"}}]}'
```

This webhook does not call `aws`, delete Kubernetes resources, or modify secrets. Do not expose it publicly without network controls and Alertmanager routing constraints.
