# Zephyr Demo Stability Runbook

This runbook defines the current stable demo path for Zephyr and the operational steps required to keep the deployed demo from serving stale frontend bundles.

## Stable Demo Path

The supported demo path is:

```text
open site -> signup/login -> dashboard -> add money -> pay bill -> transaction history
```

Expected behavior:

- Signup/login completes and returns the user to an authenticated dashboard session.
- Dashboard renders without a black screen or runtime `ReferenceError`.
- Add Money posts a successful deposit or prototype deposit, updates the visible balance, prepends a transaction, and opens a receipt.
- Pay Bills posts a successful payment or prototype payment, decrements the visible balance, prepends a transaction, and opens a receipt.
- Transaction History reflects the latest add-money and bill-payment entries after successful actions.
- Balance reflects the latest successful add-money and bill-payment actions.

## Known Ignored Areas

These areas are intentionally out of scope for the current demo stabilization pass:

- AI assistant behavior.
- Transfer correctness, unless it breaks shared balance or transaction rendering.
- Broad UI redesign.
- Backend idempotency enforcement.

Idempotency remains off for this stabilization pass. Do not re-enable mandatory `Idempotency-Key` validation or strict backend idempotency enforcement unless that is explicitly requested later.

## Frontend Black Screen Prevention

`SectionErrorBoundary` must be declared in its own component file:

```text
frontend/src/components/ui/SectionErrorBoundary.jsx
```

`App.jsx` must import it directly:

```jsx
import { SectionErrorBoundary } from './components/ui/SectionErrorBoundary';
```

Do not hide runtime crashes by removing section boundaries. If a future black screen appears, first check:

```bash
rg -n "SectionErrorBoundary|ReferenceError|Component" frontend/src
cd frontend && npm run build
```

## Immutable Frontend Image Deployment

Do not rely on `latest` for frontend demo recovery or deployment. Use a git SHA tag so the deployed bundle is tied to the exact source revision.

Use this tag source:

```bash
TAG=$(git rev-parse --short HEAD)
```

Build and push the frontend image with an immutable tag:

```bash
TAG=$(git rev-parse --short HEAD)
docker build -t <frontend-registry>/ai-banking-frontend:${TAG} -f frontend/Dockerfile frontend
docker push <frontend-registry>/ai-banking-frontend:${TAG}
```

Deploy that exact image to K3s:

```bash
TAG=$(git rev-parse --short HEAD)
kubectl set image deployment/banking-frontend \
  banking-frontend=<frontend-registry>/ai-banking-frontend:${TAG} \
  -n default
kubectl rollout status deployment/banking-frontend -n default --timeout=300s
kubectl get pods -n default -l app=banking-frontend -o wide
```

If the frontend image is moved to ECR, use the ECR registry explicitly:

```bash
TAG=$(git rev-parse --short HEAD)
FRONTEND_IMAGE=<aws-account-id>.dkr.ecr.<region>.amazonaws.com/<frontend-ecr-repository>:${TAG}
docker build -t "$FRONTEND_IMAGE" -f frontend/Dockerfile frontend
docker push "$FRONTEND_IMAGE"
kubectl set image deployment/banking-frontend banking-frontend="$FRONTEND_IMAGE" -n default
kubectl rollout status deployment/banking-frontend -n default --timeout=300s
```

Do not update the demo to a new frontend image until `cd frontend && npm run build` passes.

## Smoke Test Usage

Run the lightweight endpoint and pod smoke check from the repository root:

```bash
bash scripts/smoke-demo.sh
```

Defaults:

- Frontend: `http://localhost:30081`
- Backend: `http://localhost:30080`
- Namespace: `default`

Override values when needed:

```bash
FRONTEND_URL=http://<ec2-host>:30081 \
BACKEND_URL=http://<ec2-host>:30080 \
NAMESPACE=default \
bash scripts/smoke-demo.sh
```

The smoke script intentionally avoids credentials and only prints endpoint, deployment, and pod status.

## Recovery Steps

Use the recovery script when the demo is healthy at the pod level but may be serving stale frontend images, or after ECR token expiry symptoms appear.

```bash
AWS_ACCOUNT_ID=<aws-account-id> \
AWS_REGION=<region> \
FRONTEND_URL=http://<ec2-host>:30081 \
bash scripts/recover-demo.sh
```

The recovery script:

- Refreshes the ECR image pull secret without printing the token.
- Restarts `banking-app` and `banking-frontend` deployments.
- Waits for both rollouts to complete.
- Prints deployment and pod status.
- Prints the frontend URL placeholder or provided URL.

After recovery, run:

```bash
bash scripts/smoke-demo.sh
```

Then manually verify the stable demo path in the browser:

```text
open site -> signup/login -> dashboard -> add money -> pay bill -> transaction history
```

## Known Limitations

- The smoke script verifies endpoint reachability and Kubernetes status; it does not perform browser automation or financial API mutation tests.
- The AI assistant is intentionally ignored for this stabilization pass.
- Transfer correctness is intentionally ignored unless it breaks shared dashboard balance or transaction rendering.
- Current frontend manifest examples may still show `latest`; the operational deployment command must use the immutable git SHA tag shown above.
- Backend idempotency enforcement remains off for this pass.
