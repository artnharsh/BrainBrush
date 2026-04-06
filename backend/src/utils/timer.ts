import { Server } from "socket.io";
import { nextTurn, endGame } from "../services/gameService";
import { guessedCorrectlyCache } from "../services/scoringService"; // <-- Put this at the top

// 🚨 IMPORT THE BOUNCER CACHE
import { activeDrawers } from "../sockets/drawingSocket";

const activeTimers = new Map<string, NodeJS.Timeout>();
const timeRemaining = new Map<string, number>(); 

export const getTimeLeft = (roomCode: string) => timeRemaining.get(roomCode) || 0;

export const startRoundTimer = async(io: Server, roomCode: string, duration: number = 60) => {
    
    clearRoundTimer(roomCode);

    let timeLeft = duration;
    timeRemaining.set(roomCode, timeLeft); // 🚨 1. Save the starting time

    const timerId = setInterval(async () => {
        timeLeft -= 1;
        timeRemaining.set(roomCode, timeLeft); // 🚨 2. Update the memory every single second!

        io.to(roomCode).emit("timer_update", timeLeft);

        if(timeLeft <= 0) {
            clearRoundTimer(roomCode);

            try {
                const { game, isGameOver } = await nextTurn(roomCode);
                
                if (isGameOver) {
                    // 🚨 CLEAR CACHE: Game is over
                    activeDrawers.delete(roomCode);
                    
                    const { winner, maxScore } = await endGame(roomCode, game);
                    io.to(roomCode).emit("game_over", { 
                        reason: `Game Over! 🏆 The winner is ${winner} with ${maxScore} points!`,
                        game: game 
                    });
                } else {
                    // 🚨 UPDATE CACHE: Give the 2nd drawer permission to draw!
                    activeDrawers.set(roomCode, game.drawer);
                    
                    io.to(roomCode).emit("turn_updated", game);
                }
            } catch(error) {
                console.error("Timer failed to trigger next turn: ", error);
            }
        }
    }, 1000);

    activeTimers.set(roomCode, timerId);
};

export const clearRoundTimer = (roomCode: string) => {
    const timerId = activeTimers.get(roomCode);

    if(timerId) {
        clearInterval(timerId);
        activeTimers.delete(roomCode);
        timeRemaining.delete(roomCode); // 🚨 3. Delete the memory when the round ends
        guessedCorrectlyCache.delete(roomCode); // 🚨 4. Clear the guess cache for this room
    }
};