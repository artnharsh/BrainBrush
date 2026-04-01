// backend/src/sockets/drawingSocket.ts
import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/socketTypes";

export const activeDrawers = new Map<string, string>(); 

export const drawingSocket = (io: Server, socket: AuthenticatedSocket) => {
  
  socket.on("draw_line", (data: any) => {
    try {
      if (!data.roomCode) return;
      if (activeDrawers.get(data.roomCode) !== socket.user?.id) return;
      socket.to(data.roomCode).emit("draw_line", data);
    } catch (error) { console.error(error); }
  });

  // 🚨 NEW: Relay the erase command
  socket.on("erase_stroke", (data: { roomCode: string; strokeId: string }) => {
    try {
      if (!data.roomCode) return;
      if (activeDrawers.get(data.roomCode) !== socket.user?.id) return;
      socket.to(data.roomCode).emit("erase_stroke", data.strokeId);
    } catch (error) { console.error(error); }
  });

  socket.on("clear_canvas", (roomCode: string) => {
    try {
      if (!roomCode) return;
      if (activeDrawers.get(roomCode) !== socket.user?.id) return;
      socket.to(roomCode).emit("clear_canvas");
    } catch (error) { console.error(error); }
  });

  // 🚨 UPGRADED: Relaying Vector Data instead of Images
  socket.on("request_canvas_sync", (roomCode: string) => {
    socket.to(roomCode).emit("send_canvas_snapshot", { targetSocketId: socket.id });
  });

  socket.on("deliver_canvas_snapshot", (data: { targetSocketId: string; segments: any[] }) => {
    io.to(data.targetSocketId).emit("receive_canvas_snapshot", { segments: data.segments });
  });
};