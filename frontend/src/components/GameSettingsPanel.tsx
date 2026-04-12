import { useGameStore } from "../store/useGameStore";

export default function GameSettingsPanel() {
  const user = useGameStore((state) => state.user);
  const hostId = useGameStore((state) => state.hostId);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const roomCode = useGameStore((state) => state.roomCode);
  const gameSettings = useGameStore((state) => state.gameSettings);
  const setGameSettings = useGameStore((state) => state.setGameSettings);

  // Only show if host, in lobby, and have a room code
  if (gameStatus !== "lobby" || !roomCode || user?.id !== hostId) {
    return null;
  }

  const isCustomWordsCategory = gameSettings.wordCategory === "custom";

  // Data for our new Category Grid
  const categories = [
    { id: "random", icon: "❓", label: "Random" },
    { id: "animals", icon: "🐱", label: "Animals" },
    { id: "food", icon: "☕", label: "Food" },
    { id: "sports", icon: "⚽", label: "Sports" },
    { id: "tech", icon: "💻", label: "Tech" },
    { id: "custom", icon: "✏️", label: "Custom" },
  ] as const;

  return (
    <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-6 overflow-hidden">
      
      {/* ⚙️ HEADER TITLE */}
      <div className="bg-orange-400 border-b-4 border-black p-4 flex items-center justify-center gap-3">
        <span className="text-2xl">⚙️</span>
        <h3 className="text-2xl font-black uppercase tracking-widest text-black drop-shadow-[2px_2px_0px_rgba(255,255,255,0.5)]">
          Game Settings
        </h3>
      </div>

      <div className="p-6 space-y-8 bg-orange-50">
        
        {/* ================================== */}
        {/* 1. MAX ROUNDS SLIDER               */}
        {/* ================================== */}
        <div>
          <label className="block font-black text-lg mb-4 uppercase tracking-wider text-gray-800">
            Total Rounds
          </label>
          <div className="flex items-center gap-6">
            <input
              type="range"
              min="1"
              max="5"
              value={gameSettings.maxRounds}
              onChange={(e) => setGameSettings({ maxRounds: Number(e.target.value) })}
              className="flex-1 h-4 bg-gray-200 border-4 border-black rounded-full appearance-none cursor-pointer accent-orange-500 shadow-[inset_0px_4px_0px_rgba(0,0,0,0.1)]"
            />
            {/* Chunky Number Display */}
            <div className="w-16 h-16 shrink-0 bg-yellow-300 border-4 border-black rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center text-3xl font-black">
              {gameSettings.maxRounds}
            </div>
          </div>
          <div className="flex justify-between text-sm font-black text-gray-400 px-2 mt-2">
            <span>1</span>
            <span>5</span>
          </div>
        </div>

        {/* ================================== */}
        {/* 2. DIFFICULTY BUTTONS              */}
        {/* ================================== */}
        <div>
          <label className="block font-black text-lg mb-3 uppercase tracking-wider text-gray-800">
            Word Difficulty
          </label>
          <div className="flex gap-3">
            {(["easy", "medium", "hard"] as const).map((level) => {
              const isActive = gameSettings.wordDifficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setGameSettings({ wordDifficulty: level })}
                  className={`flex-1 py-3 px-2 rounded-xl border-4 border-black font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-green-400 translate-y-1 shadow-none"
                      : "bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:-translate-y-1"
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================== */}
        {/* 3. CATEGORY GRID (NO MORE DROPDOWN)*/}
        {/* ================================== */}
        <div>
          <label className="block font-black text-lg mb-3 uppercase tracking-wider text-gray-800">
            Word Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isActive = (gameSettings.wordCategory || "random") === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setGameSettings({ wordCategory: cat.id })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-4 border-black font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-yellow-300 translate-y-1 shadow-none"
                      : "bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-orange-100 hover:-translate-y-1"
                  }`}
                >
                  <span className="text-3xl mb-1">{cat.icon}</span>
                  <span className="text-sm">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================== */}
        {/* 4. CUSTOM WORDS TEXTAREA           */}
        {/* ================================== */}
        {isCustomWordsCategory && (
          <div className="animate-[slideDown_0.3s_ease-out]">
            <div className="flex justify-between items-end mb-3">
              <label className="block font-black text-lg uppercase tracking-wider text-gray-800">
                Custom Dictionary
              </label>
              {gameSettings.customWords && gameSettings.customWords.length > 0 && (
                <span className="bg-green-200 text-green-800 border-2 border-black font-black text-xs px-3 py-1 rounded-full shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {gameSettings.customWords.length} WORD{gameSettings.customWords.length !== 1 ? "S" : ""}
                </span>
              )}
            </div>
            
            <textarea
              value={(gameSettings.customWords || []).join(", ")}
              onChange={(e) => {
                const words = e.target.value
                  .split(",")
                  .map((w) => w.trim())
                  .filter((w) => w.length > 0);
                setGameSettings({ customWords: words });
              }}
              placeholder="e.g., Dragon, Phoenix, Unicorn..."
              className="w-full bg-yellow-50 border-4 border-black p-4 rounded-xl font-bold text-lg h-32 resize-none shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-4 focus:ring-orange-300 focus:bg-white transition-colors placeholder:text-gray-400 leading-relaxed"
            />
            <p className="text-xs font-bold text-gray-500 mt-2 flex items-center gap-1">
              <span>💡</span> Separate words using commas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}