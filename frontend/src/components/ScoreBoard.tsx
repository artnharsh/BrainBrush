// src/components/ScoreBoard.tsx
import { useGameStore } from "../store/useGameStore";

export default function ScoreBoard() {
    const players = useGameStore((state) => state.players);
    const scores = useGameStore((state) => state.scores);
    const currentDrawer = useGameStore((state) => state.currentDrawer);
    const correctGuessers = useGameStore((state) => state.correctGuessers) || [];

    // Sort players by score highest to lowest
    const sortedPlayers = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
    const playerNames = useGameStore((state) => state.playerNames) || {};
    return (
        <div className="flex flex-col h-full bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden">

            {/* Header */}
            <div className="shrink-0 bg-green-400 border-b-4 border-black p-3 md:p-4">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-widest text-center">Leaderboard</h3>
            </div>

            {/* Players List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 md:p-4 space-y-2 bg-gray-50">
                {sortedPlayers.map((playerId, index) => {
                    const isDrawer = playerId === currentDrawer;
                    const hasGuessed = correctGuessers.includes(playerId);

                    return (
                        <div
                            key={playerId}
                            className={`flex items-center justify-between p-3 border-2 border-black rounded-lg font-bold transition-colors ${isDrawer ? 'bg-yellow-200' : hasGuessed ? 'bg-green-300' : 'bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 w-4 text-sm">#{index + 1}</span>
                                <span className="text-lg flex items-center gap-1">
                                    {isDrawer && <span title="Drawing">✏️</span>}
                                    {hasGuessed && <span title="Guessed the word!">✅</span>}

                                    {/* Shows ID since we don't have a frontend name map yet. 
                      Chat will still show the real username! */}
                                    <span className="truncate max-w-[120px]">
                                        {playerNames[playerId] || `Guest-${playerId.slice(-4)}`}
                                    </span>
                                </span>
                            </div>

                            <span className="text-xl font-black">{scores[playerId] || 0}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}