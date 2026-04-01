// backend/src/utils/timer.ts
import { Server } from "socket.io";
import { nextTurn, endGame } from "../services/gameService";

// 🚨 IMPORT THE BOUNCER CACHE
import { activeDrawers } from "../sockets/drawingSocket";

const activeTimers = new Map<string, NodeJS.Timeout>();

export const startRoundTimer = async(io: Server, roomCode: string, duration: number = 60) => {
    
    clearRoundTimer(roomCode);

    let timeLeft = duration;

    const timerId = setInterval(async () => {
        timeLeft -= 1;

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
    }
};