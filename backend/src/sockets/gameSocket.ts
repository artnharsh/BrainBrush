// backend/src/sockets/gameSocket.ts
import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/socketTypes";
import { processGuess } from "../services/scoringService";
import { updateWord, nextTurn } from "../services/gameService";
import { startRoundTimer, clearRoundTimer } from "../utils/timer";
import { activeDrawers } from "./drawingSocket";

// 🚨 IN-MEMORY CACHE FOR TEMPORARY NAMES
export const temporaryNames = new Map<string, string>();

export const gameSocket = async (io: Server, socket: AuthenticatedSocket) => {
    
    // 🚨 Save their name when they connect!
    socket.on("register_name", (data: { id: string, username: string }) => {
        temporaryNames.set(data.id, data.username);
    });

    socket.on("choose_word", async (data: { roomCode: string; word: string }) => {
        try {
            const userId = socket.user?.id;
            if (!userId) return;

            // save the actual word in redis using your existing gameservice
            await updateWord(data.roomCode, data.word);

            // convert the word to blank to show guessers
            const hiddenWord = data.word.replace(/[a-zA-Z]/g, "_ ");

            // tell everyone the game is on and how long the word is!
            io.to(data.roomCode).emit("word_chosen", { hiddenWord: hiddenWord.trim() });

            startRoundTimer(io, data.roomCode, 60);

        } catch (error) {
            console.error("Error choosing word: ", error);
        }
    });

    socket.on("register_name", (data: { id: string, username: string }) => {
        // Fallback to "Guest" if their username is literally missing
        const validName = data.username && data.username !== "Player" ? data.username : `Guest-${data.id.slice(-4)}`;
        temporaryNames.set(data.id, validName);
        
        // Convert the Map to a normal Object so we can send it over WebSockets
        io.emit("name_dict_update", Object.fromEntries(temporaryNames));

    });

    // player submits the guess
    socket.on("guess_word", async (data: { roomCode: string; guess: string; username?: string }) => {
        try {
            const userId = socket.user?.id;
            if (!userId) return;

            // Keep cache updated, fallback to ID if no name provided
            const senderName = temporaryNames.get(userId) || `Guest-${userId.slice(-4)}`;

            const result = await processGuess(data.roomCode, userId, data.guess);

            if (result.alreadyGuessed) return; // Prevent spam

            if (result.isCorrect) {
                // hides the actual guess and display message
                io.to(data.roomCode).emit("chat_message", {
                    sender: "System",
                    text: `${senderName} guessed the word!`,
                    type: "success" // Fixed typo here
                });

                if (result.game) {
                    io.to(data.roomCode).emit("score_update", result.game.scores);
                    io.to(data.roomCode).emit("correct_guessers_update", result.correctGuessersArray);
                }

                // 🚨 FAST FORWARD: Skip the rest of the timer!
                if (result.allGuessed) {
                    io.to(data.roomCode).emit("chat_message", {
                        sender: "System",
                        text: `Everyone guessed the word!`,
                        type: "success"
                    });
                    
                    clearRoundTimer(data.roomCode); // Kill the clock!
                    
                    const { game, isGameOver } = await nextTurn(data.roomCode);
                    if (isGameOver) {
                        activeDrawers.delete(data.roomCode);
                        io.to(data.roomCode).emit("game_over", game);
                    } else {
                        activeDrawers.set(data.roomCode, game.drawer);
                        io.to(data.roomCode).emit("turn_updated", game);
                    }
                }
            } else {
                io.to(data.roomCode).emit("chat_message", {
                    sender: senderName,
                    text: data.guess,
                    type: "normal"
                });
            }
        } catch (error) {
            console.error("Error processing guess: ", error);
        }
    });

    // 1. New player asks for the current picture
    socket.on("request_canvas_sync", (roomCode: string) => {
        socket.to(roomCode).emit("send_canvas_snapshot", { targetSocketId: socket.id });
    });

    // 2. The Drawer replies with the picture, and we forward it to the new player
    socket.on("deliver_canvas_snapshot", (data: { targetSocketId: string; imageBase64: string }) => {
        io.to(data.targetSocketId).emit("receive_canvas_snapshot", data.imageBase64);
    });
};