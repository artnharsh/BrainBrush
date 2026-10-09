# BrainBrush DevOps — Live Demonstration Guide

This guide provides a step-by-step script for demonstrating the DevOps features of the BrainBrush project during your Viva/Evaluation.

---

## Pre-requisites (Before you start)
1. Have your terminal open at the project root (`/home/xcaliber/Projects/BrainBrush`).
2. Have your IDE (VS Code) open with this project.
3. Have a browser window ready.
4. Have your GitHub repository open in a browser tab.

---

## Step 1: Demonstrate Containerization (Docker)
**Context to explain:** Show that the entire application (frontend, backend, database, cache) runs in isolated containers. This ensures environment consistency—meaning it can run anywhere without installing Node.js, MongoDB, or Redis manually.

**Commands to run in terminal:**
```bash
# From the root of your project
docker compose up --build -d
docker ps
```

**What to say to the teacher:**
> *"First, I have containerized the entire application using Docker. As you can see by running `docker ps`, our backend, frontend, MongoDB, and Redis are all running in isolated containers via Docker Compose. This ensures environment consistency across development and production."*

**Visual Proof:** 
Open your browser and go to `http://localhost` (or `http://localhost:5173` depending on your setup) to show the game is actually running.

---

## Step 2: Demonstrate Monitoring & Observability (Prometheus & Grafana)
**Context to explain:** DevOps is also about observing the system in production. Show how we collect and visualize metrics.

**Commands to run in terminal:**
```bash
# Start the monitoring stack
cd monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

**What to say to the teacher:**
> *"To satisfy the Site Reliability Engineering (SRE) requirements, I instrumented the backend to expose Prometheus metrics. I've deployed Prometheus to scrape this data and Grafana to visualize it."*

**Visual Proof:** 
1. Open a new tab and go to `http://localhost:5000/metrics`. Show the raw metrics text (this proves the backend is instrumented).
2. Open another tab and go to `http://localhost:3000` (Login: `admin` / `brainbrush`). 
3. Navigate to the **BrainBrush Dashboard**. 
4. Refresh your backend page a few times to show the **Request Rate** and **Active Connections** graphs spiking in real-time.

---

## Step 3: Demonstrate CI/CD (GitHub Actions)
**Context to explain:** The pipeline automates testing and deployment. This is the core of CI/CD.

**What to do during the demo:**
1. Open the file `backend/src/app.ts` in your IDE.
2. Change the root route message slightly:
   `res.send("Scribble Backend is Running - LIVE DEMO");`
3. Commit and push the code:
   ```bash
   git add backend/src/app.ts
   git commit -m "update: live demo for viva"
   git push origin main
   ```

**What to say to the teacher:**
> *"For Continuous Integration and Deployment, I built a GitHub Actions pipeline. I just pushed a small code change. Let's go to the GitHub repository to watch it automatically build, test, and containerize."*

**Visual Proof:** 
1. Open your GitHub repository in the browser and click the **Actions** tab.
2. Click on the running workflow. Show the teacher the stages: **Source → Build → Test (Jest) → Containerize (Docker) → Deploy (EC2) → Verify**.
3. Point out that if the unit tests fail, the pipeline stops and prevents bad code from reaching production.

---

## Step 4: Demonstrate Kubernetes Orchestration
**Context to explain:** While Docker Compose is great for local dev, Kubernetes is used for production scale.

**What to say to the teacher:**
> *"To handle high traffic, I designed a complete Kubernetes architecture for the application, including Horizontal Pod Auto-scaling."*

**Visual Proof (in your IDE):**
1. Open `k8s/backend-deployment.yml` and point out the `livenessProbe` and `readinessProbe` — explain that K8s uses the `/health` endpoint we built to know if it needs to restart a crashed container automatically.
2. Open `k8s/hpa.yml` — explain that this file tells Kubernetes to automatically scale the backend from 3 pods up to 10 pods if CPU usage exceeds 70%.

*(If you have Minikube installed and running locally, you can also run `kubectl apply -f k8s/` and `kubectl get pods -n brainbrush` to show them running).*

---

## Step 5: Demonstrate SRE Practices
**Context to explain:** This covers the final syllabus requirement regarding SLIs, SLOs, and Error Budgets.

**What to say to the teacher:**
> *"Finally, as part of the observability and reliability requirements, I defined formal SRE practices for the team."*

**Visual Proof:**
1. Open the `docs/sre-practices.md` file in your IDE (use Markdown preview mode if possible).
2. Show the **SLO Table** — explain that we target **99.9% uptime**, which gives us an **Error Budget** of ~43 minutes of downtime per month.
3. Open `monitoring/prometheus/alert_rules.yml` — show how Prometheus is configured to automatically alert the on-call engineer if the Error Rate exceeds 5% or if the server goes down.
