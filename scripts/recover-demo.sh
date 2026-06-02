#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-default}"
AWS_REGION="${AWS_REGION:-eu-north-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
ECR_SECRET_NAME="${ECR_SECRET_NAME:-ecr-secret}"
BACKEND_DEPLOYMENT="${BACKEND_DEPLOYMENT:-banking-app}"
FRONTEND_DEPLOYMENT="${FRONTEND_DEPLOYMENT:-banking-frontend}"
FRONTEND_URL="${FRONTEND_URL:-http://<ec2-host>:30081}"

if [[ -z "$AWS_ACCOUNT_ID" ]]; then
  printf 'AWS_ACCOUNT_ID is required to refresh the ECR image pull secret.\n' >&2
  printf 'Example: AWS_ACCOUNT_ID=<account-id> AWS_REGION=%s bash scripts/recover-demo.sh\n' "$AWS_REGION" >&2
  exit 1
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

printf 'Refreshing ECR image pull secret %s in namespace %s for registry %s.\n' "$ECR_SECRET_NAME" "$NAMESPACE" "$ECR_REGISTRY"
aws ecr get-login-password --region "$AWS_REGION" \
  | kubectl create secret docker-registry "$ECR_SECRET_NAME" \
      --docker-server="$ECR_REGISTRY" \
      --docker-username=AWS \
      --docker-password-stdin \
      --namespace "$NAMESPACE" \
      --dry-run=client -o yaml \
  | kubectl apply -f -

printf '\nRestarting demo deployments.\n'
kubectl rollout restart deployment/"$BACKEND_DEPLOYMENT" -n "$NAMESPACE"
kubectl rollout restart deployment/"$FRONTEND_DEPLOYMENT" -n "$NAMESPACE"

printf '\nWaiting for backend rollout.\n'
kubectl rollout status deployment/"$BACKEND_DEPLOYMENT" -n "$NAMESPACE" --timeout=300s

printf '\nWaiting for frontend rollout.\n'
kubectl rollout status deployment/"$FRONTEND_DEPLOYMENT" -n "$NAMESPACE" --timeout=300s

printf '\nDeployment status in namespace %s:\n' "$NAMESPACE"
kubectl get deployments -n "$NAMESPACE"

printf '\nPod status in namespace %s:\n' "$NAMESPACE"
kubectl get pods -n "$NAMESPACE" -o wide

printf '\nFrontend URL: %s\n' "$FRONTEND_URL"
printf 'Recovery complete. Run scripts/smoke-demo.sh to verify the demo path endpoints.\n'
