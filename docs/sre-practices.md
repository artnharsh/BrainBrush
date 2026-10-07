# Site Reliability Engineering (SRE) Practices — BrainBrush

## Overview

This document defines the SRE practices for BrainBrush, a real-time multiplayer drawing game. It establishes Service Level Indicators (SLIs), Service Level Objectives (SLOs), error budgets, incident management procedures, and on-call runbooks.

---

## 1. Service Level Indicators (SLIs)

SLIs are **quantitative measures** of the service's behavior from the user's perspective.

| SLI | What It Measures | How We Measure It | Prometheus Metric |
|-----|-----------------|-------------------|-------------------|
| **Availability** | % of successful HTTP responses | `1 - (5xx responses / total responses)` | `http_requests_total{status_code=~"5.."}` |
| **Latency (p95)** | 95th percentile response time | Histogram quantile of request duration | `http_request_duration_seconds_bucket` |
| **Error Rate** | % of requests returning errors | `(4xx + 5xx) / total requests` | `http_errors_total` / `http_requests_total` |
| **WebSocket Uptime** | % of time Socket.IO is accepting connections | Gauge of active connections > 0 | `websocket_connections_active` |

### How to read these in Prometheus:

```promql
# Availability over the last 24 hours
1 - (
  sum(increase(http_requests_total{status_code=~"5.."}[24h]))
  /
  sum(increase(http_requests_total[24h]))
)

# p95 Latency over the last 5 minutes
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# Error rate (last 5 minutes)
sum(rate(http_errors_total[5m])) / sum(rate(http_requests_total[5m])) * 100
```

---

## 2. Service Level Objectives (SLOs)

SLOs are the **target values** for our SLIs — the bar we commit to maintaining.

| SLO | Target | Measurement Window | Allowed Downtime (per 30 days) |
|-----|--------|-------------------|-------------------------------|
| **Availability** | 99.9% | Rolling 30 days | 43.2 minutes |
| **Latency (p95)** | < 500ms | Rolling 5 minutes | — |
| **Error Rate** | < 1% | Rolling 30 days | — |
| **Deployment Success** | 95% | Per deployment | — |

### Why 99.9% and not 99.99%?

BrainBrush is a game, not a financial system. 99.9% gives us ~43 minutes of allowed downtime per month, which is realistic for a small team. 99.99% (4.3 minutes/month) would require redundant infrastructure and 24/7 on-call — overkill for this use case.

---

## 3. Error Budget

The error budget is the **acceptable amount of unreliability** — the gap between 100% and the SLO.

### Calculation

```
Error Budget = 1 - SLO

For 99.9% availability:
  Error Budget = 1 - 0.999 = 0.001 = 0.1%

In a 30-day window (43,200 minutes):
  Allowed downtime = 43,200 × 0.001 = 43.2 minutes
```

### Error Budget Policy

| Budget Remaining | Action |
|-----------------|--------|
| > 50% | Normal development velocity. Ship features. |
| 25% – 50% | Slow down. Prioritize reliability work. |
| 10% – 25% | Feature freeze. Focus only on reliability. |
| < 10% | All hands on reliability. Halt all deployments. |

### How to track it:

```promql
# Error budget consumption (% of budget used in last 30 days)
(
  sum(increase(http_requests_total{status_code=~"5.."}[30d]))
  /
  sum(increase(http_requests_total[30d]))
) / 0.001 * 100
```

---

## 4. Monitoring & Alerting

### Alert Rules (defined in `monitoring/prometheus/alert_rules.yml`)

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| `HighErrorRate` | > 5% 5xx errors for 5 min | 🔴 Critical | Page on-call, check backend logs |
| `HighLatency` | p95 > 1s for 5 min | 🟡 Warning | Investigate slow queries |
| `InstanceDown` | Target unreachable for 1 min | 🔴 Critical | Check EC2/container status |
| `HighMemoryUsage` | > 85% for 5 min | 🟡 Warning | Check for memory leaks |
| `HighCpuUsage` | > 80% for 5 min | 🟡 Warning | Consider scaling |
| `DiskSpaceRunningLow` | > 80% disk used | 🟡 Warning | Clean up Docker images |

### Three Pillars of Observability

| Pillar | Tool | What It Provides |
|--------|------|-----------------|
| **Metrics** | Prometheus + Grafana | Numeric time-series data (request rate, CPU %, latency) |
| **Logs** | Docker logs / ELK Stack | Textual event records (errors, request details) |
| **Traces** | (Future: Jaeger/Zipkin) | Request flow across services (distributed tracing) |

---

## 5. Incident Management

### Severity Levels

| Severity | Description | Response Time | Example |
|----------|-------------|---------------|---------|
| **SEV-1** | Complete outage, all users affected | Immediate (< 15 min) | Backend is down, no one can play |
| **SEV-2** | Major feature broken, many users affected | < 30 min | WebSocket connections failing, can't draw |
| **SEV-3** | Minor feature broken, some users affected | < 2 hours | Game history page not loading |
| **SEV-4** | Cosmetic issue, minimal impact | Next business day | Scoreboard alignment off |

### Incident Response Procedure

```
1. DETECT    → Alert fires in Prometheus / Grafana
2. TRIAGE    → Determine severity (SEV-1 to SEV-4)
3. RESPOND   → Assign incident commander, communicate status
4. DIAGNOSE  → Check logs, metrics, recent deployments
5. MITIGATE  → Rollback, restart, scale up, or hotfix
6. RESOLVE   → Confirm fix, close incident
7. POST-MORTEM → Document what happened and how to prevent it
```

### Post-Mortem Template

```markdown
## Incident Post-Mortem: [Title]

**Date**: YYYY-MM-DD
**Duration**: X hours Y minutes
**Severity**: SEV-X
**Authors**: [Names]

### Summary
[1-2 sentence summary of what happened]

### Impact
- Users affected: [number/percentage]
- Duration: [time]
- Revenue impact: [if applicable]

### Timeline
| Time (IST) | Event |
|------------|-------|
| HH:MM | Alert fired: [alert name] |
| HH:MM | On-call acknowledged |
| HH:MM | Root cause identified |
| HH:MM | Mitigation applied |
| HH:MM | Service fully restored |

### Root Cause
[Detailed explanation of what went wrong]

### Resolution
[What was done to fix it]

### Lessons Learned
- What went well:
- What went poorly:
- Where we got lucky:

### Action Items
| Action | Owner | Priority | Due Date |
|--------|-------|----------|----------|
| [action] | [name] | P1/P2/P3 | YYYY-MM-DD |
```

---

## 6. On-Call Runbook

### Backend is Down (InstanceDown alert)

```bash
# 1. Check if the container is running
ssh -i brainbrush-key.pem ubuntu@<EC2_IP>
docker ps -a

# 2. Check container logs
docker logs brainbrush-backend --tail 50

# 3. Restart the container
cd ~/brainbrush
docker compose down
docker compose up -d

# 4. Verify health
curl http://localhost:5000/health
```

### High Error Rate (HighErrorRate alert)

```bash
# 1. Check recent error logs
docker logs brainbrush-backend --tail 100 | grep -i "error"

# 2. Check database connectivity
docker exec -it brainbrush-backend node -e "
  const mongoose = require('mongoose');
  console.log('DB State:', mongoose.connection.readyState);
"

# 3. Check recent deployments (was something just deployed?)
docker images | head -5

# 4. If caused by a bad deploy, rollback:
docker pull caliber001/brainbrush-backend:<previous-sha>
docker compose down
# Update docker-compose.yml with previous tag
docker compose up -d
```

### High Memory Usage

```bash
# 1. Check which container is using the most memory
docker stats --no-stream

# 2. Check Node.js heap usage
curl http://localhost:5000/health | python3 -m json.tool

# 3. Restart the backend (quick fix)
docker restart brainbrush-backend

# 4. Clean up Docker resources
docker system prune -af
```
