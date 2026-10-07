import request from "supertest";
import express from "express";

/**
 * Health Endpoint Tests
 *
 * These tests verify the /health endpoint works correctly.
 * They run in CI to validate the backend is structurally sound
 * before Docker image builds proceed.
 *
 * Note: We create a minimal Express app with just the health route
 * to avoid needing MongoDB/Redis connections during testing.
 */

// Create a minimal test app with only the health route
const app = express();

// We import the health route directly to test it in isolation
import healthRoutes from "../routes/healthRoutes";
app.use("/health", healthRoutes);

describe("GET /health", () => {
    it("should return 200 or 503 status", async () => {
        const response = await request(app).get("/health");
        // 503 is expected when MongoDB isn't connected (test environment)
        expect([200, 503]).toContain(response.status);
    });

    it("should return JSON with correct shape", async () => {
        const response = await request(app).get("/health");
        const body = response.body;

        // Verify required fields exist
        expect(body).toHaveProperty("status");
        expect(body).toHaveProperty("service", "brainbrush-backend");
        expect(body).toHaveProperty("timestamp");
        expect(body).toHaveProperty("uptime");
        expect(body).toHaveProperty("database");
        expect(body).toHaveProperty("memory");
    });

    it("should have valid timestamp", async () => {
        const response = await request(app).get("/health");
        const timestamp = new Date(response.body.timestamp);
        expect(timestamp.getTime()).not.toBeNaN();
    });

    it("should report memory in MB format", async () => {
        const response = await request(app).get("/health");
        const memory = response.body.memory;

        expect(memory.heapUsed).toMatch(/^\d+\.\d+ MB$/);
        expect(memory.heapTotal).toMatch(/^\d+\.\d+ MB$/);
        expect(memory.rss).toMatch(/^\d+\.\d+ MB$/);
    });

    it("should report database connection state", async () => {
        const response = await request(app).get("/health");
        const db = response.body.database;

        expect(db).toHaveProperty("status");
        expect(db).toHaveProperty("readyState");
        expect(typeof db.readyState).toBe("number");
    });

    it("should report uptime as a positive number", async () => {
        const response = await request(app).get("/health");
        expect(response.body.uptime).toBeGreaterThan(0);
    });
});
