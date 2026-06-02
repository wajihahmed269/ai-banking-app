# Zephyr Codex Agent Standards

These standards apply to Codex work in the Zephyr banking platform. Zephyr is a production-style AI banking system built around Spring Boot, React/Vite, Kubernetes on K3s, AWS EC2, ECR, GitHub Actions, Prometheus/Grafana/Loki, Ollama, JWT auth, runtime secrets, DevSecOps scanning, idempotent financial operations, and recovery scripts.

Codex must treat this repository as an operational banking platform, not a demo. Changes should preserve transaction safety, deployment reliability, secret hygiene, and debuggability.

## Project Philosophy

- Optimize for production behavior, not local convenience.
- Prefer boring, explicit, observable systems over clever shortcuts.
- Treat banking flows as correctness-sensitive: balances, transfers, payments, idempotency, authentication, and auditability are high-risk areas.
- Assume failures happen across replicas, during rollouts, after token expiry, and under partial infrastructure recovery.
- Keep frontend, backend, infrastructure, and security responsibilities separated unless the change explicitly crosses boundaries.
- Make the smallest change that fixes the real problem and can be validated.

## How Codex Must Reason Before Editing Code

Before changing application code, Codex must:

1. Identify the layer being changed: backend, frontend, Kubernetes, CI/CD, observability, or security.
2. Read the nearest existing implementation and follow its conventions.
3. Check whether the issue affects auth, money movement, idempotency, secrets, deployment, or observability.
4. Determine the expected validation command before editing.
5. Avoid changing unrelated files, generated artifacts, or application behavior outside the request.
6. Preserve user changes already present in the working tree.
7. Explain any production tradeoff if a fix weakens reliability, security, or validation.

For documentation-only requests, Codex must not modify application source, manifests, CI workflows, or scripts unless explicitly asked.

## Production-First Engineering Mindset

- A fix is incomplete until it can be built, tested, deployed, or operationally verified.
- Runtime configuration must work across multiple Kubernetes replicas.
- Secrets must come from runtime secret management or Kubernetes Secret references, not source code.
- Financial operations must be transactional, idempotent where applicable, and use precise decimal handling.
- Rollouts must be reversible and observable.
- Error handling must expose useful diagnostics without leaking secrets, tokens, internal stack traces, or customer-sensitive data.

## Operational Reliability Priorities

Priority order:

1. Protect customer money and transaction correctness.
2. Protect credentials, JWT signing material, and runtime secrets.
3. Keep authentication consistent across replicas.
4. Preserve deployability through GitHub Actions, ECR, and K3s.
5. Preserve observability through logs, metrics, dashboards, and alerts.
6. Keep frontend runtime stable and recoverable under API errors.
7. Improve local developer ergonomics only after production behavior is safe.

## Debugging Methodology

- Start with symptoms, timestamps, changed refs, and affected environment.
- Reproduce locally when possible before changing production-facing behavior.
- For backend failures, check Maven tests, Spring logs, validation errors, security filters, repository transactions, and database assumptions.
- For frontend failures, check browser console errors, network responses, auth/session state, build output, and component boundaries.
- For deployment failures, check image tag, ECR pull access, Kubernetes events, rollout status, pod logs, and readiness/liveness behavior.
- For security failures, check scanner output first, then confirm whether the finding is exploitable, suppressed, or requires dependency/configuration changes.
- Validate the fix with the narrowest relevant command, then broader checks when risk is high.

Useful baseline commands:

```bash
git status --short
./mvnw test
./mvnw verify
cd frontend && npm run lint
cd frontend && npm run build
kubectl get pods -n zephyr
kubectl describe pod -n zephyr <pod-name>
kubectl logs -n zephyr deployment/banking-app
```

## Deployment Safety Rules

- Do not deploy blindly from an unverified working tree.
- Do not reuse mutable or ambiguous image tags for production-style rollouts.
- Confirm image push, imagePullSecret validity, rollout status, readiness, and application logs.
- Treat ECR auth tokens as expiring credentials and refresh them before debugging false image pull failures.
- Never bypass rollout failures by increasing timeouts without understanding the blocked condition.
- Roll back before experimenting when a production-style environment is unhealthy.
- Keep recovery commands explicit and auditable.

## Infrastructure Rules

- Kubernetes manifests in `k8s/` must remain environment-aware and secret-safe.
- Do not hardcode EC2 hostnames, AWS credentials, database passwords, JWT secrets, or ECR tokens.
- Do not edit live cluster state as a substitute for updating version-controlled manifests unless the task is an emergency recovery step.
- Preserve namespace, selector, label, service, and deployment relationships.
- Check pod events when diagnosing rollout failures; pod logs alone are not enough.
- Recovery scripts under `phoenix-ops/` must remain safe to rerun and clear about what they restart, heal, or back up.

## Security Expectations

- Never commit secrets, JWT signing keys, database credentials, AWS keys, ECR auth material, SendGrid keys, Cloudinary credentials, or sample real tokens.
- Prefer runtime secret injection through AWS Secrets Manager, Kubernetes Secrets, or environment variables wired by deployment configuration.
- Logs must not include passwords, Authorization headers, JWTs, idempotency keys, raw secrets, or full customer-sensitive payloads.
- Maintain JWT consistency across replicas by using shared runtime signing configuration.
- Keep CORS restrictive and environment-specific.
- Run DevSecOps checks when touching dependencies, Dockerfiles, manifests, auth, or request handling.

Security validation commands:

```bash
gitleaks detect --source .
semgrep scan --config auto
./mvnw org.owasp:dependency-check-maven:check
trivy config .
trivy image <image-ref>
```

## Commit Standards

Codex must not commit or push unless the user explicitly asks.

When commits are requested:

- Check `git status --short` first.
- Include only files relevant to the requested change.
- Do not stage unrelated user changes.
- Use concise, behavior-focused commit messages.
- Mention validation performed in the final response.
- Never amend, rebase, reset, or force-push without explicit user instruction.

## Validation Expectations

- Backend changes: run `./mvnw test`; run `./mvnw verify` when dependencies, security, packaging, or integration behavior change.
- Frontend changes: run `npm run lint` and `npm run build` from `frontend/`.
- Kubernetes changes: run `kubectl apply --dry-run=client -f <file>` where possible, then verify rollout commands if deploying.
- Security changes: run relevant scanners and inspect findings before claiming success.
- Documentation-only changes: verify files exist and are markdown-only.

## Forbidden Shortcuts

- Do not replace transactional money logic with floating point arithmetic.
- Do not bypass idempotency for deposits, withdrawals, transfers, or payments.
- Do not hardcode secrets, tokens, cluster credentials, or environment-specific production values.
- Do not disable authentication, CORS, scanners, validation, tests, readiness probes, or security filters to make a build pass.
- Do not swallow exceptions with empty catches or generic success responses.
- Do not ignore Kubernetes rollout failures or image pull errors.
- Do not introduce hidden external API dependence for Ollama-backed AI flows.
- Do not modify application code during documentation-only tasks.

