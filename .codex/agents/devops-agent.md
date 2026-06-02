# DevOps Agent Standards

These standards apply to Zephyr deployment, Kubernetes, AWS EC2, ECR, GitHub Actions, observability, and recovery work. Relevant paths include `k8s/`, `Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`, `trivy.yaml`, and `phoenix-ops/`.

## Kubernetes Deployment Expectations

- Treat K3s as a production-style cluster even when running on a single EC2 host.
- Keep manifests in `k8s/` version-controlled and environment-aware.
- Preserve deployment labels, selectors, services, ports, readiness expectations, and secret references.
- Use Kubernetes Secrets or runtime secret integration for sensitive values.
- Do not put raw credentials in `k8s/secret.yaml.template` or generated manifests.
- Verify that backend, frontend, MySQL, and supporting services can recover after pod restarts.

## Rollout Safety

- Confirm the image tag exists in ECR before applying manifests.
- Refresh ECR pull credentials before diagnosing image pull errors.
- Use `kubectl rollout status` and inspect events for failures.
- Do not hide rollout failures by only increasing timeouts.
- Prefer rolling updates with readiness gates over disruptive restarts.
- Keep rollback paths known before applying high-risk changes.

## imagePullSecret Handling

- ECR auth tokens expire. Treat `imagePullSecret` failures as potentially credential-related before assuming image or manifest defects.
- Regenerate the pull secret when `ImagePullBackOff`, `ErrImagePull`, or expired token symptoms appear.
- Keep the secret scoped to the deployment namespace.
- Do not commit generated Docker config JSON or ECR auth tokens.

Common refresh pattern:

```bash
aws ecr get-login-password --region <region> \
  | kubectl create secret docker-registry ecr-registry-secret \
    --docker-server=<account-id>.dkr.ecr.<region>.amazonaws.com \
    --docker-username=AWS \
    --docker-password-stdin \
    --namespace zephyr \
    --dry-run=client -o yaml \
  | kubectl apply -f -
```

## GitHub Actions Deployment Flow

Expected production-style flow:

```text
Gitleaks -> Checkstyle -> Semgrep -> OWASP Dependency Check
-> Maven Build -> Trivy Container Scan -> Push to AWS ECR
-> Kubernetes Deployment -> OWASP ZAP DAST
```

- Scanner failures must be investigated, not bypassed.
- Build artifacts and deployment manifests must reference the intended image tag.
- Deployment jobs must verify rollout completion and fail loudly on unhealthy pods.
- Avoid workflow edits that weaken scanning, secret handling, or rollback visibility.

## EC2 Recovery Process

- Start with host health: disk, memory, CPU, systemd services, and K3s status.
- Confirm K3s node readiness before changing application manifests.
- Check MySQL pod/storage health before restarting the backend repeatedly.
- Use recovery scripts in `phoenix-ops/remediation/` and backup scripts in `phoenix-ops/scripts/` intentionally.
- Preserve evidence under `phoenix-ops/evidence/` when documenting operational incidents.

Useful commands:

```bash
ssh <ec2-user>@<host>
sudo systemctl status k3s
kubectl get nodes -o wide
kubectl get pods -A
kubectl get events -n zephyr --sort-by=.lastTimestamp
df -h
free -m
```

## Observability Expectations

- Prometheus, Grafana, and Loki should be used to validate behavior, not only postmortem failures.
- Backend changes should preserve useful structured logs without exposing secrets.
- Deployment changes should keep labels and service names stable for metrics and log selection.
- Alerts under `phoenix-ops/alerts/` must stay actionable and tied to real recovery steps.
- Recovery scripts should produce enough output to confirm what was checked and changed.

## Rollback Procedure

Use rollback when rollout health is degraded and the root cause is not immediately correctable.

```bash
kubectl rollout history deployment/banking-app -n zephyr
kubectl rollout undo deployment/banking-app -n zephyr
kubectl rollout status deployment/banking-app -n zephyr --timeout=180s
kubectl get pods -n zephyr -o wide
kubectl logs -n zephyr deployment/banking-app --tail=100
```

For frontend:

```bash
kubectl rollout history deployment/frontend -n zephyr
kubectl rollout undo deployment/frontend -n zephyr
kubectl rollout status deployment/frontend -n zephyr --timeout=180s
```

Confirm service health after rollback; do not assume rollback succeeded because the command returned.

## Rollout Verification

```bash
kubectl get deployments -n zephyr
kubectl rollout status deployment/banking-app -n zephyr --timeout=180s
kubectl rollout status deployment/frontend -n zephyr --timeout=180s
kubectl get pods -n zephyr -o wide
kubectl describe pod -n zephyr <pod-name>
kubectl logs -n zephyr deployment/banking-app --tail=100
kubectl logs -n zephyr deployment/frontend --tail=100
kubectl get svc -n zephyr
```

When debugging image pulls:

```bash
kubectl describe pod -n zephyr <pod-name>
kubectl get secret ecr-registry-secret -n zephyr
kubectl get events -n zephyr --sort-by=.lastTimestamp
```

## Recovery Commands

Use these only after confirming the target namespace and deployment names:

```bash
kubectl scale deployment/banking-app -n zephyr --replicas=0
kubectl scale deployment/banking-app -n zephyr --replicas=2
kubectl rollout restart deployment/banking-app -n zephyr
kubectl rollout restart deployment/frontend -n zephyr
kubectl delete pod -n zephyr <pod-name>
bash phoenix-ops/remediation/heal-banking-app.sh
bash phoenix-ops/scripts/backup-mysql.sh
```

Deleting pods is acceptable for recovery only when controllers will recreate them and stateful data is protected.

## Forbidden Infrastructure Practices

- Committing AWS credentials, ECR tokens, kubeconfigs, Docker config JSON, or generated secrets.
- Editing live cluster state without preserving the manifest-backed source of truth.
- Ignoring `ImagePullBackOff`, `CrashLoopBackOff`, failed readiness, or rollout timeout events.
- Restarting pods repeatedly without reading logs and events.
- Removing readiness checks, security scans, or deployment verification to make CI pass.
- Using `latest` for production-style deployment image references.
- Hardcoding EC2 hostnames, account IDs, regions, or private infrastructure values in reusable docs or manifests.
- Running destructive recovery commands without confirming namespace, target, and data impact.

