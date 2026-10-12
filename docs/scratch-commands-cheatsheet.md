# 🚀 BrainBrush Complete From-Scratch Commands Cheat Sheet

> **Emergency Viva / Demo Guide**: Everything you need to spin up **Prometheus & Grafana** and **Kubernetes** from absolute scratch on your terminal, with zero guesswork.

---

## 📑 Quick Navigation
1. [PART 1: Prometheus + Grafana + Node Exporter (From Scratch)](#part-1-prometheus--grafana--node-exporter-from-scratch)
   - [Method A: Local Docker Compose (Fastest & 100% Offline)](#method-a-local-docker-compose-fastest--offline)
   - [Method B: Via Ansible (Cloud / Remote Server)](#method-b-via-ansible-remote-server)
2. [PART 2: Kubernetes (From Scratch via Minikube)](#part-2-kubernetes-from-scratch-via-minikube)
3. [PART 3: Teacher Live Demo Script (Step-by-Step Execution)](#part-3-teacher-live-demo-script)
4. [PART 4: Clean Shutdown Commands](#part-4-clean-shutdown-commands)

---

# PART 1: Prometheus + Grafana + Node Exporter (From Scratch)

You have two ways to run this depending on what your teacher asks:

---

### Method A: Local Docker Compose (Fastest & 100% Offline)
*Use this if your teacher says: "Run Prometheus and Grafana on your machine right now!"*

#### 1. Navigate to the project directory:
```bash
cd /home/xcaliber/Projects/BrainBrush
```

#### 2. Start the monitoring stack in the background:
```bash
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```
*(Docker will pull images and start `brainbrush-prometheus`, `brainbrush-grafana`, and `brainbrush-node-exporter`)*

#### 3. Verify that all 3 containers are healthy:
```bash
docker ps --filter "name=brainbrush"
```
**Expected Output:**
```text
CONTAINER ID   IMAGE                       COMMAND                  STATUS         PORTS                    NAMES
a1b2c3d4e5f6   grafana/grafana:latest      "/run.sh"                Up (healthy)   0.0.0.0:3000->3000/tcp   brainbrush-grafana
b2c3d4e5f6a1   prom/prometheus:latest      "/bin/prometheus --c…"   Up (healthy)   0.0.0.0:9090->9090/tcp   brainbrush-prometheus
c3d4e5f6a1b2   prom/node-exporter:latest   "/bin/node_exporter …"   Up (healthy)   0.0.0.0:9100->9100/tcp   brainbrush-node-exporter
```

#### 4. Open URLs in your browser:
| Service | URL | What to show the Teacher |
| :--- | :--- | :--- |
| **Grafana** | `http://localhost:3000` | Login: `admin` / `brainbrush`<br>Go to **Dashboards ➡️ BrainBrush System & App Metrics**. Shows CPU, Memory, Request Rates. |
| **Prometheus** | `http://localhost:9090` | Go to **Status ➡️ Targets** (`http://localhost:9090/targets`). Point out `node-exporter` and `backend` are **UP (1/1)**. |
| **Prometheus Alerts** | `http://localhost:9090/alerts` | Shows your pre-configured alert rules: `HighCPUUsage`, `HighErrorRate`, `ServiceDown`. |
| **Node Exporter** | `http://localhost:9100/metrics` | Shows raw Linux host telemetry (RAM, CPU, Disk I/O). |

#### 5. Stop the local monitoring stack when done:
```bash
docker compose -f monitoring/docker-compose.monitoring.yml down
```

---

### Method B: Via Ansible (Remote Server)
*Use this if your teacher says: "Deploy monitoring to your server using configuration management!"*

#### 1. Navigate to the ansible directory:
```bash
cd /home/xcaliber/Projects/BrainBrush/ansible
```

#### 2. Run the Ansible playbook:
```bash
ansible-playbook -i inventory.ini monitoring.yml
```

#### 3. Verify remotely:
```bash
ansible -i inventory.ini servers -b -m command -a "docker ps"
```

---

# PART 2: Kubernetes (From Scratch via Minikube)

*Use this when your teacher asks: "Show me your Kubernetes cluster from scratch!"*

#### 1. Navigate to project root:
```bash
cd /home/xcaliber/Projects/BrainBrush
```

#### 2. Start Minikube cluster:
```bash
minikube start --driver=docker
```
*(Takes ~60 seconds to initialize the single-node control plane inside Docker)*

#### 3. Verify cluster nodes:
```bash
kubectl get nodes
```
**Expected Output:**
```text
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   60s   v1.35.1
```

#### 4. Deploy all BrainBrush manifests:
```bash
# Step 4a: Apply namespace first (prevents dependency errors)
kubectl apply -f k8s/namespace.yml

# Step 4b: Apply all deployments, services, secrets, and HPAs
kubectl apply -f k8s/
```

#### 5. Verify all running pods, services, and autoscalers:
```bash
kubectl get all -n brainbrush
```
**Expected Output:**
```text
NAME                           READY   STATUS    RESTARTS   AGE
pod/backend-76774c6fbb-629rf   1/1     Running   0          45s
pod/backend-76774c6fbb-9vp46   1/1     Running   0          45s
pod/backend-76774c6fbb-nxjjc   1/1     Running   0          45s
pod/frontend-d6b76b98-n2qbx    1/1     Running   0          45s
pod/frontend-d6b76b98-xkj82    1/1     Running   0          45s

NAME                         TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/backend              ClusterIP      10.107.200.251   <none>        5000/TCP       45s
service/brainbrush-backend   ClusterIP      10.102.69.139    <none>        5000/TCP       45s
service/frontend             LoadBalancer   10.110.127.211   <pending>     80:31165/TCP   45s

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend    3/3     3            3           45s
deployment.apps/frontend   2/2     2            2           45s

NAME                                              REFERENCE            TARGETS                                     MINPODS   MAXPODS   REPLICAS   AGE
horizontalpodautoscaler.autoscaling/backend-hpa   Deployment/backend   cpu: <unknown>/70%, memory: <unknown>/80%   3         10        3          45s
```

#### 6. Open the Frontend Web Application:
```bash
minikube service frontend -n brainbrush --url
```
*(Click the generated link in your terminal to see the live React landing page served from your K8s pod!)*

---

# PART 3: Teacher Live Demo Script

Here is the exact 2-minute demonstration flow to wow your teacher:

### Demo 1: Show Pods and Replicas
Run:
```bash
kubectl get pods -n brainbrush
```
> **Say:** *"We configured 3 backend replicas and 2 frontend replicas to guarantee High Availability and zero downtime."*

---

### Demo 2: Demonstrate Self-Healing (Fault Tolerance)
Kill a live pod in front of the teacher:
```bash
# 1. Grab first backend pod and kill it
POD=$(kubectl get pods -n brainbrush -l component=backend -o jsonpath='{.items[0].metadata.name}')
echo "Killing: $POD"
kubectl delete pod -n brainbrush $POD

# 2. Immediately inspect pods:
kubectl get pods -n brainbrush
```
> **Say:** *"Notice that as soon as pod `$POD` was deleted, the Deployment controller detected that the cluster had only 2 pods instead of the desired 3. It immediately scheduled and started a replacement container in under 2 seconds without human intervention."*

---

### Demo 3: Show Horizontal Pod Autoscaler (HPA)
Run:
```bash
kubectl get hpa -n brainbrush
```
> **Say:** *"Our autoscaler continuously monitors CPU and RAM. If traffic spikes and CPU crosses 70%, it automatically scales our backend up to 10 pods."*

---

### Demo 4: Show Production Probes (Health Checks)
Run:
```bash
kubectl describe pod -n brainbrush -l component=backend | grep -E "Liveness|Readiness"
```
> **Say:** *"Our pods have Liveness and Readiness probes that query our `/health` endpoint every 10–30 seconds. If a pod deadlocks, Kubernetes restarts it automatically."*

---

# PART 4: Clean Shutdown Commands

When your viva/demo is finished, run these commands to cleanly free up all laptop resources:

```bash
# 1. Stop Kubernetes cluster (saves your state, frees 100% CPU and RAM)
minikube stop

# 2. Stop Monitoring Stack (if running locally)
docker compose -f monitoring/docker-compose.monitoring.yml down
```

---

## ⚡ Master Quick Copy-Paste Block

Save this in your clipboard for the fastest possible deployment:

```bash
# --- START MONITORING ---
cd /home/xcaliber/Projects/BrainBrush
docker compose -f monitoring/docker-compose.monitoring.yml up -d

# --- START KUBERNETES ---
minikube start --driver=docker
kubectl apply -f k8s/namespace.yml && kubectl apply -f k8s/
kubectl get all -n brainbrush
```
