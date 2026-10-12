# ☸️ BrainBrush Kubernetes (K8s) Architecture & Command Guide

A comprehensive, zero-to-hero guide covering Kubernetes concepts, manifest architectures, terminal commands, output breakdowns, and viva/interview defense strategies for the **BrainBrush** project.

---

## 📑 Table of Contents
1. [What is Kubernetes & Why Use It?](#1-what-is-kubernetes--why-use-it)
2. [High-Level Architecture](#2-high-level-architecture)
3. [BrainBrush K8s Building Blocks Explained](#3-brainbrush-k8s-building-blocks-explained)
4. [Manifests Breakdown (`k8s/` Directory)](#4-manifests-breakdown-k8s-directory)
5. [Complete Command Execution Guide (What, Why & Output Breakdown)](#5-complete-command-execution-guide)
6. [Decoding `kubectl get all` Output (Line-by-Line)](#6-decoding-kubectl-get-all-output)
7. [Real Troubleshooting Story: Debugging CrashLoopBackOff](#7-real-troubleshooting-story-debugging-crashloopbackoff)
8. [Live Demonstration Script for Examiners](#8-live-demonstration-script-for-examiners)
9. [Viva & Interview Q&A (K8s Rapid Fire)](#9-viva--interview-qa-k8s-rapid-fire)

---

## 1. What is Kubernetes & Why Use It?

### What is Kubernetes?
**Kubernetes (K8s)** is an open-source container orchestration platform that automates the deployment, scaling, management, and self-healing of containerized applications.

### Why not just use Docker or Docker Compose?
| Feature | Docker Compose | Kubernetes (K8s) |
| :--- | :--- | :--- |
| **Scope** | Single host (1 machine) | Multi-node cluster (hundreds of machines) |
| **High Availability** | If the host dies, everything goes down | If a node dies, pods are rescheduled automatically |
| **Auto-scaling (HPA)**| Manual (`docker compose up --scale backend=5`) | Fully automatic based on real-time CPU/RAM metrics |
| **Rolling Updates** | Replaces containers with downtime risk | Zero-downtime rolling updates with automatic rollback |
| **Self-Healing** | Basic `restart: always` | Active liveness/readiness probes + traffic isolation |

### Viva Architecture Justification:
> *"In BrainBrush, we use Docker Compose on our AWS EC2 instance (`t2.micro` with 1 GB RAM) to keep resource consumption minimal. However, for enterprise production and multi-node cloud environments (such as AWS EKS), we designed production-grade declarative Kubernetes manifests capable of auto-scaling, high availability, and multi-replica fault tolerance."*

---

## 2. High-Level Architecture

```
                                  [ External Internet / Browser ]
                                                 │
                                                 ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 KUBERNETES CLUSTER                                     │
│                                                                                        │
│  ┌───────────────────────┐                                                             │
│  │     Control Plane     │  (API Server, etcd, Controller Manager, Scheduler)          │
│  └───────────┬───────────┘                                                             │
│              │                                                                         │
│              ▼                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              Namespace: brainbrush                               │  │
│  │                                                                                  │  │
│  │  ┌──────────────────────┐         ┌───────────────────────────────────────────┐  │  │
│  │  │   ConfigMap & Secret │ ──────> │             backend Deployment            │  │  │
│  │  └──────────────────────┘         │  (3 Replicas: Pod-1, Pod-2, Pod-3)        │  │  │
│  │                                   └─────────────────────┬─────────────────────┘  │  │
│  │                                                         │                        │  │
│  │                                                         ▼                        │  │
│  │  ┌────────────────────────┐         ┌─────────────────────────────────────────┐  │  │
│  │  │   frontend Deployment  │ ──────> │          Services (Internal LB)         │  │  │
│  │  │ (2 Replicas: Pod-1, 2) │         │ - service/backend (ClusterIP :5000)     │  │  │
│  │  └───────────┬────────────┘         │ - service/brainbrush-backend (:5000)    │  │  │
│  │              │                      └─────────────────────────────────────────┘  │  │
│  │              ▼                                                                   │  │
│  │  ┌────────────────────────┐                                                      │  │
│  │  │  service/frontend      │                                                      │  │
│  │  │  (LoadBalancer :80)    │                                                      │  │
│  │  └────────────────────────┘                                                      │  │
│  │                                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Horizontal Pod Autoscaler (HPA): CPU > 70% ──> Scale backend from 3 to 10   │  │  │
│  │  └────────────────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. BrainBrush K8s Building Blocks Explained

### 1. Minikube
- **What is it?** A lightweight Kubernetes distribution that runs a single-node cluster inside Docker on your local laptop.
- **Why we run it:** It allows us to test enterprise Kubernetes deployments locally without paying hundreds of dollars for AWS EKS or GCP GKE.

### 2. Pod
- **What is it?** The smallest deployable computing unit in Kubernetes.
- **How it works:** A Pod encapsulates one or more containers (in our case, our Node.js app or Nginx container), shared storage volumes, and a unique network IP. Pods are ephemeral (they can die and be recreated anytime).

### 3. Deployment
- **What is it?** A declarative controller that manages Pod lifecycles.
- **How it works:** You describe the *desired state* (`replicas: 3`). The Deployment continuously works to match the actual state to the desired state. If a pod crashes or is killed, the Deployment immediately creates a replacement.

### 4. ReplicaSet
- **What is it?** The low-level mechanism used by Deployments to guarantee that a specific number of Pod replicas are running at any given moment.

### 5. Service (`svc`)
- **What is it?** A stable networking abstraction and internal load balancer.
- **Why we need it:** Because Pods are ephemeral, their IP addresses constantly change when they restart. A Service provides a **static DNS name and IP address** (e.g., `http://brainbrush-backend:5000`) that distributes traffic across all healthy backend Pods.
  - **ClusterIP:** Internal only (e.g. backend). Accessible only by other pods in the cluster.
  - **LoadBalancer:** External entrypoint (e.g. frontend). Exposes the service to the outside world.

### 6. HorizontalPodAutoscaler (HPA)
- **What is it?** An automated controller that dynamically scales the number of Pod replicas up or down based on observed CPU and Memory utilization.

### 7. ConfigMap vs Secret
- **ConfigMap:** Stores non-sensitive plain text key-value pairs (e.g., `PORT=5000`, `NODE_ENV=production`).
- **Secret:** Stores sensitive base64-encoded credentials (e.g., `MONGO_URI`, `JWT_SECRET`, `REDIS_URL`).
- **Why:** Keeps secrets decoupled from the code and container image, preventing accidental security leaks.

### 8. Ingress
- **What is it?** An application-layer (Layer 7) reverse proxy and router that routes HTTP/HTTPS requests from a single public domain to multiple internal services based on paths (e.g., `/api` ➡️ backend, `/` ➡️ frontend).

---

## 4. Manifests Breakdown (`k8s/` Directory)

### File Overview:
| File | Kind | Purpose in BrainBrush |
| :--- | :--- | :--- |
| [`00-namespace.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/namespace.yml) | `Namespace` | Creates the isolated `brainbrush` environment. |
| [`01-configmap.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/configmap.yml) | `ConfigMap` | Injects `NODE_ENV`, `PORT`, and CORS origin URLs. |
| [`02-secret.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/secret.yml) | `Secret` | Injects base64-encoded `MONGO_URI`, `REDIS_URL`, `JWT_SECRET`. |
| [`03-backend-deployment.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/backend-deployment.yml) | `Deployment` + `Service` | 3 replicas of backend, Liveness/Readiness probes, ClusterIP service. |
| [`04-frontend-deployment.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/frontend-deployment.yml) | `Deployment` + `Service` | 2 replicas of Nginx frontend, LoadBalancer service. |
| [`05-hpa.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/hpa.yml) | `HorizontalPodAutoscaler` | Auto-scales backend from 3 to 10 pods when CPU > 70%. |
| [`06-ingress.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/ingress.yml) | `Ingress` | Domain-level path routing with WebSocket support. |

---

## 5. Complete Command Execution Guide

Here are all the commands you run, why we run them, and what happens behind the scenes.

---

### Command 1: Start the Cluster
```bash
minikube start --driver=docker
```
- **Why we run it:** Boots up the Kubernetes control plane (API Server, scheduler, etcd) inside a Docker container on your machine.
- **Expected Output:**
  ```text
  😄  minikube v1.35.1 on Arch rolling
  ✨  Using the docker driver based on existing profile
  👍  Starting "minikube" primary control-plane node in "minikube" cluster
  🚜  Pulling base image v0.0.46 ...
  🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace
  ```

---

### Command 2: Verify Cluster Health
```bash
kubectl cluster-info
kubectl get nodes
```
- **Why we run it:** Confirms that `kubectl` (the command-line client) can communicate with the Kubernetes API server and that the worker node is `Ready`.
- **Expected Output:**
  ```text
  NAME       STATUS   ROLES           AGE     VERSION
  minikube   Ready    control-plane   5m12s   v1.35.1
  ```

---

### Command 3: Apply All Manifests
```bash
kubectl apply -f k8s/
```
- **Why we run it:** Sends all YAML definitions to the Kubernetes API server. Kubernetes reads the manifests and starts building the desired infrastructure.
- **Expected Output:**
  ```text
  namespace/brainbrush created
  secret/brainbrush-secrets configured
  configmap/brainbrush-config created
  deployment.apps/backend created
  service/backend created
  service/brainbrush-backend created
  deployment.apps/frontend created
  service/frontend created
  horizontalpodautoscaler.autoscaling/backend-hpa created
  ingress.networking.k8s.io/brainbrush-ingress created
  ```

---

### Command 4: Inspect the Entire Namespace
```bash
kubectl get all -n brainbrush
```
- **Why we run it:** Lists all pods, services, deployments, replicasets, and autoscalers in the `brainbrush` namespace.
- **Expected Output:**
  ```text
  NAME                           READY   STATUS    RESTARTS   AGE
  pod/backend-76774c6fbb-629rf   1/1     Running   0          2m
  pod/backend-76774c6fbb-9vp46   1/1     Running   0          2m
  pod/backend-76774c6fbb-nxjjc   1/1     Running   0          2m
  pod/frontend-d6b76b98-n2qbx    1/1     Running   0          2m
  pod/frontend-d6b76b98-xkj82    1/1     Running   0          2m

  NAME                         TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
  service/backend              ClusterIP      10.107.200.251   <none>        5000/TCP       2m
  service/brainbrush-backend   ClusterIP      10.102.69.139    <none>        5000/TCP       2m
  service/frontend             LoadBalancer   10.110.127.211   <pending>     80:31165/TCP   2m

  NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
  deployment.apps/backend    3/3     3            3           2m
  deployment.apps/frontend   2/2     2            2           2m

  NAME                                              REFERENCE            TARGETS                                     MINPODS   MAXPODS   REPLICAS   AGE
  horizontalpodautoscaler.autoscaling/backend-hpa   Deployment/backend   cpu: <unknown>/70%, memory: <unknown>/80%   3         10        3          2m
  ```

---

### Command 5: Inspect Pod Logs
```bash
kubectl logs -n brainbrush -l component=backend --tail=30
```
- **Why we run it:** Streams the standard output (`console.log`) from the backend containers to verify database connections and server initialization.
- **What to look for:**
  - `MongoDB connected successfully`
  - `Server running on port 5000`

---

### Command 6: Inspect Pod Deep Diagnostics
```bash
kubectl describe pod -n brainbrush <pod-name>
```
- **Why we run it:** Shows detailed lifecycle events (Pulling image, Scheduled, Started, Probes, Mounts). Essential when debugging `CrashLoopBackOff` or `Pending` statuses.

---

### Command 7: Access the Frontend Web Application
```bash
minikube service frontend -n brainbrush --url
```
*or forward port to localhost:*
```bash
kubectl port-forward -n brainbrush svc/frontend 8080:80
```
- **Why we run it:** Opens a tunnel directly to the LoadBalancer service, allowing you to access the React frontend at `http://localhost:8080` in your browser.

---

## 6. Decoding `kubectl get all` Output

Here is the exact explanation of every column in the output:

### Pod Section:
```
NAME                           READY   STATUS    RESTARTS   AGE
pod/backend-76774c6fbb-629rf   1/1     Running   0          2m
```
- **`NAME`**: The unique Pod identifier (`<deployment-name>-<replicaset-hash>-<random-pod-id>`).
- **`READY (1/1)`**: `1/1` means 1 out of 1 container in this pod has passed its **Readiness Probe** and is actively receiving user traffic. If it says `0/1`, the container is starting, failing health checks, or crashing.
- **`STATUS (Running)`**: The pod lifecycle state:
  - `Pending`: Waiting to be scheduled onto a node or downloading Docker image.
  - `ContainerCreating`: Docker is creating the container.
  - `Running`: The container is executing properly.
  - `CrashLoopBackOff`: The application crashed repeatedly on startup.
- **`RESTARTS (0)`**: How many times Kubernetes had to restart this pod. `0` indicates perfect stability.
- **`AGE (2m)`**: Time elapsed since the pod was created.

---

### Service Section:
```
NAME               TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/backend    ClusterIP      10.107.200.251   <none>        5000/TCP       2m
service/frontend   LoadBalancer   10.110.127.211   <pending>     80:31165/TCP   2m
```
- **`TYPE`**:
  - `ClusterIP`: Accessible **only inside the cluster network**. Safe for backends and databases.
  - `LoadBalancer`: Creates an external cloud load balancer (or NodePort in local Minikube) to accept internet traffic.
- **`CLUSTER-IP`**: The permanent internal IP assigned by Kubernetes virtual network (`kube-proxy`).
- **`EXTERNAL-IP`**: The public internet IP. In local Minikube, it stays `<pending>` unless `minikube tunnel` or `minikube service` is run.
- **`PORT(S)`**:
  - `5000/TCP`: The internal port where the service listens.
  - `80:31165/TCP`: Port 80 on the Service mapped to NodePort `31165` on the Minikube node.

---

### Deployment Section:
```
NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend    3/3     3            3           2m
```
- **`READY (3/3)`**: 3 pods are running and ready out of 3 desired replicas.
- **`UP-TO-DATE (3)`**: 3 pods are running the latest deployment template/image.
- **`AVAILABLE (3)`**: 3 pods have been healthy and serving traffic for longer than the minimum ready seconds.

---

### Horizontal Pod Autoscaler (HPA) Section:
```
NAME          REFERENCE            TARGETS                                     MINPODS   MAXPODS   REPLICAS
backend-hpa   Deployment/backend   cpu: <unknown>/70%, memory: <unknown>/80%   3         10        3
```
- **`REFERENCE`**: The target deployment being monitored and scaled (`Deployment/backend`).
- **`TARGETS`**: `<current_utilization>/<target_utilization>`. Once metrics-server samples the pods, `<unknown>` turns into real-time percentages (e.g. `12%/70%`).
- **`MINPODS (3)`**: Lower bound. Kubernetes will never scale below 3 pods.
- **`MAXPODS (10)`**: Upper bound. During traffic surges, Kubernetes can scale up to 10 pods maximum.
- **`REPLICAS (3)`**: Number of pods currently alive.

---

## 7. Real Troubleshooting Story: Debugging CrashLoopBackOff

> [!IMPORTANT]
> **This is your strongest viva talking point.** Examiners love candidates who understand how to diagnose and resolve production failures.

### The Problem:
When we first applied `kubectl apply -f k8s/`, all pods immediately went into `CrashLoopBackOff` with `RESTARTS: 5`.

### How We Diagnosed & Resolved It:

#### 1. Backend Failure Diagnosis:
- **Investigation:** We ran `kubectl logs -n brainbrush -l component=backend`.
- **Finding:** The logs showed:
  ```text
  MongoDB connection failed: MongoParseError: Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
  ```
- **Root Cause:** In [`k8s/secret.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/secret.yml), the secret was holding dummy placeholder strings (`your_mongodb_connection_string` base64-encoded).
- **Resolution:** We injected the real base64-encoded Atlas MongoDB and Upstash Redis credentials into `k8s/secret.yml`.

#### 2. Frontend Failure Diagnosis:
- **Investigation:** We ran `kubectl logs -n brainbrush -l component=frontend`.
- **Finding:** The Nginx error log reported:
  ```text
  [emerg] 1#1: host not found in upstream "brainbrush-backend" in /etc/nginx/conf.d/default.conf:7
  ```
- **Root Cause:** The frontend Nginx reverse proxy was configured to pass traffic to `http://brainbrush-backend:5000`. However, the Kubernetes Service was named `backend`. Kubernetes DNS could not resolve the hostname `brainbrush-backend`.
- **Resolution:** We created a secondary Service alias named `brainbrush-backend` in [`k8s/backend-deployment.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/backend-deployment.yml).

#### 3. Zero-Downtime Rollout:
- We executed:
  ```bash
  kubectl apply -f k8s/
  kubectl rollout restart deployment -n brainbrush
  ```
- **Result:** Kubernetes gracefully cycled all old crashing pods out and replaced them with **5 perfectly healthy pods (3 backend, 2 frontend) running with 0 restarts**.

---

## 8. Live Demonstration Script for Examiners

Follow this step-by-step walkthrough during your practical exam:

```bash
# STEP 1: Show the cluster node
kubectl get nodes

# STEP 2: Show all deployed resources
kubectl get all -n brainbrush

# STEP 3: Demonstrate Self-Healing (Fault Tolerance)
# Kill one backend pod and watch K8s resurrect it immediately:
POD_NAME=$(kubectl get pods -n brainbrush -l component=backend -o jsonpath='{.items[0].metadata.name}')
echo "Killing pod: $POD_NAME"
kubectl delete pod -n brainbrush $POD_NAME

# Immediately watch pods recreate:
kubectl get pods -n brainbrush
```

### What to say to the Examiner:
> *"Notice that as soon as I deleted pod `$POD_NAME`, the Kubernetes Deployment controller detected that the current state (2 pods) did not match the desired state (3 replicas). In less than 2 seconds, it automatically scheduled and started a fresh pod with zero downtime for our users."*

---

## 9. Viva & Interview Q&A (K8s Rapid Fire)

### Q1: What is the difference between a Pod and a Container?
**Answer:** A container is an individual execution environment (e.g. Docker container). A **Pod** is a Kubernetes abstraction that wraps one or more tightly coupled containers. Containers inside the same Pod share the same network namespace (localhost IP), storage volumes, and lifecycle.

### Q2: Why do you need both a Liveness Probe and a Readiness Probe?
**Answer:**
- **Liveness Probe:** Checks *"Is the application still alive?"* If the application enters a deadlock or memory freeze and fails 3 consecutive checks at `/health`, Kubernetes **kills and restarts** the container.
- **Readiness Probe:** Checks *"Is the container ready to receive incoming traffic?"* If an app is still loading caches or database connections on startup, Kubernetes removes the pod from the Service load balancer so users don't get 502/503 errors.

### Q3: What is the difference between `ClusterIP`, `NodePort`, and `LoadBalancer`?
**Answer:**
- **`ClusterIP`**: Default. Exposes the service on a cluster-internal IP. Accessible only within the cluster.
- **`NodePort`**: Exposes the service on each Node's IP at a static port (between 30000–32767).
- **`LoadBalancer`**: Provisions a cloud provider's external load balancer (AWS ALB/NLB) and automatically routes traffic to the pods.

### Q4: How does the Horizontal Pod Autoscaler (HPA) decide to scale?
**Answer:** The HPA controller queries the `metrics-server` every 15–30 seconds and applies the mathematical formula:
$$\text{Desired Replicas} = \left\lceil \text{Current Replicas} \times \left( \frac{\text{Current CPU Utilization}}{\text{Target CPU Utilization}} \right) \right\rceil$$
If 3 pods are running at 90% CPU and target is 70%:
$$\text{Desired Replicas} = \lceil 3 \times (90 / 70) \rceil = \lceil 3.86 \rceil = 4 \text{ pods}$$

### Q5: How do Rolling Updates achieve zero downtime?
**Answer:** In [`backend-deployment.yml`](file:///home/xcaliber/Projects/BrainBrush/k8s/backend-deployment.yml), we configured:
- `maxSurge: 1`: Kubernetes spins up 1 new container before terminating any old ones.
- `maxUnavailable: 0`: Kubernetes ensures that at no point during deployment are there fewer than 3 pods serving traffic. Only after the new pod passes its Readiness Probe is an old pod safely terminated.
