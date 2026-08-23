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
  // Track active connections by userId to prevent duplicate sessions
  const activeSessions = new Map<string, string>(); // userId -> socketId

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      // Allow Artillery to bypass auth with a special token
      if (token === "LOAD_TEST_TOKEN") {
        socket.user = {
          id: `loadtest-${socket.id}`,
          username: "Load Tester"
        };
        return next();
      }

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
    const userId = socket.user?.id;
    console.log("User connected:", userId);

    // Duplicate session detection: kick the old connection
    if (userId && activeSessions.has(userId)) {
      const oldSocketId = activeSessions.get(userId)!;
      const oldSocket = io.sockets.sockets.get(oldSocketId);

      if (oldSocket) {
        // Notify the old tab/device before disconnecting it
        oldSocket.emit("session_conflict", {
          message: "Your account was logged in from another device. You have been disconnected."
        });
        oldSocket.disconnect(true);
      }
    }

    // Register this socket as the active session
    if (userId) {
      activeSessions.set(userId, socket.id);
    }

    roomSocket(io, socket);
    drawingSocket(io, socket);
    gameSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
      // Only remove from activeSessions if THIS socket is still the active one
      // (prevents a race where the new socket registers, then the old one disconnects)
      if (userId && activeSessions.get(userId) === socket.id) {
        activeSessions.delete(userId);
      }
    });
  });
};
