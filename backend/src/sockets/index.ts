import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { AuthenticatedSocket } from "../types/socketTypes";
import { roomSocket } from "./roomSocket";
import { drawingSocket } from "./drawingSocket";
import { gameSocket } from "./gameSocket";

export const initSocket = (io: Server) => {
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      const decoded = jwt.verify(token, JWT_SECRET) as any;

      socket.user = { id: decoded.id };

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log("User connected:", socket.user?.id);

    roomSocket(io, socket);
    drawingSocket(io, socket);
    gameSocket(io, socket);
    
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user?.id);
    });
  });
};
