// backend/src/services/scoringService.ts
import redis from "../config/redis";
import { getGameState } from "./gameService"
import { getTimeLeft } from "../utils/timer";
import { GameState } from "../types/gameTypes";

// SAFE MEMORY CACHE: Doesn't touch your GameState types!
export const guessedCorrectlyCache = new Map<string, Set<string>>();

interface GuessResult {
    isCorrect: boolean;
    message?: string;
    alreadyGuessed?: boolean;
    game?: GameState;
    allGuessed?: boolean;
    correctGuessersArray?: string[];
}

export const processGuess = async(roomCode: string, userId: string, guess: string): Promise<GuessResult> => {
    const game = await getGameState(roomCode);

    // drawer is not allowed to guess the word
    if(game.drawer === userId) {
        return { isCorrect: false, message: "Drawer cannot guess!" };
    }

    // if the drawer hasn't picked a word yet, ignore guesses
    if(!game.word) {
        return { isCorrect: false };
    }

    // SPAM PREVENTION: Have they already guessed it?
    const roomGuessers = guessedCorrectlyCache.get(roomCode) || new Set();
    if (roomGuessers.has(userId)) {
        return { isCorrect: false, alreadyGuessed: true };
    }

    // if guess matches
    const isMatch = guess.trim().toLowerCase() === game.word.toLowerCase();

    if(isMatch) {
        // THE MATH: Calculate points based on speed
        const timeLeft = getTimeLeft(roomCode);
        const points = Math.floor((timeLeft / 60) * 500) || 10; // At least 10 pts

        game.scores[userId] = (game.scores[userId] || 0) + points;
        game.scores[game.drawer] = (game.scores[game.drawer] || 0) + 50;

        await redis.set(`game:${roomCode}`, JSON.stringify(game));

        // UPDATE MEMORY: Mark user as having guessed correctly
        roomGuessers.add(userId);
        guessedCorrectlyCache.set(roomCode, roomGuessers);

        // FAST FORWARD CHECK: Did everyone except the drawer guess it?
        const allGuessed = roomGuessers.size >= game.players.length - 1;

        return {
            isCorrect: true,
            game,
            allGuessed,
            correctGuessersArray: Array.from(roomGuessers)
        };
    }

    return { isCorrect: false};
};