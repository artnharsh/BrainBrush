import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";

interface GameRecord {
  id: string;
  roomCode: string;
  winner: string;
  winnerAvatar: string;
  playerCount: number;
  yourScore: number;
  rounds: number;
  playedAt: string;
  position: number;
  scores: Array<{
    player: string;
    playerId: string;
    score: number;
  }>;
}

interface PlayerStats {
  totalGames: number;
  wins: number;
  winRate: string;
  avgScore: string;
  totalScore: number;
}

export default function PlayerHistoryPage() {
  const user = useGameStore((state) => state.user);
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError("Please log in to view your history");
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch stats
        const statsRes = await fetch("/api/player/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }

        // Fetch history
        const historyRes = await fetch("/api/player/history?limit=50", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(historyData.data);
        } else {
          setError("Failed to load game history");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to fetch history";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="text-2xl font-black">Loading your history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black text-red-500 mb-4">Error</h2>
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "❌";
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-100 border-yellow-400";
      case 2:
        return "bg-gray-100 border-gray-400";
      case 3:
        return "bg-orange-100 border-orange-400";
      default:
        return "bg-red-50 border-red-300";
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 p-4 font-sans pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-yellow-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase">
            Game History
          </h1>
          <p className="text-lg font-bold text-gray-700 mt-2">
            Playing as: <span className="text-blue-600">{user?.username}</span>
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Games", value: stats.totalGames, color: "bg-blue-100" },
              { label: "Wins", value: stats.wins, color: "bg-green-100" },
              { label: "Win Rate", value: `${stats.winRate}%`, color: "bg-purple-100" },
              { label: "Avg Score", value: stats.avgScore, color: "bg-orange-100" },
              { label: "Total Score", value: stats.totalScore, color: "bg-pink-100" }
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`${stat.color} border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center`}
              >
                <div className="text-3xl font-black">{stat.value}</div>
                <div className="text-xs font-bold text-gray-600 uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Game History List */}
        {history.length === 0 ? (
          <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center">
            <p className="text-2xl font-black text-gray-500">No games played yet!</p>
            <p className="text-lg font-bold text-gray-400 mt-2">Join a room and start drawing 🎨</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((game) => (
              <div key={game.id} className="space-y-2">
                {/* Game Summary Row */}
                <button
                  onClick={() =>
                    setExpandedGameId(expandedGameId === game.id ? null : game.id)
                  }
                  className={`w-full ${getPositionColor(
                    game.position
                  )} border-4 border-black rounded-xl p-4 transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-pointer hover:scale-102`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Position Badge */}
                      <div className="text-4xl">{getMedalEmoji(game.position)}</div>

                      {/* Game Info */}
                      <div className="text-left flex-1">
                        <div className="font-black text-lg">
                          {game.position === 1 ? "🎉 WINNER!" : `Place #${game.position}`}
                        </div>
                        <div className="font-bold text-sm text-gray-700">
                          Score: <span className="text-2xl">{game.yourScore}</span> • Room:{" "}
                          <span className="font-black">{game.roomCode}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-600 mt-1">
                          {game.playerCount} players • {game.rounds} round
                          {game.rounds > 1 ? "s" : ""} • {game.playedAt}
                        </div>
                      </div>

                      {/* Winner Badge */}
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-600 uppercase">Winner</div>
                        <div className="text-2xl font-black">{game.winnerAvatar}</div>
                        <div className="font-bold text-sm">{game.winner}</div>
                      </div>
                    </div>

                    {/* Expand Arrow */}
                    <div
                      className={`text-2xl font-black ml-4 transition-transform ${
                        expandedGameId === game.id ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </div>
                  </div>
                </button>

                {/* Expanded Details (Final Scores Table) */}
                {expandedGameId === game.id && (
                  <div className="bg-white border-4 border-black border-t-0 rounded-b-xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <div className="font-bold text-sm uppercase mb-3">Final Scores</div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-black">
                          <th className="text-left font-black p-2">Position</th>
                          <th className="text-left font-black p-2">Player</th>
                          <th className="text-right font-black p-2">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {game.scores.map((score, idx) => (
                          <tr
                            key={score.playerId}
                            className={`${
                              score.score === game.yourScore ? "bg-yellow-50" : ""
                            } border-b border-gray-300 hover:bg-gray-50`}
                          >
                            <td className="p-2 font-black text-lg">
                              {getMedalEmoji(idx + 1)}
                            </td>
                            <td className="p-2 font-bold">
                              {score.player}
                              {score.score === game.yourScore ? " (You)" : ""}
                            </td>
                            <td className="p-2 font-black text-right">{score.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
