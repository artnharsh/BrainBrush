# BrainBrush DevOps — Complete Explainer (Viva / Interview Guide)

> **Purpose**: This document explains everything we built, why we built it, and how it works — in plain language. Use this to revise before your viva or interview.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What We Built (and Why)](#2-what-we-built-and-why)
3. [CI/CD Pipeline Deep Dive](#3-cicd-pipeline-deep-dive)
4. [Docker & Containerization](#4-docker--containerization)
5. [Infrastructure as Code](#5-infrastructure-as-code)
6. [Monitoring & Observability](#6-monitoring--observability)
7. [SRE Practices](#7-sre-practices)
8. [Kubernetes](#8-kubernetes)
9. [Tools Summary Table](#9-tools-summary-table)
10. [Common Viva Questions & Answers](#10-common-viva-questions--answers)
11. [Commands Cheat Sheet](#11-commands-cheat-sheet)
12. [Troubleshooting & Gotchas](#12-troubleshooting--gotchas)

---

## 1. Project Overview

**BrainBrush** is a real-time multiplayer drawing and guessing game (like Skribbl.io).

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express 5 + Socket.IO + TypeScript
- **Database**: MongoDB (user data, game history) + Redis (session/room state)
- **Auth**: Google OAuth 2.0 with JWT tokens

### How the Game Works
1. User signs in with Google
2. Creates or joins a room with a code
3. One player draws on a shared canvas (real-time via WebSockets)
4. Others guess the word in chat
5. Points are awarded, rounds rotate, game ends with a scoreboard

### What Makes This a DevOps Project
We've wrapped this application in a **complete DevOps lifecycle**:
- **CI/CD**: Automated testing and deployment on every git push
- **Containerization**: Everything runs in Docker containers
- **Infrastructure as Code**: AWS resources defined in Terraform
- **Configuration Management**: Servers configured via Ansible
- **Monitoring**: Prometheus + Grafana track app health
- **SRE**: Defined SLOs, error budgets, and incident procedures

---

## 2. What We Built (and Why)

| Component | What It Is | Why We Need It |
|-----------|-----------|---------------|
| **Health Endpoint** (`/health`) | Returns app status, DB state, memory | Used by Docker, K8s probes, CI verification, and monitoring to know if the app is alive |
| **Metrics Endpoint** (`/metrics`) | Exposes Prometheus-format metrics | Prometheus scrapes this every 15s to collect performance data |
| **Metrics Middleware** | Express middleware on every request | Automatically counts requests, measures latency, tracks errors — feeds data to `/metrics` |
| **Unit Tests** (Jest) | Automated tests for health & app routes | CI pipeline runs these; if tests fail, deployment is blocked |
| **GitHub Actions CI/CD** | Automated pipeline triggered on `git push` | No manual deployment — code goes from commit to production automatically |
| **Prometheus** | Time-series database for metrics | Stores and queries metrics data; powers alert rules |
| **Grafana** | Dashboard visualization tool | Makes metrics visual — graphs, gauges, status panels |
| **Node Exporter** | Exposes system metrics (CPU/RAM/disk) | Gives infrastructure visibility alongside app metrics |
| **Alert Rules** | Prometheus rules that fire on conditions | Automatically detects issues (high error rate, downtime, resource exhaustion) |
| **Kubernetes Manifests** | K8s deployment configs | Demonstrates container orchestration — auto-scaling, self-healing, rolling updates |
| **SRE Documentation** | SLIs, SLOs, error budgets, runbooks | Formalizes reliability practices and incident response |

---

## 3. CI/CD Pipeline Deep Dive

### What is CI/CD?
- **CI (Continuous Integration)**: Automatically build and test code every time someone pushes changes. Catches bugs early.
- **CD (Continuous Delivery/Deployment)**: Automatically deploy tested code to production. Reduces manual effort and human error.

### Our Pipeline (GitHub Actions)

**File**: `.github/workflows/ci-cd.yml`

**Trigger**: Every `git push` to the `main` branch.

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────────┐    ┌──────────┐    ┌────────┐
│ SOURCE  │ →  │  BUILD  │ →  │  TEST   │ →  │ CONTAINERIZE │ →  │  DEPLOY  │ →  │ VERIFY │
│Checkout │    │npm ci   │    │Jest     │    │Docker build  │    │SSH+pull  │    │/health │
│+ cache  │    │tsc+vite │    │tests    │    │push to Hub   │    │compose up│    │check   │
└─────────┘    └─────────┘    └─────────┘    └──────────────┘    └──────────┘    └────────┘
```

### Stage-by-Stage Walkthrough

#### Stage 1: Source
```yaml
- uses: actions/checkout@v4       # Downloads our code from GitHub
- uses: actions/setup-node@v4     # Installs Node.js 20
- uses: actions/cache@v4          # Caches node_modules (faster builds)
```
**What happens**: The runner (a temporary Linux VM on GitHub's servers) pulls our repository code and sets up Node.js.

**Why caching**: Without caching, `npm install` downloads ~200MB of packages every time. With caching, it only downloads if `package-lock.json` changed.

#### Stage 2: Build
```yaml
- run: npm ci                     # Install exact versions from lock file
- run: npm run build              # TypeScript → JavaScript (tsc)
```
**What happens**: Dependencies are installed and TypeScript is compiled. If there are type errors, the build fails and the pipeline stops.

**`npm ci` vs `npm install`**: `npm ci` is faster and deterministic — it installs exact versions from `package-lock.json` and deletes `node_modules` first. Ideal for CI.

#### Stage 3: Test
```yaml
- run: npm test                   # Runs Jest unit tests 
```
**What happens**: Jest runs all `*.test.ts` files. We test:
- Health endpoint returns correct JSON shape
- Root route returns 200
- 404 handler works for unknown routes
- Memory is reported in correct format

**If tests fail**: The pipeline **stops here**. No Docker image is built, no deployment happens. This is the safety gate.

#### Stage 4: Containerize
```yaml
- uses: docker/build-push-action@v6
  with:
    context: ./frontend
    tags: |
      caliber001/brainbrush-frontend:latest
      caliber001/brainbrush-frontend:${{ github.sha }}
    build-args: |
      VITE_API_BASE_URL=${{ secrets.BACKEND_URL }}
```
**What happens**: Docker Buildx builds images using our Dockerfiles, then pushes them to Docker Hub. We pass `VITE_API_BASE_URL` as a build argument so the React app knows where the backend lives.

**Two tags**:
- `:latest` — always the newest build (used by default)
- `:abc123` (commit SHA) — specific version for rollbacks ("go back to the version from 2 days ago")

**Why this only runs on `push` (not PRs)**: We don't want every PR to push images. PRs only run build+test to validate the code.

#### Stage 5: Deploy
```yaml
- name: Deploy application with Ansible
  run: |
    ansible-playbook -i "$RUNNER_TEMP/inventory.ini" ansible/deploy.yml \
      --extra-vars "@$RUNNER_TEMP/ansible-vars.json"
```
**What happens**: Instead of running raw Docker commands, the pipeline installs Ansible on the GitHub runner, securely sets up SSH keys, and runs our `ansible/deploy.yml` playbook. The playbook logs into the EC2 server, pulls the new images, and safely restarts the containers using Docker Compose.

#### Stage 6: Verify
```yaml
- run: |
    for attempt in $(seq 1 12); do
      status=$(curl --silent --write-out '%{http_code}' "${BACKEND_URL}/health")
      if [ "$status" = "200" ]; then exit 0; fi
      sleep 5
    done
    exit 1
```
**What happens**: After deployment, a retry loop repeatedly hits the `/health` endpoint (up to 12 times). If it returns `200 OK`, the deployment succeeded. If it times out or returns an error, the pipeline fails, alerting us that the deployment broke production.

---

## 4. Docker & Containerization

### What is Docker?
Docker packages your application + its dependencies into a **container** — a lightweight, portable, isolated environment. "Works on my machine" becomes "works everywhere."

### Our Docker Setup

#### Backend Dockerfile
```dockerfile
FROM node:22-alpine          # Lightweight Node.js base image
WORKDIR /app                 # Set working directory
COPY package*.json ./        # Copy package files first
RUN npm install              # Install deps (cached if package.json unchanged)
COPY . .                     # Copy source code
RUN npm run build            # Compile TypeScript
EXPOSE 5000
CMD ["npm", "start"]         # Start the server
```
**Key concept**: Docker layer caching. By copying `package.json` before source code, Docker reuses the `npm install` layer if only code changed (not dependencies).

#### Frontend Dockerfile (Multi-Stage Build)
```dockerfile
# STAGE 1: Build
FROM node:22-alpine as build
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE_URL                 # Inject backend URL at build time
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build                     # Outputs to /dist

# STAGE 2: Serve
FROM nginx:alpine                     # Tiny web server
COPY nginx.conf /etc/nginx/conf.d/default.conf # Custom routing rules
COPY --from=build /app/dist /usr/share/nginx/html
```
**Why multi-stage?** The build stage needs Node.js (large image ~300MB). The serve stage only needs Nginx (tiny ~25MB). We copy just the built files and our custom `nginx.conf`, resulting in a much smaller and more secure final image.

### Docker Compose vs Kubernetes

| Feature | Docker Compose | Kubernetes |
|---------|---------------|------------|
| **Complexity** | Simple YAML | Complex, many resources |
| **Scale** | Single machine | Multi-machine clusters |
| **Auto-healing** | No (manual restart) | Yes (restarts crashed pods) |
| **Auto-scaling** | No | Yes (HPA) |
| **Use case** | Dev, small deployments | Production at scale |

We use **Docker Compose for deployment** (single EC2) and have **Kubernetes manifests ready** for when we need to scale.

---

## 5. Infrastructure as Code

### Terraform — "What infrastructure to create"

**What it does**: Defines AWS resources (VPC, EC2 instance, security groups) in code. You run `terraform apply` and it creates everything automatically.

**Our Terraform creates**:
- VPC with public subnet (networking)
- Internet Gateway + Route Table (internet access)
- Security Group (firewall rules — which ports are open)
- EC2 Instance (the server where our app runs)

**Key concepts**:
- **State file** (`terraform.tfstate`): Tracks what resources exist. Terraform compares desired state (code) vs actual state (AWS) and makes changes.
- **Plan before apply**: `terraform plan` shows what will change before you commit.
- **Idempotent**: Running `terraform apply` twice with the same code changes nothing.

### Ansible — "How to configure the server"

**What it does**: Once Terraform creates the server, Ansible configures it — installs Docker, copies files, starts services.

**Our Ansible playbooks**:

| Playbook | Purpose |
|----------|---------|
| `playbook.yml` | Server provisioning — installs Docker, Docker Compose |
| `deploy.yml` | Application deployment — pulls images, runs compose |
| `monitoring.yml` | Monitoring setup — deploys Prometheus, Grafana, Node Exporter |

**Key concepts**:
- **Idempotency**: Running a playbook twice produces the same result. If Docker is already installed, it skips the installation.
- **Inventory** (`inventory.ini`): Lists the servers to configure.
- **Playbook vs Role**: Playbooks are task lists. Roles are reusable packages of tasks.

### Terraform vs Ansible

| Aspect | Terraform | Ansible |
|--------|-----------|---------|
| **Purpose** | Create infrastructure | Configure infrastructure |
| **State** | Maintains state file | Stateless |
| **Language** | HCL (declarative) | YAML (procedural) |
| **Example** | "Create an EC2 instance" | "Install Docker on that instance" |
| **When to use** | Cloud resource provisioning | Server configuration |

---

## 6. Monitoring & Observability

### What's the Difference?

- **Monitoring**: Watching **known** metrics. "Is CPU above 80%?" — you know what to look for.
- **Observability**: Understanding **unknown** problems. "Why is the app slow?" — you explore metrics, logs, and traces to find out.

### The Three Pillars of Observability

| Pillar | Tool We Use | What It Gives Us |
|--------|------------|-----------------|
| **Metrics** | Prometheus + Grafana | Numbers over time (CPU %, request count, latency) |
| **Logs** | Docker logs | Text records of events ("User X joined room Y") |
| **Traces** | (Future enhancement) | Request flow across services |

### How Prometheus Works

```
┌───────────────┐    scrapes /metrics     ┌───────────────┐
│  BrainBrush   │ ◄─────every 15s──────── │  Prometheus   │
│  Backend      │                         │  (stores data)│
│  :5000/metrics│                         │  :9090        │
└───────────────┘                         └───────┬───────┘
                                                  │ queries
┌───────────────┐    scrapes /metrics     ┌───────▼───────┐
│ Node Exporter │ ◄─────every 15s──────── │    Grafana    │
│ :9100/metrics │                         │  (dashboards) │
└───────────────┘                         │  :3000        │
                                          └───────────────┘
```

**Pull-based model**: Prometheus **pulls** (scrapes) metrics from targets. The targets don't push data. This is simpler and more reliable than push-based systems.

### Our Custom Metrics (prom-client)

| Metric | Type | What It Tracks |
|--------|------|---------------|
| `http_requests_total` | Counter | Total requests (by method, route, status code) |
| `http_request_duration_seconds` | Histogram | Request latency (for percentile calculations) |
| `websocket_connections_active` | Gauge | Current number of WebSocket connections |
| `game_rooms_active` | Gauge | Current number of active game rooms |
| `http_errors_total` | Counter | Requests with 4xx/5xx status codes |

**Metric types explained**:
- **Counter**: Only goes up (total requests, total errors). To get rate: `rate(counter[5m])`
- **Gauge**: Goes up and down (current connections, temperature)
- **Histogram**: Records distributions (latency). Lets you calculate percentiles (p50, p95, p99)

### Grafana Dashboard Panels

Our pre-built dashboard shows:
1. **Request Rate** — How many requests/second the app handles
2. **Error Rate** — What percentage of requests are failing
3. **Response Time Percentiles** — How fast the app responds (p50, p95, p99)
4. **WebSocket Connections** — How many players are connected
5. **Game Rooms** — How many games are happening
6. **Backend Status** — Is the backend UP or DOWN
7. **CPU/Memory/Disk Gauges** — Server resource usage

---

## 7. SRE Practices

### What is SRE?
**Site Reliability Engineering** treats operations as a software engineering problem. Instead of saying "keep the site up," SRE says "define a measurable target for uptime and manage it with error budgets."

### SLI, SLO, SLA — The Hierarchy

| Term | Full Name | What It Is | Our Example |
|------|-----------|-----------|-------------|
| **SLI** | Service Level Indicator | A **measurement** of behavior | "99.2% of requests succeeded" |
| **SLO** | Service Level Objective | A **target** for the SLI | "99.9% of requests should succeed" |
| **SLA** | Service Level Agreement | A **contract** with consequences | "If below 99.5%, customer gets credits" |

Think of it as: **SLI is the speedometer. SLO is the speed limit. SLA is the speeding ticket.**

### Error Budget

```
Error Budget = 100% - SLO

Our SLO: 99.9% availability
Error Budget: 0.1% = 43.2 minutes of downtime per 30 days
```

**Why error budgets matter**: They balance **reliability** vs **velocity**:
- If we have budget remaining → ship features quickly
- If budget is low → slow down, fix reliability first
- If budget is exhausted → feature freeze

### Our Alert Rules

| Alert | What It Detects | Severity |
|-------|----------------|----------|
| `HighErrorRate` | >5% of requests returning 5xx | 🔴 Critical |
| `HighLatency` | p95 response time > 1 second | 🟡 Warning |
| `InstanceDown` | Backend unreachable for > 1 min | 🔴 Critical |
| `HighMemoryUsage` | Memory > 85% for 5 min | 🟡 Warning |
| `HighCpuUsage` | CPU > 80% for 5 min | 🟡 Warning |
| `DiskSpaceRunningLow` | Disk > 80% full | 🟡 Warning |

---

## 8. Kubernetes

### What is Kubernetes?
Kubernetes (K8s) is a **container orchestration platform**. It manages containers across multiple machines, handling deployment, scaling, and recovery automatically.

### Key Concepts

| Concept | What It Is | Our Example |
|---------|-----------|-------------|
| **Pod** | Smallest deployable unit (1+ containers) | One backend container |
| **Deployment** | Manages pod replicas + rolling updates | 3 backend pods |
| **Service** | Stable network endpoint for pods | `backend:5000` |
| **Ingress** | HTTP routing (like a reverse proxy) | `/api → backend`, `/ → frontend` |
| **ConfigMap** | Non-secret config (key-value) | `PORT=5000` |
| **Secret** | Sensitive config (base64 encoded) | `MONGO_URI=...` |
| **HPA** | Auto-scales pods based on metrics | 3→10 pods based on CPU |
| **Namespace** | Logical isolation of resources | `brainbrush` namespace |

### Liveness vs Readiness Probes

| Probe | Question It Answers | What Happens on Failure |
|-------|-------------------|----------------------|
| **Liveness** | "Is the container alive?" | K8s **restarts** the container |
| **Readiness** | "Can it receive traffic?" | K8s **removes** it from load balancer |

Both hit our `/health` endpoint.

### HPA (Auto-scaling)

```
Current: 3 pods at 90% CPU each
Target: 70% CPU

Formula: desiredReplicas = ceil(currentReplicas × (currentCPU / targetCPU))
         = ceil(3 × (90/70))
         = ceil(3.86)
         = 4 pods

→ K8s spins up 1 more pod
```

### Rolling Update Strategy

```
maxSurge: 1         → Create 1 new pod first
maxUnavailable: 0   → Never kill an old pod until new one is ready

Step 1: [old] [old] [old] [NEW-starting]     ← new pod created
Step 2: [old] [old] [NEW-ready] [old-dying]  ← old pod terminated
Step 3: [old] [NEW] [NEW-starting] [old]     ← repeat
Step 4: [NEW] [NEW] [NEW]                    ← done, zero downtime!
```

---

## 9. Tools Summary Table

| Tool | Category | What It Does In Our Project |
|------|----------|-----------------------------|
| **GitHub Actions** | CI/CD | Automates build, test, containerize, deploy on every push |
| **Docker** | Containerization | Packages frontend & backend into portable containers |
| **Docker Compose** | Container Orchestration (simple) | Runs multi-container app with one command |
| **Kubernetes** | Container Orchestration (production) | Manages pods, scaling, self-healing, routing |
| **Terraform** | Infrastructure as Code | Creates AWS VPC, EC2, security groups from code |
| **Ansible** | Configuration Management | Installs Docker, deploys app, sets up monitoring |
| **Prometheus** | Monitoring (Metrics) | Scrapes and stores metrics from the app every 15s |
| **Grafana** | Monitoring (Visualization) | Displays metrics as graphs, gauges, and dashboards |
| **Node Exporter** | Monitoring (Infrastructure) | Exposes host CPU, memory, disk metrics |
| **Jest** | Testing | Runs unit tests in CI pipeline |
| **Supertest** | Testing | Makes HTTP requests to Express app in tests |
| **Nginx** | Web Server | Serves built React frontend in production |
| **prom-client** | Metrics Library | Exposes custom Prometheus metrics from Node.js |

---

## 10. Common Viva Questions & Answers

### CI/CD Questions

**Q1: What happens when you push code to the main branch?**
> GitHub Actions triggers our CI/CD pipeline. It checks out the code, installs dependencies, compiles TypeScript, runs unit tests, builds Docker images, pushes them to Docker Hub, SSHs into the EC2 server, pulls the new images, restarts the containers, and verifies the deployment by hitting the `/health` endpoint.

**Q2: What is the difference between Continuous Integration and Continuous Deployment?**
> CI is about automatically building and testing code on every commit — catching bugs early. CD takes it further by automatically deploying tested code to production. CI catches "does it compile?", CD ensures "is it live?"

**Q3: Why do you use `npm ci` instead of `npm install` in CI?**
> `npm ci` is designed for CI environments. It installs exact versions from `package-lock.json`, deletes `node_modules` first, and is faster. `npm install` might update versions, which could cause inconsistencies.

**Q4: What happens if a test fails?**
> The pipeline stops immediately. No Docker image is built, no deployment happens. This prevents broken code from reaching production. The developer gets notified via GitHub.

**Q5: Why do you tag Docker images with both `:latest` and the commit SHA?**
> `:latest` always points to the newest build, so `docker compose up` always pulls the latest. The commit SHA tag (e.g., `:abc123`) lets us roll back to any specific version if something goes wrong.

### Docker Questions

**Q6: What is a multi-stage Docker build and why do you use it?**
> A multi-stage build uses multiple `FROM` statements. Our frontend Dockerfile has Stage 1 (Node.js, builds React) and Stage 2 (Nginx, serves files). Only the built files are copied to Stage 2, so the final image is ~25MB instead of ~300MB. It reduces image size and attack surface.

**Q7: What is Docker layer caching?**
> Docker builds images in layers. Each instruction (COPY, RUN) is a layer. If a layer hasn't changed, Docker reuses the cached version. That's why we `COPY package.json` before `COPY . .` — if only source code changed, `npm install` is cached.

**Q8: What is the difference between Docker Compose and Kubernetes?**
> Docker Compose runs multiple containers on a single machine — great for dev and small deployments. Kubernetes manages containers across multiple machines with auto-scaling, self-healing, service discovery, and rolling updates. We use Compose for our EC2 deployment and have K8s manifests ready for scaling.

### Monitoring Questions

**Q9: How does Prometheus collect metrics?**
> Prometheus uses a pull model. Every 15 seconds, it sends an HTTP GET request to our backend's `/metrics` endpoint. The backend responds with all metrics in Prometheus text format. Prometheus stores this data as time-series and makes it queryable.

**Q10: What are the three pillars of observability?**
> Metrics (numeric measurements over time — Prometheus), Logs (textual event records — Docker logs), and Traces (request flow across services — Jaeger). Together, they let you answer "what's broken?" (metrics), "why is it broken?" (logs), and "where is it broken?" (traces).

**Q11: What is the difference between a Counter, Gauge, and Histogram in Prometheus?**
> Counter: only goes up (total requests, total errors). Gauge: goes up and down (current connections, temperature). Histogram: records distributions (latency) with buckets, enabling percentile calculations like p95.

**Q12: What does your Grafana dashboard show?**
> Request rate (requests/second), error rate (% of 5xx responses), response time percentiles (p50, p95, p99), active WebSocket connections, active game rooms, backend UP/DOWN status, and server CPU/memory/disk usage gauges.

### SRE Questions

**Q13: What is the difference between SLI, SLO, and SLA?**
> SLI is a measurement ("99.2% of requests succeeded"). SLO is a target for that measurement ("we aim for 99.9%"). SLA is a contract with consequences ("if below 99.5%, the customer gets credits"). SLI is the speedometer, SLO is the speed limit, SLA is the speeding ticket.

**Q14: What is an error budget?**
> The error budget is the acceptable amount of unreliability: `100% - SLO`. Our SLO is 99.9%, so our error budget is 0.1% = 43.2 minutes of downtime per month. As long as we stay within this budget, we can ship features. If we exceed it, we freeze features and focus on reliability.

**Q15: How would you handle a production incident?**
> Follow the incident response procedure: Detect (alert fires), Triage (assign severity), Respond (communicate, assign commander), Diagnose (check logs, metrics, recent deployments), Mitigate (rollback, restart, or hotfix), Resolve (confirm fix), Post-mortem (document lessons learned and action items).

### Kubernetes Questions

**Q16: What is the difference between a Pod and a Deployment?**
> A Pod is the smallest unit in K8s — one or more containers running together. A Deployment manages Pods: it ensures the desired number of replicas are running, handles rolling updates, and automatically replaces crashed Pods.

**Q17: What is a liveness probe vs a readiness probe?**
> Liveness: "Is the container alive?" If it fails, K8s restarts the container. Readiness: "Can it handle traffic?" If it fails, K8s removes the pod from the load balancer but doesn't restart it. Both hit our `/health` endpoint.

**Q18: How does the HorizontalPodAutoscaler work?**
> HPA checks pod CPU/memory every 30 seconds. If average CPU across all pods exceeds the target (70%), it calculates how many pods are needed: `desiredReplicas = ceil(current × (actualCPU / targetCPU))`. It scales up quickly (2 pods at a time) and down slowly (1 pod every 2 minutes) to avoid flapping.

**Q19: Explain your Kubernetes deployment strategy.**
> We use RollingUpdate with `maxSurge: 1` and `maxUnavailable: 0`. This means K8s creates one new pod first, waits until it's ready, then kills one old pod. This ensures zero-downtime deployments — there are always at least 3 healthy pods serving traffic.

### Infrastructure Questions

**Q20: What is Terraform state?**
> Terraform state (`terraform.tfstate`) is a JSON file that records what resources Terraform manages. When you run `terraform apply`, it compares desired state (your `.tf` files) with actual state (the state file) and only makes necessary changes. Without state, Terraform would try to create everything from scratch each time.

**Q21: What is idempotency in Ansible?**
> Idempotency means running a playbook multiple times produces the same result. If Docker is already installed, the "Install Docker" task detects this and skips. This is crucial because playbooks may run during retries or scheduled runs without causing duplicate installations or errors.

**Q22: Why Terraform AND Ansible? Why not just one?**
> They solve different problems. Terraform creates infrastructure (EC2 instances, VPCs, security groups) — it talks to cloud APIs. Ansible configures that infrastructure (installs Docker, copies files, starts services) — it talks to servers via SSH. Terraform builds the house, Ansible furnishes it.

---

## 11. Commands Cheat Sheet

### Run Everything Locally

```bash
# Start the app with Docker Compose
docker compose up --build

# Start monitoring stack
cd monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

### Access Points (Local)

```
Frontend:       http://localhost:80
Backend:        http://localhost:5000
Health Check:   http://localhost:5000/health
Metrics:        http://localhost:5000/metrics
Prometheus:     http://localhost:9090
Grafana:        http://localhost:3000  (admin / brainbrush)
Node Exporter:  http://localhost:9100/metrics
```

### Run Unit Tests

```bash
cd backend
npm install
npm test
```

### Docker Commands

```bash
docker compose up --build      # Build and start all containers
docker compose down            # Stop all containers
docker compose logs -f         # Follow logs
docker ps                      # List running containers
docker stats                   # Live resource usage
docker image prune -af         # Clean up unused images
```

### Kubernetes Commands

```bash
kubectl apply -f k8s/          # Apply all K8s manifests
kubectl get pods -n brainbrush # List pods
kubectl get svc -n brainbrush  # List services
kubectl get hpa -n brainbrush  # Check auto-scaler
kubectl logs <pod-name> -n brainbrush  # View pod logs
kubectl describe pod <name> -n brainbrush  # Debug a pod
kubectl rollout undo deployment/backend -n brainbrush  # Rollback
```

### Terraform Commands

```bash
cd terraform
terraform init                 # Initialize (download providers)
terraform plan                 # Preview changes
terraform apply                # Create/update resources
terraform destroy              # Tear down everything
terraform output               # Show output values
```

### Ansible Commands

```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml     # Provision server
ansible-playbook -i inventory.ini deploy.yml        # Deploy app
ansible-playbook -i inventory.ini monitoring.yml    # Deploy monitoring
```

### Prometheus PromQL Queries

```promql
# Request rate (requests per second)
sum(rate(http_requests_total[5m]))

# Error rate (%)
sum(rate(http_requests_total{status_code=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

# p95 latency
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# Active WebSocket connections
websocket_connections_active

# Is backend up?
up{job="brainbrush-backend"}

# CPU usage (%)
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage (%)
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

---

## 12. Troubleshooting & Gotchas

### 1. The Double Slash (`//`) Redirect Bug
**The Problem**: After logging in via Google OAuth, the user is redirected to `http://<IP>.nip.io//auth/success?token=...` with an unexpected double slash (`//`), breaking the URL or looking unprofessional.
**The Cause**: The `FRONTEND_URL` in GitHub Actions Secrets was saved with a trailing slash (e.g., `http://15.206.83.116.nip.io/`). In the backend, the redirect URL is constructed as `${process.env.FRONTEND_URL}/auth/success`. When concatenated, `...nip.io/` + `/auth/success` creates the double slash.
**The Fix**: Remove the trailing slash from the GitHub Actions Secret. Best practice: sanitize the environment variable in code using `.replace(/\/+$/, "")` so it never breaks, even if misconfigured.

### 2. CORS Origin Mismatch
**The Problem**: Browser blocks frontend requests to the backend with a CORS error.
**The Cause**: The `ALLOWED_ORIGINS` environment variable was set with a trailing slash, but browsers send the `Origin` header without one. Exact string matching fails, so the backend rejects the request.
**The Fix**: Trim trailing slashes from allowed origins when configuring the Express CORS middleware.

### 3. Connection Refused / Timeouts on Deployment
**The Problem**: Ansible deployment fails with `Connection reset by peer` or `Status code was -1` when waiting for the backend to be ready.
**The Cause**: The playbook is trying to hit `http://localhost:5000/health` immediately after `docker compose up -d`, but the container is still starting, or the new images haven't been pushed to Docker Hub yet (if running the playbook manually before GitHub Actions finishes building).
**The Fix**: Add retries/delays in the Ansible task, and ensure the CI/CD pipeline pushes the image before triggering the Ansible deployment.

