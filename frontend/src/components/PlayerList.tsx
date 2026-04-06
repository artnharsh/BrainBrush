// src/components/PlayerList.tsx
import { useGameStore } from "../store/useGameStore";

export default function PlayerList() {
  const players = useGameStore((state) => state.players);
  const hostId = useGameStore((state) => state.hostId);
  const user = useGameStore((state) => state.user);
  
  // 🚨 1. Pull in the Phonebook from Zustand!
  const playerNames = useGameStore((state) => state.playerNames) || {}; 

  return (
    <div className="bg-white border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
      <h3 className="font-black text-xl mb-4 border-b-4 border-black pb-2 uppercase tracking-widest">
        Players ({players.length})
      </h3>
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {players.map((playerId) => {
          const isMe = user?.id === playerId;
          const isHost = hostId === playerId;
          
          // 🚨 2. Use the Phonebook to get the real name!
          const displayName = playerNames[playerId] || `Guest-${playerId.slice(-4)}`;

          return (
            <li 
              key={playerId}
              className={`flex items-center justify-between p-3 border-2 border-black rounded-lg font-bold ${
                isMe ? 'bg-yellow-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg truncate max-w-[200px]">{displayName}</span>
                {isMe && <span className="text-xs bg-black text-white px-2 py-1 rounded-full ml-2">YOU</span>}
              </div>
              {isHost && <span title="Room Host" className="text-xl drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">👑</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}