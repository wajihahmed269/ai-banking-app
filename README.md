# Zephyr

A production-style banking application powered by self-hosted AI.

Zephyr is a banking backend I built to get reps on the parts of engineering that most tutorials skip — Kubernetes failure modes, distributed auth, observability, and running AI locally instead of hitting an API.

---

## Why This Project Exists

Most banking demos stop at auth + CRUD. Zephyr exists to go further.

The things I actually wanted to understand: how Kubernetes deployments break in production, why JWT auth falls apart across replicas, what it takes to instrument a backend properly, and how to run a local LLM without depending on OpenAI.

This isn't a fake fintech startup. It's an engineering lab with a banking domain.

---

## Current Features

### Banking

* JWT authentication
* Balance management, deposits, withdrawals
* Money transfer with row locking
* Bill payment flows
* Transaction history and receipt UI
* Notification system
* Dashboard analytics

### Frontend

* Dark UI with responsive dashboard layout
* Animated landing page
* Performance/lite mode toggle
* Transaction search and filtering
* Glassmorphism-inspired design system

### Backend

* Spring Boot services
* Transactional money operations with row locking during transfers
* JWT security flow
* MySQL persistence
* Idempotency protection for financial operations
* Runtime secret integration

### Infrastructure

* Docker-based local development
* Kubernetes manifests
* GitHub Actions CI/CD
* AWS deployment workflows
* Prometheus, Grafana, and Loki observability stack

### AI

* Self-hosted Ollama integration
* AI assistant support workflows

---

## Architecture

Zephyr is built with a production-style mindset. Current experiments include:

* Kubernetes-native deployments
* Runtime secret injection via AWS Secrets Manager
* Observability-driven debugging
* Transaction safety and idempotency enforcement
* Distributed authentication consistency across replicas
* Backup and recovery with Kubernetes CronJobs
* Security-focused CI/CD pipelines

This is actively evolving — not a finished product.

---

## Engineering Problems Solved

A lot of the learning here came from things that broke during actual deployment:

* JWT tokens going inconsistent across Kubernetes replicas
* Secret normalization with AWS Secrets Manager
* Kubernetes rollout timeouts blocking CI deployments
* Deployment manifest handoff issues in GitHub Actions
* Git history cleanup after credential exposure
* CORS issues across the frontend/backend split
* Migrating from `double` to `BigDecimal` for money handling
* Idempotency enforcement on financial transactions
* Splitting apart a massive frontend App.jsx structure

---

## DevSecOps Pipeline

The CI/CD pipeline runs through GitHub Actions with security checks at each stage:

```text
Gitleaks → Checkstyle → Semgrep → OWASP Dependency Check
→ Maven Build → Trivy Container Scan → Push to AWS ECR
→ Kubernetes Deployment → OWASP ZAP DAST
```

The pipeline covers:

* Secret scanning
* Static analysis
* Dependency auditing
* Container vulnerability scanning
* Kubernetes deployment validation
* Runtime DAST testing

---

## Stack

| Layer          | Tools                         |
| -------------- | ----------------------------- |
| Backend        | Spring Boot, JWT, MySQL       |
| Frontend       | React, Vite                   |
| Infrastructure | Docker, Kubernetes, Terraform |
| Observability  | Prometheus, Grafana, Loki     |
| CI/CD & GitOps | GitHub Actions, Argo CD       |
| AI             | Ollama                        |

---

## Local Development

```bash
git clone git@github.com:wajihahmed269/ai-banking-app.git
cd ai-banking-app
```

### Backend

```bash
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Docker and Kubernetes manifests are included for containerized workflows.

---

## Security Notes

This project is under active development. Work completed so far includes:

* Runtime secret management with AWS Secrets Manager
* Idempotency protection on transactions
* Kubernetes secret hygiene
* Multi-replica JWT consistency fixes
* Git history cleanup after test credential exposure
* Security-focused CI/CD validation

If secrets were committed during development, rotate them before any production or public usage.

---

## Deployment

No permanent public deployment is maintained.

The project runs locally or on EC2 for infrastructure testing. Keeping a full Kubernetes environment running continuously during active development is unnecessarily expensive for the current stage of the project.

---

## In Progress

* Frontend architecture cleanup
* Automatic idempotency key handling
* Full BigDecimal migration for money operations
* Backend rate limiting improvements
* Kubernetes CronJob backups
* Argo CD GitOps workflows
* SendGrid and Cloudinary integration
* AI guardrails for support workflows
* Observability improvements

---

## What This Project Is Not

Zephyr is not intended to be a production bank or a polished SaaS product.

The purpose of the project is to explore operational engineering problems in a realistic domain:

* Distributed authentication
* Deployment reliability
* Runtime secret management
* Kubernetes behavior under failure
* Transaction safety
* DevSecOps workflows
* AI integration without third-party APIs

The focus is infrastructure maturity and operational learning, not fintech product development.

---

## Contact

Email: [wajih.ahmed100000@gmail.com](mailto:wajih.ahmed100000@gmail.com)

GitHub: [https://github.com/wajihahmed269](https://github.com/wajihahmed269)

LinkedIn: [https://www.linkedin.com/in/wajih-ahmed-269/](https://www.linkedin.com/in/wajih-ahmed-269/)


