import { Server } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { AuthenticatedSocket, AuthenticatedUser } from "../types/socketTypes";
import { roomSocket } from "./roomSocket";
import { drawingSocket } from "./drawingSocket";
import { gameSocket } from "./gameSocket";

interface TokenPayload extends JwtPayload {
  id: string;
  email?: string;
  username?: string;
  name?: string;
}

export const initSocket = (io: Server): void => {
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

      const user: AuthenticatedUser = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        name: decoded.name
      };

      socket.user = user;

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
