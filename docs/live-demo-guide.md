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

# Show the running containers and their ports
docker ps

# Show live resource usage (CPU/RAM) of the containers
docker stats
```

**What to say to the teacher:**
> *"First, I have containerized the entire application. As you can see by running `docker ps` and `docker stats`, our backend, frontend, MongoDB, and Redis are all running in isolated, lightweight containers via Docker Compose. This ensures environment consistency across development and production."*

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
**Commands to run in terminal (Requires Minikube or a K8s cluster running):**
```bash
# 1. Apply all Kubernetes configurations to the cluster
kubectl apply -f k8s/

# 2. Show the teacher the running pods
kubectl get pods -n brainbrush

# 3. Show the services (Internal Load Balancers)
kubectl get svc -n brainbrush

# 4. Show the Horizontal Pod Autoscaler (Auto-scaling)
kubectl get hpa -n brainbrush
```

**What to say to the teacher:**
> *"To handle high production traffic, I designed a Kubernetes architecture. By running `kubectl get pods`, you can see multiple replicas of our backend running. If we look at `kubectl get hpa`, you'll see the autoscaler is configured to spin up to 10 pods automatically if CPU usage crosses 70%."*

**Visual Proof:**
1. **Run the commands above** in your terminal. Point out the `STATUS: Running` for the pods to prove it works.
2. **Point to the HPA output** where it shows `MINPODS: 3`, `MAXPODS: 10`, and `TARGETS: <unknown>/70%`. Explain that this is how modern apps survive traffic spikes.
3. **Open `k8s/backend-deployment.yml`** in your IDE and point out the `livenessProbe`. Explain that K8s uses the `/health` endpoint we built to detect if the app freezes, and automatically kills and restarts the container with zero human intervention.

---

## Step 5: Demonstrate SRE Practices
**Context to explain:** This covers the final syllabus requirement regarding SLIs, SLOs, and Error Budgets.

**What to say to the teacher:**
> *"Finally, as part of the observability and reliability requirements, I defined formal Site Reliability Engineering (SRE) practices. We don't just guess if the app is reliable; we measure it."*

**Visual Proof:**
1. Open the `docs/sre-practices.md` file in your IDE (use Markdown preview mode).
2. Show the **SLO Table** — explain that we target **99.9% uptime**, which gives us a strict **Error Budget** of ~43.2 minutes of downtime per month.
3. Open `monitoring/prometheus/alert_rules.yml` — show how Prometheus is configured to automatically alert the on-call engineer if the Error Rate exceeds 5% or if a server runs out of disk space.
4. **Live Alert Demo:** Open `http://localhost:9090/alerts` in your browser to show the teacher the actual Prometheus alerting engine running live with your custom rules loaded!
