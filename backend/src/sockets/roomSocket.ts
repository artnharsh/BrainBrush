import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/socketTypes";
import { createRoomRedis, joinRoomRedis, leaveRoomRedis } from "../services/roomService";
import { startGame, nextTurn, handlePlayerLeave } from "../services/gameService"; // <-- IMPORT GAME SERVICES
import redis from "../config/redis"; // <-- IMPORT REDIS


export const roomSocket = (io: Server, socket: AuthenticatedSocket) => {
  // --- CREATE ROOM ---
  socket.on("create_room", async () => {
    try {
      const userId = socket.user?.id;
      if (!userId) {
        return socket.emit("error", "User not authenticated");
      }
      const { roomCode } = await createRoomRedis(userId);
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
  // --- JOIN ROOM ---
  socket.on("join_room", async (roomCode: string) => {
    try {
      const userId = socket.user?.id;
      if (!userId) return socket.emit("error", "User not authenticated");

      const room = await joinRoomRedis(roomCode, userId);
      socket.join(roomCode);
      io.to(roomCode).emit("player_list", room.players);

      // THE RECONNECT FIX: Is there an active game going on right now?
      const gameStr = await redis.get(`game:${roomCode}`);
      if (gameStr) {
        const activeGame = JSON.parse(gameStr);
        
        // Quietly send ONLY this reconnecting user the current game state
        // so their UI switches from the Lobby to the active Game Board!
        socket.emit("game_started", activeGame); 
        
        // (Optional) Tell them what the current hidden word looks like
        if (activeGame.word) {
            const hiddenWord = activeGame.word.replace(/[a-zA-Z]/g, "_ ");
            socket.emit("word_chosen", { hiddenWord: hiddenWord.trim() });
        }
      }
    } catch (error) {
      if (error instanceof Error) socket.emit("error", error.message); 
    }
  });

  // --- LEAVE ROOM ---
  socket.on("leave_room", async (roomCode: string) => {
    try {
      const userId = socket.user?.id;
      if (!userId) {
        return socket.emit("error", "User not authenticated");
      }
      const room = await leaveRoomRedis(roomCode, userId);
      socket.leave(roomCode);
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

  // ==========================================
  // NEW GAME LOOP LISTENERS BELOW
  // ==========================================

  // --- START GAME ---
  socket.on("start_game", async (roomCode: string) => {
    try {
      // 1. Get the current players from the Redis set
      const players = await redis.smembers(`room:${roomCode}:players`);

      // Safety check: Don't start a game with just 1 person!
      // (Comment this out temporarily if you are testing alone in one tab)
      if (players.length < 2) {
        return socket.emit(
          "error",
          "Need at least 2 players to start the game!",
        );
      }

      // 2. Initialize the game state in Redis
      const gameState = await startGame(roomCode, players);

      // 3. Broadcast the starting state to everyone in the room
      io.to(roomCode).emit("game_started", gameState);
    } catch (error) {
      if (error instanceof Error) socket.emit("error", error.message);
    }
  });

  // --- NEXT TURN ---
  socket.on("next_turn", async (roomCode: string) => {
    try {
      const { game, isGameOver } = await nextTurn(roomCode);

      if (isGameOver) {
        io.to(roomCode).emit("game_over", game);
      } else {
        io.to(roomCode).emit("turn_updated", game);
      }
    } catch (error) {
      if (error instanceof Error) socket.emit("error", error.message);
    }
  });

  // --- HANDLE DISCONNECTS ---
  socket.on("disconnecting", async () => {
    try {
      const userId = socket.user?.id;
      if (!userId) return;

      for (const roomCode of socket.rooms) {
        if (roomCode !== socket.id) {
          
          // 1. Remove from the Lobby (Redis Set)
          const room = await leaveRoomRedis(roomCode, userId);
          if (room && room.players) {
            io.to(roomCode).emit("player_list", room.players);
          }

          // 2. Handle Game Logic if a game is actively running
          const { shouldEndGame, wasDrawer } = await handlePlayerLeave(roomCode, userId);
          
          if (shouldEndGame) {
            // Everyone left but one guy, end the game early
            io.to(roomCode).emit("game_over", { reason: "Not enough players to continue." });
          } else if (wasDrawer) {
            // The drawer rage-quit! Instantly force the next turn.
            const { game, isGameOver } = await nextTurn(roomCode);
            if (isGameOver) {
              io.to(roomCode).emit("game_over", game);
            } else {
              io.to(roomCode).emit("turn_updated", game);
              io.to(roomCode).emit("chat_message", { 
                sender: "System", 
                text: "The drawer left! Skipping to the next turn.", 
                type: "normal" 
              });
              }
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning up after socket disconnect:", error);
    }
  });
};
