import redis from "../config/redis";
import { getGameState } from "./gameService"

export const processGuess = async(roomCode: string, userId: string, guess: string) => {
    const game = await getGameState(roomCode);

    // drawer is not allowed to guess the word
    if(game.drawer === userId) {
        return { isCorrect: false, message: "Drawer cannot guess!" };
    }

    // if the drawer hasen't picked a word yet, ignore guesses

    if(!game.word) {
        return { isCorrect: false };
    }

    // if guess matches
    const isMatch = guess.trim().toLowerCase() === game.word.toLocaleLowerCase();

    if(isMatch) {
        game.scores[userId] = (game.scores[userId] || 0) + 100;

        game.scores[game.drawer] = (game.scores[game.drawer] || 0) + 50;
        
        await redis.set(`game:${roomCode}`, JSON.stringify(game));

        return { isCorrect: true, game};
    }

    return { isCorrect: false};
};
