# Banking App Alerts

Phase 16.6 adds Prometheus and Alertmanager integration for the `banking-app` workload in the `default` namespace.

## Files

- `banking-app-alerts.yaml` creates a `PrometheusRule` with two alerts.
- `alertmanager-webhook-config.yaml` creates an `AlertmanagerConfig` that sends only allowed banking app alerts to the remediation webhook at `http://13.60.185.244:9090/alertmanager`.

## Alerts

### BankingAppDown

Fires when the `banking-app` deployment in the `default` namespace has fewer than one available replica for 2 minutes. It also fires if the deployment availability metric is missing, which can happen when the deployment or kube-state-metrics data disappears.

### BankingAppHighRestarts

Fires when a pod with `app=banking-app` in the `default` namespace restarts more than 3 times over 10 minutes and remains over the threshold for 5 minutes. The query joins restart counters with Kubernetes pod labels so the alert remains scoped to the banking app workload.

## Apply

Do not apply these automatically from automation. Apply manually when ready:

```bash
kubectl apply -f phoenix-ops/alerts/banking-app-alerts.yaml
kubectl apply -f phoenix-ops/alerts/alertmanager-webhook-config.yaml
```

The cluster must already have Prometheus Operator CRDs installed for `PrometheusRule` and `AlertmanagerConfig`.

## Verify

Check that the custom resources exist:

```bash
kubectl get prometheusrule banking-app-alerts -n default
kubectl get alertmanagerconfig banking-app-remediation-webhook -n default
```

Check whether Prometheus loaded the rules:

```bash
kubectl port-forward -n monitoring svc/prometheus-operated 9090:9090
```

Then open `http://localhost:9090/rules` and search for `banking-app.rules`, `BankingAppDown`, and `BankingAppHighRestarts`.

Check active or pending alerts:

```bash
kubectl port-forward -n monitoring svc/prometheus-operated 9090:9090
```

Then open `http://localhost:9090/alerts` and search for the banking app alert names.

## Manual Webhook Test

Send an allowed alert payload directly to the webhook:

```bash
curl -sS -X POST http://13.60.185.244:9090/alertmanager \
  -H 'Content-Type: application/json' \
  -d '{"alerts":[{"labels":{"alertname":"BankingAppDown","namespace":"default","app":"banking-app"},"annotations":{"summary":"Manual BankingAppDown test"}}]}'
```

Test the restart alert payload:

```bash
curl -sS -X POST http://13.60.185.244:9090/alertmanager \
  -H 'Content-Type: application/json' \
  -d '{"alerts":[{"labels":{"alertname":"BankingAppHighRestarts","namespace":"default","pod":"banking-app-manual-test","app":"banking-app"},"annotations":{"summary":"Manual BankingAppHighRestarts test"}}]}'
```

The webhook should accept these alert names and ignore alert names that are not explicitly allowed by the remediation service.
