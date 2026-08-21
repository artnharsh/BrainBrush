import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import app from "./app";
import connectDB from "./config/db";
import "./config/redis";
import { initSocket } from "./sockets";
import { ALLOWED_ORIGINS } from "./config/env";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// 🔒 FIX: Socket.IO uses the same CORS whitelist as Express.
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
});

initSocket(io);

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
