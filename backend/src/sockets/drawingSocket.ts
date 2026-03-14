// src/sockets/drawingSocket.ts
import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/socketTypes";
import { getGameState } from "../services/gameService";

export const drawingSocket = (io: Server, socket: AuthenticatedSocket) => {
  // --- HANDLE DRAWING ---
  socket.on(
    "draw_line",
    async (data: {
      roomCode: string;
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      color: string;
      width: number;
    }) => {
      try {
        const { roomCode, ...lineData } = data;

        // SECURITY CHECK: Is this user actually allowed to draw right now?
        const game = await getGameState(roomCode);

        if (game.drawer !== socket.user?.id) {
          // If someone tries to hack the game and draw when it's not their turn, ignore them!
          return;
        }

        // Broadcast the drawing data to EVERYONE ELSE in the room
        // Notice we use `socket.to` instead of `io.to`.
        // `socket.to` sends to everyone EXCEPT the person who just drew it!
        socket.to(roomCode).emit("draw_line", lineData);
      } catch (error) {
        console.error("Drawing error:", error);
      }
    },
  );

  // --- HANDLE CLEAR CANVAS ---
  socket.on("clear_canvas", async (roomCode: string) => {
    try {
      const game = await getGameState(roomCode);

      if (game.drawer === socket.user?.id) {
        socket.to(roomCode).emit("clear_canvas");
      }
    } catch (error) {
      console.error("Clear canvas error:", error);
    }
  });
};
