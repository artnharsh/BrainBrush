import { Server } from "socket.io";
import { AuthenticatedSocket } from "../types/socketTypes";
import { processGuess } from "../services/scoringService";
import { updateWord } from "../services/gameService";
import test from "node:test";
import { text } from "node:stream/consumers";
import { startRoundTimer } from "../utils/timer";
import { start } from "node:repl";

export const gameSocket = async(io: Server, socket: AuthenticatedSocket) => {
    socket.on("choose_word", async(data: {roomCode: string; word: string}) => {
        try {
            const userId = socket.user?.id;
            if(!userId) return;

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
    socket.on("guess_word", async(data: {roomCode: string; guess: string}) => {
        try{
            const userId = socket.user?.id;
            if(!userId) return;

            const result = await processGuess(data.roomCode, userId, data.guess);

            if(result.isCorrect) {
                // hides the actual guess and displaye message

                io.to(data.roomCode).emit("chat_message", {
                    sender: "System",
                    text: `${userId} guessed the word`,
                    type: "sussess"
                });

                if(result.game) {
                    io.to(data.roomCode).emit("score_update", result.game.scores);
                }
            } else {
                io.to(data.roomCode).emit("chat_message", {
                    sender: userId,
                    text: data.guess,
                    type: "normal"
                });
            }
        } catch (error) {
            console.error("Error processing guess: ", error);
        }
    });
};