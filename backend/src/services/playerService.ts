import GameHistory from "../models/GameHistory";

export interface PlayerGameRecord {
  id: string;
  roomCode: string;
  winner: string;
  winnerAvatar?: string;
  playerCount: number;
  yourScore: number;
  rounds: number;
  playedAt: string;
  position: number; // 1st, 2nd, 3rd place
  scores: Array<{
    player: string;
    playerId: string;
    score: number;
  }>;
}

/**
 * Fetch player's game history with stats
 * @param userId Player's user ID
 * @param limit Number of games to fetch (default 20)
 * @returns Array of game records
 */
export const getPlayerGameHistory = async (
  userId: string,
  limit: number = 20
): Promise<PlayerGameRecord[]> => {
  try {
    // Find all games where this player participated
    const games = await GameHistory.find({ players: userId })
      .populate("winner", "username name avatar")
      .populate("scores.player", "username name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Transform into UI-friendly format
    const records: PlayerGameRecord[] = games.map((game: any) => {
      // Find player's score
      const playerScore = game.scores.find(
        (s: any) => s.player?._id?.toString() === userId
      );

      // Calculate player's position (1st, 2nd, 3rd, etc)
      const sortedScores = [...game.scores].sort((a: any, b: any) => b.score - a.score);
      const position =
        sortedScores.findIndex((s: any) => s.player?._id?.toString() === userId) + 1;

      return {
        id: game._id?.toString() || "",
        roomCode: game.roomCode,
        winner: game.winner?.username || game.winner?.name || "Unknown",
        winnerAvatar: game.winner?.avatar || "?",
        playerCount: game.players.length,
        yourScore: playerScore?.score || 0,
        rounds: game.rounds,
        playedAt: new Date(game.createdAt).toLocaleString(),
        position,
        scores: game.scores.map((s: any) => ({
          player: s.player?.username || s.player?.name || "Unknown",
          playerId: s.player?._id?.toString() || "",
          score: s.score
        }))
      };
    });

    return records;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch game history";
    throw new Error(`Failed to fetch player game history: ${msg}`);
  }
};

/**
 * Get player statistics summary
 * @param userId Player's user ID
 * @returns Stats object with wins, total games, avg score, etc.
 */
export const getPlayerStats = async (userId: string) => {
  try {
    const games = await GameHistory.find({ players: userId })
      .populate("winner")
      .lean();

    const totalGames = games.length;
    const wins = games.filter((g: any) => g.winner?._id?.toString() === userId).length;
    const totalScore = games.reduce((sum: number, game: any) => {
      const playerScore = game.scores.find(
        (s: any) => s.player?.toString() === userId
      );
      return sum + (playerScore?.score || 0);
    }, 0);

    return {
      totalGames,
      wins,
      winRate: totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : "0",
      avgScore: totalGames > 0 ? (totalScore / totalGames).toFixed(0) : "0",
      totalScore
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch player stats";
    throw new Error(`Failed to fetch player stats: ${msg}`);
  }
};
