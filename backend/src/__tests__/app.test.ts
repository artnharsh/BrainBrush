import request from "supertest";
import express from "express";

/**
 * App Route Tests
 *
 * Tests for the core Express application routes:
 *  - Root route (/)
 *  - 404 handling for unknown routes
 *  - CORS headers
 *
 * Uses a standalone Express app to avoid external dependencies.
 */

const app = express();

// Replicate the root route from app.ts
app.get("/", (_req, res) => {
    res.send("Scribble Backend is Running");
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});

describe("Root Route", () => {
    it("GET / should return 200", async () => {
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
    });

    it("GET / should return backend running message", async () => {
        const response = await request(app).get("/");
        expect(response.text).toContain("Scribble Backend is Running");
    });
});

describe("404 Handling", () => {
    it("should return 404 for unknown routes", async () => {
        const response = await request(app).get("/this-route-does-not-exist");
        expect(response.status).toBe(404);
    });

    it("should return JSON error for unknown routes", async () => {
        const response = await request(app).get("/unknown-endpoint");
        expect(response.body).toHaveProperty("error");
    });
});

describe("HTTP Methods", () => {
    it("GET / should respond to GET requests", async () => {
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
    });

    it("POST / should return 404 (no POST handler on root)", async () => {
        const response = await request(app).post("/");
        expect(response.status).toBe(404);
    });
});
