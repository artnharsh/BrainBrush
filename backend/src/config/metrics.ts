import client from "@prometheus-io/client";

/**
 * Prometheus Metrics Configuration
 *
 * Collects both default Node.js runtime metrics and custom
 * application-specific metrics for monitoring via Prometheus + Grafana.
 *
 * Default metrics include:
 *  - process_cpu_seconds_total
 *  - process_resident_memory_bytes
 *  - nodejs_heap_size_total_bytes
 *  - nodejs_eventloop_lag_seconds
 *  - etc.
 */

// Create a dedicated registry (keeps metrics isolated)
const register = new client.Registry();

// Add a default label to all metrics
register.setDefaultLabels({
    app: "brainbrush-backend",
});

// Collect default Node.js / process metrics (CPU, memory, event loop, GC)
client.collectDefaultMetrics({ register });

// ─────────────────────────────────────────────
// Custom Application Metrics
// ─────────────────────────────────────────────

/**
 * Total HTTP requests received.
 * Labels: method (GET/POST), route (/health, /auth/google), status_code (200, 404, 500)
 */
export const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests received",
    labelNames: ["method", "route", "status_code"] as const,
    registers: [register],
});

/**
 * HTTP request duration in seconds.
 * Uses histogram buckets for percentile calculations (p50, p95, p99).
 */
export const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [register],
});

/**
 * Number of currently active WebSocket (Socket.IO) connections.
 * Incremented on connect, decremented on disconnect.
 */
export const websocketConnectionsActive = new client.Gauge({
    name: "websocket_connections_active",
    help: "Number of currently active WebSocket connections",
    registers: [register],
});

/**
 * Number of currently active game rooms.
 * Tracks how many rooms are in use at any given time.
 */
export const gameRoomsActive = new client.Gauge({
    name: "game_rooms_active",
    help: "Number of currently active game rooms",
    registers: [register],
});

/**
 * Total number of HTTP errors (status >= 400).
 * Useful for SRE error-rate SLI calculations.
 */
export const httpErrorsTotal = new client.Counter({
    name: "http_errors_total",
    help: "Total number of HTTP error responses (4xx and 5xx)",
    labelNames: ["method", "route", "status_code"] as const,
    registers: [register],
});

export { register };
export default register;
