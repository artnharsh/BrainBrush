// src/pages/LobbyPage.tsx
import { useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useGameStore } from "../store/useGameStore";
import PlayerList from "../components/PlayerList";
import Loader from "../components/Loader";

export default function LobbyPage() {
  const { socket, isConnected } = useSocket();
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Pulling state from our global brain
  const user = useGameStore((state) => state.user);
  const roomCode = useGameStore((state) => state.roomCode);
  const hostId = useGameStore((state) => state.hostId);

  // --- SOCKET EMITTERS ---
  const handleCreateRoom = () => {
    setIsLoading(true);
    socket.emit("create_room");
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsLoading(true);
    socket.emit("join_room", { roomCode: joinCode.toUpperCase() });
  };

  const handleStartGame = () => {
    socket.emit("start_game", { roomCode });
  };

  // --- RENDER HELPERS ---
  // If the backend is processing our request, show the bouncy loader
  if (isLoading && !roomCode) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center font-sans">
        <Loader message="Communicating with server..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Top Connection Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 font-bold border-2 border-black px-4 py-2 rounded-full bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] z-10">
        <div className={`w-3 h-3 rounded-full border-2 border-black ${isConnected ? 'bg-green-400' : 'bg-red-500 animate-pulse'}`}></div>
        {isConnected ? "Online" : "Connecting..."}
      </div>

      <div className="w-full max-w-2xl bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 -rotate-1 relative">
        
        <header className="text-center mb-8">
          <h1 className="text-5xl font-black text-yellow-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] tracking-wider uppercase rotate-1">
            {roomCode ? "Waiting Room" : "Play Skribbl"}
          </h1>
        </header>

        {/* ----------------------------------------------------- */}
        {/* STATE 1: NOT IN A ROOM (SHOW CREATE/JOIN OPTIONS)     */}
        {/* ----------------------------------------------------- */}
        {!roomCode ? (
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            
            {/* Create Room Side */}
            <div className="flex-1 bg-green-100 border-4 border-black rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-4">Start a Game</h2>
              <p className="text-gray-700 font-bold mb-6">Create a private room and invite your friends.</p>
              <button 
                onClick={handleCreateRoom}
                disabled={!isConnected}
                className="w-full bg-green-400 hover:bg-green-500 text-black border-4 border-black py-3 rounded-xl font-black text-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                CREATE ROOM
              </button>
            </div>

            {/* Divider */}
            <div className="hidden md:flex items-center font-black text-gray-400">OR</div>

            {/* Join Room Side */}
            <form onSubmit={handleJoinRoom} className="flex-1 bg-blue-100 border-4 border-black rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-4">Join a Game</h2>
              <input 
                type="text" 
                placeholder="ENTER 4-LETTER CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="w-full border-4 border-black p-3 rounded-xl font-black text-center text-xl tracking-widest mb-4 focus:outline-none focus:ring-4 focus:ring-blue-300 uppercase"
              />
              <button 
                type="submit"
                disabled={!isConnected || joinCode.length < 4}
                className="w-full bg-blue-400 hover:bg-blue-500 text-black border-4 border-black py-3 rounded-xl font-black text-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                JOIN ROOM
              </button>
            </form>

          </div>
        ) : (
          
        /* ----------------------------------------------------- */
        /* STATE 2: INSIDE A ROOM                                */
        /* ----------------------------------------------------- */
          <div className="flex flex-col gap-6">
            
            {/* Room Code Display */}
            <div className="bg-gray-100 border-4 border-black rounded-xl p-4 text-center">
              <p className="font-bold text-gray-500 uppercase tracking-widest mb-1">Room Code</p>
              <h2 className="text-5xl font-black tracking-widest text-black">{roomCode}</h2>
            </div>

            {/* Player List */}
            <PlayerList />

            {/* Host Controls */}
            {user?.id === hostId ? (
              <button 
                onClick={handleStartGame}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white border-4 border-black py-4 rounded-xl font-black text-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
              >
                START GAME
              </button>
            ) : (
              <p className="text-center font-bold text-gray-500 animate-pulse mt-4">
                Waiting for the host to start...
              </p>
            )}

          </div>
        )}
      </div>
    </div>
  );
}