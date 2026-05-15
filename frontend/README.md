# Zephyr React Frontend

React frontend scaffold for the banking application.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8080`.

## Build

```bash
npm run build
```

## Container

Build the production image from this directory:

```bash
docker build -t wajihahmed269/ai-banking-frontend:latest .
```

Run the container locally:

```bash
docker run --rm -p 8081:80 wajihahmed269/ai-banking-frontend:latest
```

Then open `http://localhost:8081`.

## Kubernetes

Apply the frontend Deployment and Service from the repository root:

```bash
kubectl apply -f k8s/frontend.yaml
```

Check rollout status:

```bash
kubectl rollout status deployment/banking-frontend
```
