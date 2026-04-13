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
    <div className="flex flex-col items-center justify-center w-full h-full lg:h-[750px] bg-sky-100 rounded-xl border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4 md:p-8 overflow-hidden">
      <h1 className="text-3xl sm:text-4xl md:text-5xl leading-none font-black uppercase tracking-wide md:tracking-[0.14em] text-yellow-400 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] mb-8 md:mb-12 text-center whitespace-nowrap">
        GAME OVER
      </h1>

      {/* Removed strict h-64 and use min-h for safe text spacing above podiums */}
      <div className="flex items-end justify-center gap-2 md:gap-4 h-auto min-h-[350px] w-full max-w-4xl border-b-8 border-black pb-0">
        
        {/* SECOND PLACE (Left) */}
        {second && (
          // Use flexible width so columns adapt without text collisions.
          <div className="flex flex-col items-center flex-1 min-w-0 animate-[slideUp_0.5s_ease-out]">
            {/* Keep long names to one line in each podium column. */}
            <span className="text-lg sm:text-xl md:text-2xl leading-tight font-black mb-2 truncate w-full text-center px-1" title={getName(second)}>
                {getName(second)}
            </span>
            <span className="bg-white border-2 border-black px-2 md:px-3 py-1 rounded-full font-bold text-sm md:text-base mb-3 shadow-[2px_2px_0px_rgba(0,0,0,1)] whitespace-nowrap">
              {getScore(second)} pts
            </span>
            <div className="w-full h-32 md:h-40 bg-gray-300 border-4 border-b-0 border-black flex items-start justify-center pt-4 relative">
              <span className="text-4xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">2</span>
            </div>
          </div>
        )}

        {/* FIRST PLACE (Center) */}
        {first && (
          <div className="flex flex-col items-center flex-1 min-w-0 animate-[slideUp_0.8s_ease-out] z-10">
            <span className="text-xl sm:text-2xl md:text-4xl leading-tight font-black mb-2 truncate w-full text-center px-1" title={getName(first)}>
                {getName(first)}
            </span>
            <span className="bg-yellow-300 border-2 border-black px-3 md:px-4 py-1 md:py-2 rounded-full font-black text-sm md:text-base mb-3 shadow-[3px_3px_0px_rgba(0,0,0,1)] whitespace-nowrap">
              {getScore(first)} pts
            </span>
            <div className="w-full h-48 md:h-56 bg-yellow-400 border-4 border-b-0 border-black flex items-start justify-center pt-4 shadow-[0px_-10px_20px_rgba(250,204,21,0.4)]">
              <span className="text-6xl font-black text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">1</span>
            </div>
          </div>
        )}

        {/* THIRD PLACE (Right) */}
        {third && (
          <div className="flex flex-col items-center flex-1 min-w-0 animate-[slideUp_0.6s_ease-out]">
            <span className="text-base sm:text-lg md:text-xl leading-tight font-black mb-2 truncate w-full text-center px-1" title={getName(third)}>
                {getName(third)}
            </span>
            <span className="bg-white border-2 border-black px-2 py-1 rounded-full font-bold text-sm md:text-base mb-3 shadow-[2px_2px_0px_rgba(0,0,0,1)] whitespace-nowrap">
              {getScore(third)} pts
            </span>
            <div className="w-full h-24 md:h-28 bg-orange-400 border-4 border-b-0 border-black flex items-start justify-center pt-2">
              <span className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">3</span>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={resetRoom}
        className="mt-8 md:mt-12 bg-blue-400 hover:bg-blue-500 text-black border-4 border-black px-6 md:px-8 py-3 md:py-4 rounded-xl font-black text-xl md:text-2xl uppercase tracking-widest shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-2 active:shadow-none transition-all"
      >
        Return to Lobby
      </button>

    </div>
  );
}