import GameHistory from "../models/GameHistory";
import mongoose from "mongoose";

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
    const games = await GameHistory.find({ players: userId })
      .select("roomCode players scores winner winnerId rounds createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return games.map((game: any) => {
      let playerScore = 0;
      let position = 1;

      let rank = 1;
      const sorted = game.scores.sort((a: any, b: any) => b.score - a.score);

      for (const s of sorted) {
        // ✅ FIXED: We check `s.playerId` instead of `s.player`
        if (s.playerId && s.playerId.toString() === userId) {
          playerScore = s.score;
          position = rank;
          break;
        }
        rank++;
      }

      return {
        id: game._id.toString(),
        roomCode: game.roomCode,
        // ✅ FIXED: We use `game.winner` directly since our new schema saves the string there
        winner: game.winner || "Unknown",
        playerCount: game.players.length,
        yourScore: playerScore,
        rounds: game.rounds,
        playedAt: game.createdAt,
        position,
        scores: game.scores.map((s: any) => ({
          player: s.player || "Unknown",
          // ✅ FIXED: Ensure we map the correct ObjectId to a string for the frontend
          playerId: s.playerId ? s.playerId.toString() : "",
          score: s.score
        }))
      };
    });
  } catch (error) {
    throw new Error("Failed to fetch history");
  }
};

/**
 * Get player statistics summary
 * @param userId Player's user ID
 * @returns Stats object with wins, total games, avg score, etc.
 */
export const getPlayerStats = async (userId: string) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await GameHistory.aggregate([
      { $match: { players: userObjectId } },

      {
        $project: {
          // ✅ FIXED: We need `winnerId` to properly check for wins
          winnerId: 1, 
          scores: 1
        }
      },

      {
        $addFields: {
          // ✅ FIXED: Compare `winnerId` against the user's ObjectId
          isWin: { $eq: ["$winnerId", userObjectId] }, 
          playerScore: {
            $let: {
              vars: {
                scoreObj: {
                  $first: {
                    $filter: {
                      input: "$scores",
                      as: "s",
                      // ✅ FIXED: Compare `$$s.playerId` against the user's ObjectId
                      cond: { $eq: ["$$s.playerId", userObjectId] } 
                    }
                  }
                }
              },
              in: "$$scoreObj.score"
            }
          }
        }
      },

      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          wins: { $sum: { $cond: ["$isWin", 1, 0] } },
          totalScore: { $sum: "$playerScore" }
        }
      }
    ]);

    const stats = result[0] || {
      totalGames: 0,
      wins: 0,
      totalScore: 0
    };

    return {
      totalGames: stats.totalGames,
      wins: stats.wins,
      winRate:
        stats.totalGames > 0
          ? ((stats.wins / stats.totalGames) * 100).toFixed(1)
          : "0",
      avgScore:
        stats.totalGames > 0
          ? (stats.totalScore / stats.totalGames).toFixed(0)
          : "0",
      totalScore: stats.totalScore
    };
  } catch (error) {
    throw new Error("Failed to fetch stats");
  }
};