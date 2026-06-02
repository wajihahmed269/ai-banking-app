# Security Agent Standards

These standards apply to secrets, authentication, authorization, dependency scanning, container scanning, Kubernetes security, logging, and OWASP-minded review across Zephyr.

## Secrets Handling

- No secrets belong in source code, markdown, manifests, logs, screenshots, tests, or sample payloads.
- Prohibited values include AWS keys, ECR tokens, JWT signing secrets, database passwords, SMTP credentials, SendGrid keys, Cloudinary credentials, Ollama private endpoints, kubeconfigs, and real bearer tokens.
- Use placeholders such as `<jwt-secret>`, `<db-password>`, `<aws-account-id>`, and `<region>` in docs.
- Rotate any secret suspected of exposure before treating cleanup as complete.
- Use Gitleaks before commits that touch configuration, manifests, CI, docs, or authentication.

## Runtime Secrets Rules

- Runtime secrets must come from AWS Secrets Manager, Kubernetes Secrets, environment variables, or an approved runtime injection path.
- JWT signing configuration must be stable across replicas.
- Do not generate production JWT secrets during application startup.
- Do not bake secrets into Docker images.
- Do not store generated secret manifests with real values.
- `k8s/secret.yaml.template` must remain a template and must not contain live credentials.

## JWT And CORS Expectations

- JWT validation must reject expired, malformed, unsigned, weakly signed, or tampered tokens.
- Authorization headers and token contents must never be logged.
- Token expiry should be enforced consistently across backend replicas.
- CORS must be restrictive and environment-specific.
- Do not use wildcard CORS with credentialed requests.
- Frontend auth/session handling must clear invalid sessions and avoid exposing tokens in console output.

## Dependency Scanning

- Backend dependency changes require OWASP Dependency Check review.
- Frontend dependency changes require npm audit awareness and production build validation.
- Container and Kubernetes changes require Trivy image/config scanning where practical.
- Scanner findings must be classified as fixed, accepted with documented reason, or suppressed through approved project mechanisms.
- Do not lower scanner severity thresholds to pass CI without explicit approval.

## Required Security Tools

Use these commands when relevant:

```bash
gitleaks detect --source .
semgrep scan --config auto
./mvnw org.owasp:dependency-check-maven:check
trivy fs .
trivy config .
trivy image <image-ref>
cd frontend && npm audit
```

Use targeted scans during development, then full scans before claiming security-sensitive work is complete.

## Authentication Safety

- Passwords must be handled through secure hashing and never returned in API responses.
- Login responses should include only necessary auth/session fields.
- Authentication errors should not reveal whether a username, email, or password specifically failed unless the product explicitly accepts that risk.
- Protected API endpoints must require authentication through Spring Security.
- Financial actions must validate the authenticated principal against the account or user being modified.
- Frontend should treat the backend as authoritative for permissions and balances.

## OWASP Mindset

Review changes against common OWASP risks:

- Broken access control.
- Cryptographic failures.
- Injection through SQL, logs, shell commands, or user-controlled URLs.
- Insecure design around money movement and idempotency.
- Security misconfiguration in CORS, Kubernetes, Docker, or Spring Security.
- Vulnerable dependencies.
- Authentication and session failures.
- Integrity failures in CI/CD, images, and deployment manifests.
- Insufficient logging and monitoring.

Security review must include both code and operational behavior.

## Logging Restrictions

Never log:

- Passwords or password reset material.
- Authorization headers.
- JWTs or decoded sensitive claims.
- AWS credentials or ECR auth material.
- Database URLs containing credentials.
- Raw Kubernetes Secret values.
- Full customer-sensitive request bodies.
- Idempotency keys when they can be used to correlate or replay financial actions.

Logs should include safe context such as request path, operation type, user/account identifier only when appropriate, status, timing, and sanitized error category.

## Secret Exposure Prevention

- Check staged diffs before any commit.
- Run Gitleaks before pushing configuration, docs, manifests, CI, or auth changes.
- Keep `.env`, generated kubeconfig, generated secret YAML, and scanner reports with sensitive data out of commits.
- If a secret is exposed, rotate it first, then remove it from the repo, then verify history and CI logs.
- Do not paste real secrets into issues, PR comments, markdown docs, or final responses.

## DevSecOps Scanning Usage

- Gitleaks: detect committed or working-tree secret exposure.
- Semgrep: detect insecure code patterns and framework misuse.
- OWASP Dependency Check: detect vulnerable Java dependencies from Maven.
- Trivy image: detect OS/package vulnerabilities in built containers.
- Trivy config: detect insecure IaC/Kubernetes/Dockerfile configuration.
- OWASP ZAP: validate deployed runtime web/API exposure where configured in CI.

Expected CI posture:

```text
Gitleaks -> Checkstyle -> Semgrep -> OWASP Dependency Check
-> Maven Build -> Trivy Container Scan -> Push to AWS ECR
-> Kubernetes Deployment -> OWASP ZAP DAST
```

## Forbidden Security Mistakes

- Committing secrets or replacing real secrets with different real secrets.
- Logging tokens, passwords, secrets, database credentials, or sensitive financial payloads.
- Disabling Spring Security, JWT validation, CORS restrictions, or scanners to unblock a build.
- Using wildcard CORS with credentials.
- Using weak, generated, or per-pod JWT secrets in deployed environments.
- Trusting frontend authorization checks as sufficient.
- Returning passwords, password hashes, internal auth errors, stack traces, or SQL details to clients.
- Ignoring high or critical scanner findings without documented justification.
- Baking credentials into Docker images or Kubernetes manifests.
- Treating secret removal from the latest commit as sufficient after public exposure; rotation is mandatory.

