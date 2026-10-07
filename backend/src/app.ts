import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport";
import authRoutes from "./routes/authRoutes";
import playerRoutes from "./routes/playerRoutes";
import healthRoutes from "./routes/healthRoutes";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware";
import { metricsMiddleware } from "./middlewares/metricsMiddleware";
import register from "./config/metrics";
import { ALLOWED_ORIGINS } from "./config/env";

const app = express();

// 🔒 FIX: Restrict CORS to specific origins instead of allowing everything.
// Set ALLOWED_ORIGINS in .env (comma-separated) for production.
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use(express.json());

// Prometheus metrics collection middleware (before routes)
app.use(metricsMiddleware);

app.use(
    session({
        secret: process.env.SESSION_SECRET || "your_secret_key",
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Application routes
app.use("/auth", authRoutes);
app.use("/api/player", playerRoutes);
app.use("/health", healthRoutes);

// Prometheus metrics endpoint (scraped by Prometheus every 15s)
app.get("/metrics", async (_req, res) => {
    try {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});
// app.use("/api", roomRoutes);

app.get("/", (req, res) => {
    res.send("Scribble Backend is Running");
});

app.use(notFoundHandler);
app.use(errorHandler);


export default app;