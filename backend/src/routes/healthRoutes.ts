import { Router, Request, Response } from "express";
import mongoose from "mongoose";

const router = Router();

/**
 * GET /health
 *
 * Health check endpoint used by:
 *  - Docker HEALTHCHECK
 *  - Kubernetes liveness & readiness probes
 *  - CI/CD deploy verification step
 *  - Prometheus up/down monitoring
 *
 * Returns current service status, uptime, memory usage,
 * and database connection state.
 */
router.get("/", (_req: Request, res: Response) => {
    const memoryUsage = process.memoryUsage();

    const healthData = {
        status: "ok",
        service: "brainbrush-backend",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
        database: {
            status: getDbStatus(mongoose.connection.readyState),
            readyState: mongoose.connection.readyState,
        },
        memory: {
            heapUsed: formatBytes(memoryUsage.heapUsed),
            heapTotal: formatBytes(memoryUsage.heapTotal),
            rss: formatBytes(memoryUsage.rss),
            external: formatBytes(memoryUsage.external),
        },
    };

    // Return 503 if database is not connected
    const statusCode = mongoose.connection.readyState === 1 ? 200 : 503;
    res.status(statusCode).json(healthData);
});

/**
 * Maps Mongoose readyState number to a human-readable string.
 */
function getDbStatus(state: number): string {
    const states: Record<number, string> = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
    };
    return states[state] || "unknown";
}

/**
 * Converts bytes to a human-readable string (e.g., "45.23 MB").
 */
function formatBytes(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
}

export default router;
