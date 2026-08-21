import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport";
import authRoutes from "./routes/authRoutes";
import playerRoutes from "./routes/playerRoutes";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware";
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

app.use(
    session({
        secret: process.env.SESSION_SECRET || "your_secret_key",
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/api/player", playerRoutes);
// app.use("/api", roomRoutes);

app.get("/", (req, res) => {
    res.send("Scribble Backend is Running");
});

app.use(notFoundHandler);
app.use(errorHandler);


export default app;