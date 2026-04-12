import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport";
import authRoutes from "./routes/authRoutes";
import playerRoutes from "./routes/playerRoutes";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    session({
        secret: "your_secret_key",
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