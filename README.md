# BrainBrush

BrainBrush is a real-time multiplayer drawing and guessing game with Google sign-in, live rooms, synchronized canvas updates, in-game chat, scoring, and player history tracking.

This project includes a **complete DevOps lifecycle**: CI/CD pipeline, containerization, infrastructure-as-code, monitoring, observability, and SRE practices.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                                │
│                              (Source)                                     │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ git push to main
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     GitHub Actions CI/CD Pipeline                         │
│                                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ Source   │→ │ Build   │→ │ Test    │→ │ Containerize │→ │ Deploy   │ │
│  │Checkout  │  │npm ci   │  │Jest     │  │Docker Build  │  │SSH+Docker│ │
│  │+ Cache   │  │tsc      │  │         │  │Push to Hub   │  │Compose   │ │
│  └─────────┘  └─────────┘  └─────────┘  └──────────────┘  └────┬─────┘ │
└─────────────────────────────────────────────────────────────────┼───────┘
                                                                  │
                                ┌─────────────────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    AWS EC2 Instance (Terraform + Ansible)                 │
│                                                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐                        │
│  │  brainbrush-backend │  │ brainbrush-frontend  │                       │
│  │  (Express+Socket.IO)│  │ (React+Nginx)        │                       │
│  │  Port: 5000         │  │ Port: 80             │                       │
│  │  /health  /metrics  │  │                      │                       │
│  └──────────┬──────────┘  └──────────────────────┘                       │
│             │ scrapes /metrics                                            │
│  ┌──────────▼──────────┐  ┌──────────────────────┐  ┌─────────────────┐  │
│  │    Prometheus       │→ │     Grafana          │  │  Node Exporter  │  │
│  │    Port: 9090       │  │     Port: 3000       │  │  Port: 9100     │  │
│  │  (Metrics Store)    │  │  (Dashboards)        │  │  (System Stats) │  │
│  └─────────────────────┘  └──────────────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Socket.IO Client, Zustand, Tailwind CSS |
| **Backend** | Express 5, TypeScript, Socket.IO, Passport (Google OAuth), JWT |
| **Database** | MongoDB (Mongoose), Redis (ioredis) |
| **CI/CD** | GitHub Actions (build, test, containerize, deploy, verify) |
| **Containerization** | Docker (multi-stage builds), Docker Compose |
| **Infrastructure** | Terraform (AWS VPC, EC2, Security Groups) |
| **Configuration Mgmt** | Ansible (server provisioning, app deployment, monitoring setup) |
| **Monitoring** | Prometheus (metrics collection), Grafana (dashboards), Node Exporter |
| **Orchestration** | Kubernetes manifests (Deployments, Services, HPA, Ingress) |
| **SRE** | SLIs, SLOs, Error Budgets, Alert Rules, Incident Management |

## Repository Structure

```text
.
├── backend/                      # Express + Socket.IO backend
│   ├── src/
│   │   ├── __tests__/            # Jest unit tests
│   │   ├── config/
│   │   │   ├── metrics.ts        # Prometheus metrics setup
│   │   │   └── ...
│   │   ├── middlewares/
│   │   │   ├── metricsMiddleware.ts  # HTTP metrics collection
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── healthRoutes.ts   # Health check endpoint
│   │   │   └── ...
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                     # React + Vite frontend
│   ├── Dockerfile                # Multi-stage: Node build → Nginx serve
│   └── ...
│
├── .github/workflows/
│   └── ci-cd.yml                 # GitHub Actions CI/CD pipeline
│
├── monitoring/                   # Monitoring & Observability stack
│   ├── docker-compose.monitoring.yml
│   ├── prometheus/
│   │   ├── prometheus.yml        # Scrape configuration
│   │   └── alert_rules.yml       # SRE-aligned alert rules
│   └── grafana/
│       ├── provisioning/         # Auto-config datasources & dashboards
│       └── dashboards/
│           └── brainbrush-dashboard.json
│
├── k8s/                          # Kubernetes manifests
│   ├── namespace.yml
│   ├── backend-deployment.yml    # 3 replicas, probes, resource limits
│   ├── frontend-deployment.yml   # 2 replicas, LoadBalancer service
│   ├── configmap.yml             # Non-secret config
│   ├── secret.yml                # Sensitive config (base64)
│   ├── ingress.yml               # HTTP routing rules
│   └── hpa.yml                   # Auto-scaling (3→10 pods)
│
├── terraform/                    # Infrastructure as Code (AWS)
│   ├── main.tf                   # VPC, EC2, Security Groups
│   ├── variables.tf
│   └── outputs.tf
│
├── ansible/                      # Configuration Management
│   ├── playbook.yml              # Server provisioning
│   ├── deploy.yml                # Application deployment
│   └── monitoring.yml            # Monitoring stack deployment
│
├── docs/
│   ├── sre-practices.md          # SLIs, SLOs, Error Budgets, Runbooks
│   ├── devops-explainer.md       # Comprehensive viva/interview guide
│   └── interview_qa.md
│
├── docker-compose.yml            # Local development
└── docker-compose.prod.yml       # Production (pre-built images)
```

## CI/CD Pipeline

The pipeline runs on every push to `main` via GitHub Actions:

| Stage | What Happens | Tools |
|-------|-------------|-------|
| **1. Source** | Checkout code, setup Node.js 20, cache dependencies | GitHub Actions |
| **2. Build** | `npm ci` + compile TypeScript (`tsc`) + Vite build | Node.js, TypeScript |
| **3. Test** | Run Jest unit tests — fails pipeline on errors | Jest, Supertest |
| **4. Containerize** | Build Docker images, push to Docker Hub (`:latest` + `:sha`) | Docker, Buildx |
| **5. Deploy** | SSH into EC2, pull images, `docker compose up -d` | SSH, Docker Compose |
| **6. Verify** | Hit `GET /health` to confirm deployment succeeded | curl |

### Required GitHub Secrets

```
DOCKERHUB_USERNAME    # Docker Hub username
DOCKERHUB_TOKEN       # Docker Hub access token
EC2_HOST              # EC2 public IP
EC2_SSH_KEY           # Private SSH key (PEM)
BACKEND_URL           # Backend URL for frontend build
```

## Monitoring & Observability

### Quick Start

```bash
cd monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

### Access

| Service | URL | Credentials |
|---------|-----|-------------|
| **Prometheus** | http://localhost:9090 | — |
| **Grafana** | http://localhost:3000 | admin / brainbrush |
| **Node Exporter** | http://localhost:9100 | — |

### Dashboard Panels

- 📈 Request Rate (req/s)
- ❌ Error Rate (%)
- ⏱️ Response Time Percentiles (p50, p95, p99)
- 🔌 Active WebSocket Connections
- 🎮 Active Game Rooms
- 🟢 Backend Status (UP/DOWN)
- 🔥 CPU Usage (%)
- 💾 Memory Usage (%)
- 💿 Disk Usage (%)

## Kubernetes Deployment

```bash
# Apply all resources
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/secret.yml        # Update secrets first!
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/frontend-deployment.yml
kubectl apply -f k8s/ingress.yml
kubectl apply -f k8s/hpa.yml

# Verify
kubectl get all -n brainbrush
kubectl get hpa -n brainbrush
```

## Infrastructure (Terraform + Ansible)

```bash
# Provision AWS infrastructure
cd terraform
terraform init
terraform plan
terraform apply

# Configure the server (install Docker)
cd ../ansible
ansible-playbook -i inventory.ini playbook.yml

# Deploy the application
ansible-playbook -i inventory.ini deploy.yml

# Deploy monitoring stack
ansible-playbook -i inventory.ini monitoring.yml
```

## Local Development

```bash
# Backend
cd backend
npm install
npm run dev          # Starts on :5000

# Frontend
cd frontend
npm install
npm run dev          # Starts on :5173

# Or use Docker Compose
docker compose up --build
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Backend status message |
| `/health` | GET | Health check (uptime, DB status, memory) |
| `/metrics` | GET | Prometheus metrics (scraped every 15s) |
| `/auth/google` | GET | Initiate Google OAuth |
| `/auth/google/callback` | GET | Google OAuth callback |
| `/auth/logout` | GET | Logout |
| `/api/player/stats` | GET | Player statistics |
| `/api/player/history` | GET | Match history |

## Documentation

- [SRE Practices](docs/sre-practices.md) — SLIs, SLOs, Error Budgets, Incident Management
- [DevOps Explainer](docs/devops-explainer.md) — Complete viva/interview guide
- [Interview Q&A](docs/interview_qa.md) — Interview questions and answers

## License

ISC