# 📁 BrainBrush Project Structure & File Guide

A complete, beginner-friendly guide explaining the **entire repository file tree**, why every directory exists, and what each individual file does in short.

---

## 📑 Table of Contents
1. [Visual Directory Tree](#1-visual-directory-tree)
2. [Root Directory Files](#2-root-directory-files)
3. [`.github/` — CI/CD Pipeline](#3-github--cicd-pipeline)
4. [`terraform/` — Infrastructure as Code (IaC)](#4-terraform--infrastructure-as-code-iac)
5. [`ansible/` — Configuration Management & Deployments](#5-ansible--configuration-management--deployments)
6. [`k8s/` — Kubernetes Orchestration](#6-k8s--kubernetes-orchestration)
7. [`monitoring/` — Observability (Prometheus & Grafana)](#7-monitoring--observability-prometheus--grafana)
8. [`backend/` — Node.js & Socket.IO Game Engine](#8-backend--nodejs--socketio-game-engine)
9. [`frontend/` — React & HTML5 Canvas UI](#9-frontend--react--html5-canvas-ui)
10. [`docs/` — Project & Viva Documentation](#10-docs--project--viva-documentation)

---

## 1. Visual Directory Tree

```
BrainBrush/
├── .github/                      # Automated CI/CD workflows
│   └── workflows/
│       └── ci-cd.yml             # 6-stage GitHub Actions automation pipeline
├── terraform/                    # Cloud infrastructure provisioning on AWS
│   ├── main.tf                   # Provisions EC2, VPC, Security Groups, Elastic IP
│   ├── variables.tf              # Configurable inputs (region, instance type)
│   ├── outputs.tf                # Outputs public IP and SSH command
│   ├── provider.tf               # AWS provider config
│   └── terraform.tfvars          # Actual values for Terraform variables
├── ansible/                      # Server setup and deployment automation
│   ├── inventory.ini             # Target EC2 server IP and SSH key config
│   ├── playbook.yml              # Server initialization (Docker, Swap, Firewall)
│   ├── deploy.yml                # Production app deployment playbook
│   ├── monitoring.yml            # Prometheus & Grafana deployment playbook
│   └── templates/                # Jinja2 environment and compose templates
│       ├── .env.j2               # Production environment variables template
│       └── docker-compose.prod.yml.j2 # Container definitions with RAM limits
├── k8s/                          # Kubernetes production manifests
│   ├── namespace.yml             # Isolated 'brainbrush' environment
│   ├── configmap.yml             # Non-secret environment variables
│   ├── secret.yml                # Base64-encoded database & auth secrets
│   ├── backend-deployment.yml    # 3-replica backend, probes, and ClusterIP
│   ├── frontend-deployment.yml   # 2-replica frontend and LoadBalancer service
│   ├── hpa.yml                   # Horizontal Pod Autoscaler (scales 3-10 pods)
│   └── ingress.yml               # Domain HTTP routing and WebSocket proxy
├── monitoring/                   # Telemetry & SRE Stack
│   ├── docker-compose.monitoring.yml # Compose file for Prometheus, Grafana, Node Exp
│   ├── prometheus/
│   │   ├── prometheus.yml        # Metrics scraping intervals and targets
│   │   └── alert_rules.yml       # SRE alerting rules (CPU, downtime, error rate)
│   └── grafana/
│       ├── provisioning/         # Auto-loads datasources and dashboard paths
│       └── dashboards/           # Pre-built BrainBrush visual dashboard JSON
├── backend/                      # Game server (Express, WebSockets, MongoDB, Redis)
│   ├── Dockerfile                # Production multi-stage Docker build
│   ├── package.json              # Node.js dependencies and scripts
│   ├── tsconfig.json             # TypeScript compiler settings
│   ├── jest.config.ts            # Unit testing configuration
│   ├── load-test.yml             # Artillery load testing script
│   └── src/                      # TypeScript source code
│       ├── server.ts             # Server entry point (starts HTTP & Socket.IO)
│       ├── app.ts                # Express app setup, /health, /metrics routes
│       ├── config/               # Database, Redis, and Google OAuth configs
│       ├── controllers/          # API endpoint logic (auth, rooms, profile)
│       ├── middlewares/          # JWT auth validation and error handling
│       ├── models/               # Mongoose database schemas (User, Game)
│       ├── routes/               # Express route definitions
│       ├── sockets/              # Real-time drawing and guess broadcasting
│       ├── services/             # Business logic and Redis caching
│       └── utils/                # Prometheus metrics instrumentation & dictionaries
├── frontend/                     # Web application (React, Vite, TailwindCSS)
│   ├── Dockerfile                # Multi-stage build (Vite build -> Nginx Alpine)
│   ├── nginx.conf                # Nginx reverse proxy and SPA routing
│   ├── package.json              # React dependencies (Zustand, Lucide, Socket.IO)
│   ├── vite.config.ts            # Vite bundler configuration
│   └── src/                      # React source code
│       ├── pages/                # Views (LoginPage, LobbyPage, GamePage)
│       ├── components/           # UI elements (Canvas, Chat, ColorPicker, Players)
│       ├── store/                # Zustand global state management
│       └── hooks/                # Socket listeners and canvas resize hooks
├── docs/                         # Comprehensive Viva and Project Documentation
├── docker-compose.yml            # Local development environment (all-in-one)
└── docker-compose.prod.yml       # Production Docker Compose definition
```

---

## 2. Root Directory Files

| File | Why it exists & What it does |
| :--- | :--- |
| [`docker-compose.yml`](file:///home/xcaliber/Projects/BrainBrush/docker-compose.yml) | **Local Development Orchestrator**: Spins up MongoDB, Redis, Backend, and Frontend locally in one command (`docker compose up`) so you can code without internet. |
| [`docker-compose.prod.yml`](file:///home/xcaliber/Projects/BrainBrush/docker-compose.prod.yml) | **Production Container Map**: Defines the lightweight backend and frontend containers that run on the AWS EC2 instance. |
| [`.gitignore`](file:///home/xcaliber/Projects/BrainBrush/.gitignore) | **Git Filter**: Prevents junk files (`node_modules/`, `.env`, temporary files, Terraform state) from being accidentally committed to GitHub. |
| [`README.md`](file:///home/xcaliber/Projects/BrainBrush/README.md) | **Project Presentation**: Project overview, feature list, architecture overview, and instructions on how to clone and run the game. |

---

## 3. `.github/` — CI/CD Pipeline

*Automates testing, building, and deploying the application on every git push.*

| File | Why it exists & What it does |
| :--- | :--- |
| [`.github/workflows/ci-cd.yml`](file:///home/xcaliber/Projects/BrainBrush/.github/workflows/ci-cd.yml) | **Continuous Integration & Deployment Pipeline**: Automatically executes 6 stages on GitHub runners: (1) Checkout code ➡️ (2) Run Jest unit tests ➡️ (3) Build Docker images ➡️ (4) Push to Docker Hub ➡️ (5) Run Ansible deploy playbook to EC2 ➡️ (6) Verify `/health` endpoint. |

---

## 4. `terraform/` — Infrastructure as Code (IaC)

*Provisions cloud servers on AWS predictably with zero manual clicking in the AWS Console.*

| File | Why it exists & What it does |
| :--- | :--- |
| [`main.tf`](file:///home/xcaliber/Projects/BrainBrush/terraform/main.tf) | **Core Infrastructure**: Declares the AWS EC2 instance (`t2.micro`), VPC subnet, Security Groups (opening ports 22, 80, 443, 3000, 5000, 9090, 9100), and Elastic IP. |
| [`variables.tf`](file:///home/xcaliber/Projects/BrainBrush/terraform/variables.tf) | **Input Variables**: Defines variable types and defaults (e.g. AWS region `ap-south-1`, AMI ID, instance type). |
| [`outputs.tf`](file:///home/xcaliber/Projects/BrainBrush/terraform/outputs.tf) | **Output Values**: Prints the assigned Public IP address and exact SSH connection command after `terraform apply` finishes. |
| [`provider.tf`](file:///home/xcaliber/Projects/BrainBrush/terraform/provider.tf) | **AWS Provider Connection**: Tells Terraform to use the official AWS plugin and specifies required version constraints. |
| [`terraform.tfvars`](file:///home/xcaliber/Projects/BrainBrush/terraform/terraform.tfvars) | **Environment Configuration**: Supplies the actual values (like your AWS key pair name) to fill in the variables. |

---

## 5. `ansible/` — Configuration Management & Deployments

*Configures the newly created server and deploys applications without manual SSH.*

| File | Why it exists & What it does |
| :--- | :--- |
| [`inventory.ini`](file:///home/xcaliber/Projects/BrainBrush/ansible/inventory.ini) | **Server Directory**: Holds the EC2 server IP (`15.206.83.116`), SSH user (`ubuntu`), and path to the private key `.pem` file. |
| [`playbook.yml`](file:///home/xcaliber/Projects/BrainBrush/ansible/playbook.yml) | **Server Bootstrapper**: Installs Docker, Docker Compose, Git, sets up 1GB Swap memory (prevents out-of-memory crashes), and configures UFW firewall rules. |
| [`deploy.yml`](file:///home/xcaliber/Projects/BrainBrush/ansible/deploy.yml) | **Application Deployment Playbook**: Renders production `.env`, pulls the latest Docker Hub images, and restarts the backend and frontend containers with zero downtime. |
| [`monitoring.yml`](file:///home/xcaliber/Projects/BrainBrush/ansible/monitoring.yml) | **Monitoring Stack Playbook**: Deploys Prometheus, Grafana, and Node Exporter to the server and sets up health checks. |
| [`templates/.env.j2`](file:///home/xcaliber/Projects/BrainBrush/ansible/templates/.env.j2) | **Jinja2 Environment Template**: Injects production secrets (`MONGO_URI`, `JWT_SECRET`, `REDIS_URL`) safely on the remote server. |
| [`templates/docker-compose.prod.yml.j2`](file:///home/xcaliber/Projects/BrainBrush/ansible/templates/docker-compose.prod.yml.j2) | **Jinja2 Compose Template**: Configures Node.js heap limit (`--max-old-space-size=200`) and Docker memory limits (`250M` backend, `100M` frontend) to protect the `t2.micro` instance. |

---

## 6. `k8s/` — Kubernetes Orchestration

*Declarative manifests for multi-replica, auto-scaling cloud deployments.*

| File | Why it exists & What it does |
| :--- | :--- |
| [`namespace.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/namespace.yml) | **Namespace Isolation**: Isolates all BrainBrush resources inside the `brainbrush` virtual namespace to prevent naming collisions. |
| [`configmap.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/configmap.yml) | **Plaintext Configuration**: Stores non-sensitive settings (`PORT=5000`, `NODE_ENV=production`) injected into pods. |
| [`secret.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/secret.yml) | **Encrypted Credentials**: Stores base64-encoded connection strings (`MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, Google OAuth). |
| [`backend-deployment.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/backend-deployment.yml) | **Backend Controller & Service**: Manages 3 replicas of the Node.js container, rolling update strategy, `/health` Liveness/Readiness probes, and internal ClusterIP service. |
| [`frontend-deployment.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/frontend-deployment.yml) | **Frontend Controller & Service**: Manages 2 replicas of the Nginx frontend and exposes them via a LoadBalancer service. |
| [`hpa.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/hpa.yml) | **Horizontal Pod Autoscaler**: Scales backend pods automatically from 3 up to 10 if CPU utilization crosses 70%. |
| [`ingress.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/ingress.yml) | **Application Ingress**: Routes external domain paths (`/api`, `/socket.io`, `/`) to the correct internal services. |

---

## 7. `monitoring/` — Observability (Prometheus & Grafana)

*Collects real-time metrics, monitors server health, and triggers SRE alerts.*

| File | Why it exists & What it does |
| :--- | :--- |
| [`docker-compose.monitoring.yml`](file:///home/xcaliber/Projects/BrainBrush/monitoring/docker-compose.monitoring.yml) | **Monitoring Compose**: Runs Prometheus (`:9090`), Grafana (`:3000`), and Node Exporter (`:9100`) with memory limits (`300M`). |
| [`prometheus/prometheus.yml`](file:///home/xcaliber/Projects/BrainBrush/monitoring/prometheus/prometheus.yml) | **Prometheus Config**: Defines scrape targets (Backend `:5000`, Node Exporter `:9100`, Prometheus self) and scrape intervals. |
| [`prometheus/alert_rules.yml`](file:///home/xcaliber/Projects/BrainBrush/monitoring/prometheus/alert_rules.yml) | **Alerting Rules**: SRE thresholds (alerts if CPU > 85%, backend down > 1 min, or 5xx error rate > 5%). |
| [`grafana/provisioning/datasources/datasource.yml`](file:///home/xcaliber/Projects/BrainBrush/monitoring/grafana/provisioning/datasources/datasource.yml) | **Automated Datasource**: Pre-configures Prometheus as the default data source on Grafana startup with zero manual UI clicks. |
| [`grafana/provisioning/dashboards/dashboard.yml`](file:///home/xcaliber/Projects/BrainBrush/monitoring/grafana/provisioning/dashboards/dashboard.yml) | **Dashboard Provider**: Directs Grafana to automatically load JSON dashboards on boot. |
| [`grafana/dashboards/brainbrush-dashboard.json`](file:///home/xcaliber/Projects/BrainBrush/monitoring/grafana/dashboards/brainbrush-dashboard.json) | **Pre-built Dashboard JSON**: Graph definitions for CPU %, RAM %, Active Socket Connections, and HTTP Request Rate. |

---

## 8. `backend/` — Node.js & Socket.IO Game Engine

*The real-time game engine handling players, drawing rooms, turns, and scores.*

| File / Folder | Why it exists & What it does |
| :--- | :--- |
| [`Dockerfile`](file:///home/xcaliber/Projects/BrainBrush/backend/Dockerfile) | **Multi-stage Image Builder**: Compiles TypeScript to JavaScript in stage 1, then creates a tiny production Alpine image in stage 2. |
| [`src/server.ts`](file:///home/xcaliber/Projects/BrainBrush/backend/src/server.ts) | **Server Bootstrapper**: Initializes HTTP server, connects to MongoDB & Redis, and attaches Socket.IO. |
| [`src/app.ts`](file:///home/xcaliber/Projects/BrainBrush/backend/src/app.ts) | **Express App Definition**: Configures CORS, middleware, routes, and exposes `/health` and `/metrics`. |
| `src/config/` | **System Integrations**: `db.ts` (MongoDB Atlas), `redis.ts` (Upstash Redis client), `passport.ts` (Google OAuth 2.0). |
| `src/controllers/` | **Request Controllers**: Handles logic for user profiles, authentication, and room creation. |
| `src/middlewares/` | **Middlewares**: `authMiddleware.ts` (verifies JWT token on protected routes), error handlers. |
| `src/models/` | **Database Models**: Mongoose schemas for `User.ts` (player accounts, stats) and `Room.ts` (game lobbies). |
| `src/routes/` | **API Endpoints**: Defines `/auth`, `/api/rooms`, and `/api/user` route handlers. |
| `src/sockets/` | **Real-Time Engine**: Manages WebSocket events (`join-room`, `draw-stroke`, `clear-canvas`, `submit-guess`, `chat-message`, round timers). |
| `src/services/` | **Business Logic**: Manages turn timers, word selection, and score calculations. |
| `src/utils/metrics.ts` | **Prometheus Instrumentation**: Uses `prom-client` to record HTTP request durations, active sockets, and error rates. |
| [`load-test.yml`](file:///home/xcaliber/Projects/BrainBrush/backend/load-test.yml) | **Performance Stress Test**: Artillery configuration to simulate hundreds of concurrent users hitting the backend. |

---

## 9. `frontend/` — React & HTML5 Canvas UI

*The interactive browser interface where players draw, guess, and chat.*

| File / Folder | Why it exists & What it does |
| :--- | :--- |
| [`Dockerfile`](file:///home/xcaliber/Projects/BrainBrush/frontend/Dockerfile) | **Production Build Image**: Builds the React Vite app into static assets, then places them into an Nginx Alpine container. |
| [`nginx.conf`](file:///home/xcaliber/Projects/BrainBrush/frontend/nginx.conf) | **Reverse Proxy & Router**: Serves static React files and proxies `/api/`, `/socket.io/`, and `/auth/` to the backend container. |
| [`src/pages/LoginPage.tsx`](file:///home/xcaliber/Projects/BrainBrush/frontend/src/pages/LoginPage.tsx) | **Landing & Auth Page**: Displays the BrainBrush hero page with the Google OAuth sign-in button. |
| [`src/pages/LobbyPage.tsx`](file:///home/xcaliber/Projects/BrainBrush/frontend/src/pages/LobbyPage.tsx) | **Game Lobby**: Lets players create rooms, join with a code, and see other waiting players. |
| [`src/pages/GamePage.tsx`](file:///home/xcaliber/Projects/BrainBrush/frontend/src/pages/GamePage.tsx) | **Game Arena**: The main match view containing the drawing canvas, player scoreboard, chat, and round timer. |
| `src/components/DrawingCanvas.tsx` | **HTML5 Canvas**: Captures player mouse/touch drawing coordinates and emits them via WebSockets in real time. |
| `src/components/ChatBox.tsx` | **Chat & Guessing**: Live chat where guesses are evaluated. If a guess matches the secret word, points are awarded! |
| `src/store/useGameStore.ts` | **Zustand State**: Stores client-side user state, room state, current word, and socket connection. |

---

## 10. `docs/` — Project & Viva Documentation

*The master documentation suite covering every exam, viva, and technical question.*

| Document | Purpose |
| :--- | :--- |
| [`project-structure.md`](file:///home/xcaliber/Projects/BrainBrush/docs/project-structure.md) | **This file**: Directory structure and file-by-file explanations. |
| [`devops-explainer.md`](file:///home/xcaliber/Projects/BrainBrush/docs/devops-explainer.md) | Comprehensive deep dive into the 6 DevOps stages, architecture choices, and troubleshooting. |
| [`kubernetes-explainer.md`](file:///home/xcaliber/Projects/BrainBrush/docs/kubernetes-explainer.md) | Complete Kubernetes guide (Pods, Deployments, Services, HPA, output breakdown, and viva answers). |
| [`scratch-commands-cheatsheet.md`](file:///home/xcaliber/Projects/BrainBrush/docs/scratch-commands-cheatsheet.md) | Step-by-step commands to spin up Prometheus, Grafana, and Kubernetes from absolute scratch. |
| [`live-demo-guide.md`](file:///home/xcaliber/Projects/BrainBrush/docs/live-demo-guide.md) | Step-by-step script on what to click and say during the live viva demonstration. |
| [`sre-practices.md`](file:///home/xcaliber/Projects/BrainBrush/docs/sre-practices.md) | Site Reliability Engineering definitions (SLIs, SLOs, Error Budgets, and alerting policies). |
| [`interview_qa.md`](file:///home/xcaliber/Projects/BrainBrush/docs/interview_qa.md) | 50+ rapid-fire viva interview questions and model answers across Docker, K8s, CI/CD, and AWS. |
