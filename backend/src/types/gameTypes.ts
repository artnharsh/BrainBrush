export type GameState = {
  roomCode: string;
  players: string[]; // We need an ordered array to know whose turn it is
  currentPlayerIndex: number; // Starts at 0
  currentRound: number; // Starts at 1
  totalRounds: number; // e.g., 2 or 3
  drawer: string;
  word: string;
  wordChoices: string[],
  timer: number;
  scores: Record<string, number>;
};
