import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/socketTypes";
import { processGuess } from "../services/scoringService";
import { updateWord } from "../services/gameService";
import { startRoundTimer } from "../utils/timer";
import { activeDrawers } from "./drawingSocket";
import { nextTurn } from "../services/gameService";

export const gameSocket = async (io: Server, socket: AuthenticatedSocket) => {
    socket.on("choose_word", async (data: { roomCode: string; word: string }) => {
        try {
            console.log(`[CHOOSE WORD] Received Payload:`, data);
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

    // player submits the guess
    socket.on("guess_word", async (data: { roomCode: string; guess: string; username: string }) => {
        try {
            const userId = socket.user?.id;
            if (!userId) return;

            const senderName = data.username || userId;

            const result = await processGuess(data.roomCode, userId, data.guess);

            if (result.isCorrect) {
                // hides the actual guess and displaye message

                io.to(data.roomCode).emit("chat_message", {
                    sender: "System",
                    text: `${senderName} guessed the word!`,
                    type: "sussess"
                });

                if (result.game) {
                    io.to(data.roomCode).emit("score_update", result.game.scores);
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
        // We just broadcast this to the room. (Only the drawer will respond to it)
        socket.to(roomCode).emit("send_canvas_snapshot", { targetSocketId: socket.id });
    });

    // 2. The Drawer replies with the picture, and we forward it to the new player
    socket.on("deliver_canvas_snapshot", (data: { targetSocketId: string; imageBase64: string }) => {
        io.to(data.targetSocketId).emit("receive_canvas_snapshot", data.imageBase64);
    });
};