// src/components/WordSelectionModal.tsx
import { useGameStore } from "../store/useGameStore";
import { socket } from "../socketClient";

export default function WordSelectionModal() {
  const roomCode = useGameStore((state) => state.roomCode);
  const user = useGameStore((state) => state.user);
  const currentDrawer = useGameStore((state) => state.currentDrawer);
  const word = useGameStore((state) => state.word); 
  const wordChoices = useGameStore((state) => state.wordChoices); 

  const isMyTurn = user?.id === currentDrawer;

  if (word) return null;

  if (!isMyTurn) {
    return (
      <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm p-4">
        <h2 className="text-3xl font-black text-white animate-pulse tracking-widest text-center mb-4">
          WAITING FOR DRAWER TO CHOOSE A WORD...
        </h2>
      </div>
    );
  }

  const handleChooseWord = (selectedWord: string) => {
    socket.emit("choose_word", { roomCode, word: selectedWord });
    useGameStore.getState().syncGameState({ word: selectedWord });
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm p-4">
      <h2 className="text-4xl font-black text-yellow-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] tracking-widest mb-8 text-center">
        CHOOSE A WORD
      </h2>
      
      <div className="flex gap-4 w-full max-w-lg">
        {wordChoices && wordChoices.length > 0 ? (
          wordChoices.map((w: string) => (
            <button
              key={w}
              onClick={() => handleChooseWord(w)}
              className="flex-1 bg-white hover:bg-yellow-300 text-black border-4 border-black py-4 rounded-xl font-black text-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all uppercase"
            >
              {w}
            </button>
          ))
        ) : (
          <div className="bg-red-500 text-white p-4 font-bold rounded-xl w-full text-center">
            🚨 ERROR: Backend didn't send any words! 🚨
          </div>
        )}
      </div>
    </div>
  );
}