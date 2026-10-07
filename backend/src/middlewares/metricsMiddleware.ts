import { Request, Response, NextFunction } from "express";
import {
    httpRequestsTotal,
    httpRequestDuration,
    httpErrorsTotal,
} from "../config/metrics";

/**
 * Metrics Middleware
 *
 * Intercepts every HTTP request and records:
 *  - Total request count (by method, route, status code)
 *  - Request duration in seconds (histogram for percentiles)
 *  - Error count for 4xx/5xx responses
 *
 * This middleware should be registered BEFORE route handlers
 * so it can measure the full request lifecycle.
 *
 * Excludes /metrics endpoint to avoid self-referential metric inflation.
 */
export function metricsMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Don't track metrics requests themselves (avoids noise)
    if (req.path === "/metrics") {
        next();
        return;
    }

    const startTime = Date.now();

    // Hook into the response "finish" event to record metrics
    // after the response has been fully sent
    res.on("finish", () => {
        const duration = (Date.now() - startTime) / 1000; // Convert ms → seconds
        const route = getRoutePath(req);
        const method = req.method;
        const statusCode = res.statusCode.toString();

        // Record request count
        httpRequestsTotal.inc({
            method,
            route,
            status_code: statusCode,
        });

        // Record request duration
        httpRequestDuration.observe(
            {
                method,
                route,
                status_code: statusCode,
            },
            duration
        );

        // Record errors separately for easy SLI calculations
        if (res.statusCode >= 400) {
            httpErrorsTotal.inc({
                method,
                route,
                status_code: statusCode,
            });
        }
    });

    next();
}

/**
 * Normalizes the route path for metric labels.
 *
 * Uses Express's matched route pattern (e.g., /api/player/:id)
 * instead of the actual URL (e.g., /api/player/abc123) to prevent
 * high-cardinality label explosion in Prometheus.
 */
function getRoutePath(req: Request): string {
    // Use the matched route pattern if available
    if (req.route?.path) {
        return req.baseUrl + req.route.path;
    }
    // Fallback: use the base path
    return req.baseUrl || req.path || "unknown";
}
