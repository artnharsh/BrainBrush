// src/components/PlayerList.tsx
import { useGameStore } from "../store/useGameStore";

export default function PlayerList() {
  const players = useGameStore((state) => state.players);
  const hostId = useGameStore((state) => state.hostId);
  // Assuming your players array might hold objects later, but for now we render strings
  // If your backend sends objects like { id, username }, adjust the mapping below!

  return (
    <div className="bg-white border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xl font-black mb-4 border-b-4 border-black pb-2 inline-block">
        Players ({players.length})
      </h3>
      
      <ul className="space-y-3">
        {players.map((player, index) => (
          <li 
            key={index} 
            className="flex items-center gap-3 bg-gray-100 border-2 border-black p-3 rounded-lg font-bold"
          >
            {/* Cute default avatar box */}
            <div className="w-8 h-8 bg-purple-400 border-2 border-black rounded flex items-center justify-center text-white">
              {player.charAt(0).toUpperCase()}
            </div>
            
            <span className="text-lg flex-1 truncate">{player}</span>
            
            {/* Host Badge */}
            {/* Note: Update 'player.id' or 'player' depending on your backend payload */}
            {player === hostId && (
              <span className="text-2xl drop-shadow-md" title="Host">👑</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}