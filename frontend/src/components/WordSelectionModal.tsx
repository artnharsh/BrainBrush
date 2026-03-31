// src/components/WordSelectionModal.tsx
import { useSocket } from "../hooks/useSocket";
import { useGameStore } from "../store/useGameStore";

// Hardcoded for now, we can randomize these from the backend later!
const RANDOM_WORDS = ["APPLE", "GUITAR", "ELEPHANT"];

export default function WordSelectionModal() {
  const { socket } = useSocket();
  const roomCode = useGameStore((state) => state.roomCode);
  const user = useGameStore((state) => state.user);
  const currentDrawer = useGameStore((state) => state.currentDrawer);
  const word = useGameStore((state) => state.word); // The currently active word

  const isMyTurn = user?.id === currentDrawer;

  // 1. If a word is already chosen, hide this modal completely
  if (word) return null;

  // 2. If it's NOT my turn, show a waiting screen over the canvas
  if (!isMyTurn) {
    return (
      <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center rounded-xl backdrop-blur-sm">
        <h2 className="text-3xl font-black text-white animate-pulse tracking-widest text-center px-4">
          WAITING FOR DRAWER TO CHOOSE A WORD...
        </h2>
      </div>
    );
  }

  // 3. If it IS my turn, let me click a word to start the timer!
  const handleChooseWord = (selectedWord: string) => {
    socket.emit("choose_word", { roomCode, word: selectedWord });
    // Optimistically update our local UI so the modal closes instantly
    useGameStore.getState().syncGameState({ word: selectedWord });
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm p-4">
      <h2 className="text-4xl font-black text-yellow-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] tracking-widest mb-8 text-center">
        CHOOSE A WORD
      </h2>
      
      <div className="flex gap-4 w-full max-w-lg">
        {RANDOM_WORDS.map((w) => (
          <button
            key={w}
            onClick={() => handleChooseWord(w)}
            className="flex-1 bg-white hover:bg-yellow-300 text-black border-4 border-black py-4 rounded-xl font-black text-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}