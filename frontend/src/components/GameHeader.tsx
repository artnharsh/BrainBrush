// src/components/GameHeader.tsx
import { useGameStore } from "../store/useGameStore";

export default function GameHeader() {
  const timer = useGameStore((state) => state.timer);
  const word = useGameStore((state) => state.word);
  const currentRound = useGameStore((state) => state.currentRound);
  const totalRounds = useGameStore((state) => state.totalRounds);
  const user = useGameStore((state) => state.user);
  const currentDrawer = useGameStore((state) => state.currentDrawer);

  const isMyTurn = user?.id === currentDrawer;

  return (
    <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-4 flex justify-between items-center mb-6">
      
      {/* Timer Badge */}
      <div className="flex items-center gap-3 bg-red-100 border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <span className="text-2xl animate-pulse">⏱️</span>
        <span className="text-3xl font-black">{timer}s</span>
      </div>

      {/* The Word Display */}
      <div className="text-center">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">
          {isMyTurn ? "DRAW THIS WORD" : "GUESS THE WORD"}
        </p>
        <h2 className="text-4xl font-black tracking-[0.2em] text-black">
          {/* If there's no word yet, show waiting text */}
          {word ? word : "WAITING..."}
        </h2>
      </div>

      {/* Round Badge */}
      <div className="bg-blue-100 border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Round</p>
        <p className="text-2xl font-black">{currentRound} / {totalRounds}</p>
      </div>

    </div>
  );
}