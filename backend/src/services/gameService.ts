import redis from "../config/redis";
import { GameState } from "../types/gameTypes";
import { getRandomWords } from "../utils/wordGenerator"

const Game_TTL = 3600; // 1 hour in seconds

export const startGame = async (roomCode: string, players: string[]) => {
  if (!players || players.length === 0) throw new Error("Not enough players");

  const gameState: GameState = {
    roomCode,
    players, // Save the ordered list of players
    currentPlayerIndex: 0, // Start with the first player
    currentRound: 1,
    totalRounds: 1, // Defaulting to 3 rounds for the game
    drawer: players[0],
    word: "",
    wordChoices: getRandomWords(3),
    timer: 60,
    scores: {},
  };

  players.forEach((p) => {
    gameState.scores[p] = 0;
  });

  await redis.set(
    `game:${roomCode}`,
    JSON.stringify(gameState),
    "EX",
    Game_TTL,
  );

  return gameState;
};

export const getGameState = async (roomCode: string) => {
  const gameStr = await redis.get(`game:${roomCode}`);
  if (!gameStr) throw new Error("Game not found");

  return JSON.parse(gameStr) as GameState;
};

// You might not need this anymore since nextTurn handles it, but keeping it for manual overrides!
export const updateDrawer = async (roomCode: string, drawer: string) => {
  const gameStr = await redis.get(`game:${roomCode}`);
  if (!gameStr) throw new Error("Game not found");

  const game: GameState = JSON.parse(gameStr);
  game.drawer = drawer;

  await redis.set(`game:${roomCode}`, JSON.stringify(game));
  return game;
};

export const updateWord = async (roomCode: string, word: string) => {
  const gameStr = await redis.get(`game:${roomCode}`);
  if (!gameStr) throw new Error("Game not found");

  const game: GameState = JSON.parse(gameStr);
  game.word = word;

  await redis.set(`game:${roomCode}`, JSON.stringify(game));
  return game;
};

export const updateScores = async (
  roomCode: string,
  userId: string,
  score: number,
) => {
  const gameStr = await redis.get(`game:${roomCode}`);
  if (!gameStr) throw new Error("Game not found");

  const game: GameState = JSON.parse(gameStr);

  if (typeof game.scores[userId] !== "number") {
    game.scores[userId] = 0;
  }

  game.scores[userId] += score;

  await redis.set(`game:${roomCode}`, JSON.stringify(game));
  return game;
};

// Replaced `nextRound` with `nextTurn` to handle the new logic natively
export const nextTurn = async (roomCode: string) => {
  const gameStr = await redis.get(`game:${roomCode}`);
  if (!gameStr) throw new Error("Game not found");

  const game: GameState = JSON.parse(gameStr);

  // 1. Move to the next player
  game.currentPlayerIndex += 1;

  // 2. If everyone has drawn, reset to the first player and increment the round
  if (game.currentPlayerIndex >= game.players.length) {
    game.currentPlayerIndex = 0;
    game.currentRound += 1;
  }

  // 3. Check if the game is over
  const isGameOver = game.currentRound > game.totalRounds;

  // 4. If the game continues, set up the next drawer and reset turn variables
  if (!isGameOver) {
    game.drawer = game.players[game.currentPlayerIndex];
    game.word = "";
    game.wordChoices = getRandomWords(3);
    game.timer = 60;
  }

  await redis.set(`game:${roomCode}`, JSON.stringify(game));

  return { game, isGameOver };
};
