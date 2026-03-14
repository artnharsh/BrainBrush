import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorMiddleware";
// import roomRoutes from "./routes/roomRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

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
// app.use("/api", roomRoutes);

app.get("/", (req, res) => {
    res.send("Scribble Backend is Running");
});


export default app;