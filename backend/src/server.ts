import http from "http";
import dotenv from "dotenv";
import {Server} from "socket.io";
import app from "./app";
import connectDB from "./config/db";
import "./config/redis";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("User Connected: " + socket.id);

    socket.on("disconnect", () => {
        console.log("User Disconnected: " + socket.id);
    });
});

const startServer = async() => {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
}

startServer();