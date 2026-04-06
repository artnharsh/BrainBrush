// src/components/Podium.tsx
import { useGameStore } from "../store/useGameStore";

export default function Podium() {
  const players = useGameStore((state) => state.players);
  const scores = useGameStore((state) => state.scores);
  const playerNames = useGameStore((state) => state.playerNames) || {};
  const resetRoom = useGameStore((state) => state.resetRoom);

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));

  // Get Top 3
  const first = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  const getName = (id: string) => playerNames[id] || `Guest-${id.slice(-4)}`;
  const getScore = (id: string) => scores[id] || 0;

  return (
    <div className="flex flex-col items-center justify-center w-full h-[650px] bg-sky-100 rounded-xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8">
      
      <h1 className="text-5xl font-black uppercase tracking-widest text-yellow-400 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] mb-12 animate-bounce">
        🏁 GAME OVER 🏁
      </h1>

      {/* The F1 Podium Container */}
      <div className="flex items-end justify-center gap-4 h-64 w-full max-w-3xl border-b-8 border-black pb-0">
        
        {/* 🥈 SECOND PLACE (Left) */}
        {second && (
          <div className="flex flex-col items-center w-1/3 animate-[slideUp_0.5s_ease-out]">
            <span className="text-2xl font-black mb-2">{getName(second)}</span>
            <span className="bg-white border-2 border-black px-3 py-1 rounded-full font-bold mb-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {getScore(second)} pts
            </span>
            <div className="w-full h-32 bg-gray-300 border-4 border-b-0 border-black flex items-start justify-center pt-4 relative">
              <span className="text-4xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">2</span>
            </div>
          </div>
        )}

        {/* 🥇 FIRST PLACE (Center) */}
        {first && (
          <div className="flex flex-col items-center w-1/3 animate-[slideUp_0.8s_ease-out] z-10">
            <span className="text-4xl font-black mb-2 text-yellow-500 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">🏆</span>
            <span className="text-3xl font-black mb-2">{getName(first)}</span>
            <span className="bg-yellow-300 border-2 border-black px-4 py-2 rounded-full font-black mb-3 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              {getScore(first)} pts
            </span>
            <div className="w-full h-48 bg-yellow-400 border-4 border-b-0 border-black flex items-start justify-center pt-4 shadow-[0px_-10px_20px_rgba(250,204,21,0.4)]">
              <span className="text-6xl font-black text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">1</span>
            </div>
          </div>
        )}

        {/* 🥉 THIRD PLACE (Right) */}
        {third && (
          <div className="flex flex-col items-center w-1/3 animate-[slideUp_0.6s_ease-out]">
            <span className="text-xl font-black mb-2">{getName(third)}</span>
            <span className="bg-white border-2 border-black px-2 py-1 rounded-full font-bold mb-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {getScore(third)} pts
            </span>
            <div className="w-full h-24 bg-orange-400 border-4 border-b-0 border-black flex items-start justify-center pt-2">
              <span className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">3</span>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={resetRoom}
        className="mt-12 bg-blue-400 hover:bg-blue-500 text-black border-4 border-black px-8 py-4 rounded-xl font-black text-2xl uppercase tracking-widest shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-2 active:shadow-none transition-all"
      >
        Return to Lobby
      </button>

    </div>
  );
}