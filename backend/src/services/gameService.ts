import redis from "../config/redis";
import GameHistory from "../models/GameHistory";
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
    JSON.stringify(gameState)
  );

  const verify = await redis.get(`game:${roomCode}`);
  console.log(`[REDIS VERIFY] Did game save?`, verify ? "YES ✅" : "NO ❌");

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

export const handlePlayerLeave = async(roomCode: string, userId: string) => {
  const gameStr = await redis.get(`game:${roomCode}`);

  // if game isn't started or already over then do nothing 
  if(!gameStr) return {shouldEndGame: false, wasDrawer: false};

  const game: GameState = JSON.parse(gameStr);
  const playerIndex = game.players.indexOf(userId);

  // if player is not in the array ignore it
  if(playerIndex === -1) return { shouldEndGame: false, wasDrawer: false};

  // 1. remove player from the game array
  game.players.splice(playerIndex, 1);

  //2. if less than 2 players, game can't continue
  if(game.players.length < 2) {
    await redis.del(`game:${roomCode}`); 
    return { shouldEndGame: true, wasDrawer: false};
  }

  // 3. if the person who left was the drawer 
  const wasDrawer = (game.drawer === userId);

  //shift index back 
  // if person who left was before the current drawer or was drawer
  // the array just shrank so pointer shift down by 1
  if(playerIndex <= game.currentPlayerIndex) {
    game.currentPlayerIndex -= 1;
  }

  await redis.set((`game:${roomCode}`), JSON.stringify(game));

  return { shouldEndGame: false, wasDrawer, game};
};

export const endGame = async(roomCode: string, finalGameState: GameState) => {
  let winner = "";
  let maxScore = -1;
  const formattedScores = [];

  for( const player of finalGameState.players) {
    const score = finalGameState.scores[player] || 0;

    formattedScores.push({ player: player, score: score});

    if(score > maxScore) {
      maxScore = score;
      winner = player;
    }
  }

  try {
    const history = new GameHistory({
      roomCode: finalGameState.roomCode,
      players: finalGameState.players,
      scores: formattedScores,
      winner: winner,
      rounds: finalGameState.totalRounds
    });

    await history.save();
    console.log(`Game history saved to MongoDB for room: ${roomCode}`);

  } catch (error) {
    console.error("Failed to save the game history to MongoDB: ", error);
  }

  await redis.del(`game:${roomCode}`);
  return {winner, maxScore};
};