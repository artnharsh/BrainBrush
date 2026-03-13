import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/socketTypes";
import { createRoom, joinRoom, leaveRoom } from "../services/roomService";

export const roomSocket = (io: Server, socket: AuthenticatedSocket) => {
  // --- CREATE ROOM ---
  socket.on("create_room", async () => {
    try {
      const userId = socket.user?.id;

      // Safe check instead of using userId!
      if (!userId) {
        return socket.emit("error", "User not authenticated");
      }

      const { roomCode } = await createRoom(userId);

      socket.join(roomCode);
      socket.emit("room_created", { roomCode });
    } catch (error) {
      if (error instanceof Error) {
        socket.emit("error", error.message);
      } else {
        socket.emit("error", "Failed to create room");
      }
    }
  });

  // --- JOIN ROOM ---
  socket.on("join_room", async (roomCode: string) => {
    try {
      const userId = socket.user?.id;

      if (!userId) {
        return socket.emit("error", "User not authenticated");
      }

      // If the room is full or doesn't exist, this throws an error directly to the catch block
      const room = await joinRoom(roomCode, userId);

      socket.join(roomCode);
      io.to(roomCode).emit("player_list", room.players);
    } catch (error) {
      if (error instanceof Error) {
        socket.emit("error", error.message); // E.g., sends "Room is full" to the frontend
      } else {
        socket.emit("error", "Failed to join room");
      }
    }
  });

  // --- LEAVE ROOM ---
  socket.on("leave_room", async (roomCode: string) => {
    try {
      const userId = socket.user?.id;

      if (!userId) {
        return socket.emit("error", "User not authenticated");
      }

      const room = await leaveRoom(roomCode, userId);

      socket.leave(roomCode);

      // We only emit the player list if the room wasn't destroyed when the last player left
      if (room && room.players) {
        io.to(roomCode).emit("player_list", room.players);
      }
    } catch (error) {
      if (error instanceof Error) {
        socket.emit("error", error.message);
      } else {
        socket.emit("error", "Failed to leave room");
      }
    }
  });
};
