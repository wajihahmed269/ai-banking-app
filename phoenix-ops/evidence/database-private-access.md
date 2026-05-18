# Database Private Access Evidence

Date/time checked: 2026-05-18T19:20:03Z

## Commands Run

```bash
kubectl get svc -A
kubectl get pods -A
kubectl get endpoints -A | grep -i mysql || true
kubectl describe svc mysql || true
kubectl describe svc mysql-service || true
ss -tulpn | grep -E '3306|mysql' || true
sudo ss -tulpn
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
```

## Observations

- No active Kubernetes service named `mysql` was found.
- No active Kubernetes service named `mysql-service` was found.
- `kubectl get svc -A` did not show a MySQL `NodePort` or `LoadBalancer`.
- `kubectl get endpoints -A | grep -i mysql` returned no MySQL endpoint rows.
- The checked Kubernetes MySQL manifest now declares `type: ClusterIP` for `mysql-service`.
- Host socket inspection showed port `3306` listening on `0.0.0.0:3306` and `[::]:3306`.
- `sudo ss -tulpn` identified Docker proxy processes publishing port `3306`.
- `docker ps` showed a running `mysql-banking` container with `0.0.0.0:3306->3306/tcp` and `[::]:3306->3306/tcp`.

## Conclusion

Kubernetes MySQL exposure is private or inactive in the current cluster view. There is no active Kubernetes MySQL `NodePort` or `LoadBalancer`.

However, MySQL is currently exposed at the host Docker layer through the `mysql-banking` container publishing port `3306` on all IPv4 and IPv6 interfaces. This is not controlled by the current Kubernetes MySQL service manifest.

## Risk Notes

- Treat the Docker-published MySQL port as externally reachable unless host firewall or cloud security-group rules prove otherwise.
- Do not stop or remove the container without a maintenance window and data backup.
- Recommended follow-up: move this MySQL instance behind an internal Docker network only, bind it to `127.0.0.1`, or migrate fully to the private Kubernetes/RDS path.
- Keep Kubernetes MySQL service manifests as `ClusterIP` only.
