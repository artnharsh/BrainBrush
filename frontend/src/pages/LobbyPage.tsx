// src/pages/LobbyPage.tsx
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useGameStore } from "../store/useGameStore";
import PlayerList from "../components/PlayerList";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

export default function LobbyPage() {
  // ==========================================
  // 1. ALL HOOKS MUST LIVE UP HERE!
  // ==========================================

  const navigate = useNavigate();
  
  // 2. Pull gameStatus from the store
  const gameStatus = useGameStore((state) => state.gameStatus);
  
  // ... (keep your other hooks)

  // 3. Add this magical useEffect right next to your other ones:
  useEffect(() => {
    // If the backend tells us the game started, jump to the Game Board!
    if (gameStatus === 'playing') {
      navigate('/game');
    }
  }, [gameStatus, navigate]);

  
  const { socket, isConnected } = useSocket();
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const user = useGameStore((state) => state.user);
  const roomCode = useGameStore((state) => state.roomCode);
  const hostId = useGameStore((state) => state.hostId);
  const clearAuth = useGameStore((state) => state.clearAuth);

  const [tempName, setTempName] = useState(user?.username || "");

  // Auto-kill the loader when a room is successfully joined!
  useEffect(() => {
    if (roomCode) {
      setIsLoading(false);
    }
  }, [roomCode]);

  // ==========================================
  // 2. REGULAR FUNCTIONS
  // ==========================================
  const handleCreateRoom = () => {
    if (!tempName.trim()) return alert("Please enter a display name!");
    setIsLoading(true);
    socket.emit("create_room"); 
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !tempName.trim()) return alert("Please enter a code and name!");
    setIsLoading(true);
    socket.emit("join_room", joinCode.toUpperCase());
    // Optimistic UI Update
    useGameStore.getState().setRoom(joinCode.toUpperCase(), [], "");
  };

  const handleStartGame = () => {
    if (!roomCode) return;
    socket.emit("start_game", roomCode);
  };

  const handleLeaveRoom = () => {
    setIsLoading(false);
    if (roomCode) {
      socket.emit("leave_room", roomCode);
      useGameStore.getState().resetRoom();
    }
  };

  const handleLogout = () => {
    socket.disconnect(); 
    clearAuth(); 
  };

  // ==========================================
  // 3. EARLY RETURNS (Must be AFTER all Hooks)
  // ==========================================
  if (isLoading && !roomCode) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center font-sans">
        <Loader message="Communicating with server..." />
      </div>
    );
  }

  // ==========================================
  // 4. MAIN UI
  // ==========================================
  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-4 font-sans relative">
      
      {/* Top Header Bar (Connection Status & Logout) */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <button 
          onClick={handleLogout}
          className="bg-white border-2 border-black px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
        >
          LOGOUT
        </button>

        <div className="flex items-center gap-2 font-bold border-2 border-black px-4 py-2 rounded-full bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className={`w-3 h-3 rounded-full border-2 border-black ${isConnected ? 'bg-green-400' : 'bg-red-500 animate-pulse'}`}></div>
          {isConnected ? "Online" : "Connecting..."}
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 -rotate-1 relative mt-12">
        
        <header className="text-center mb-8">
          <h1 className="text-5xl font-black text-yellow-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] tracking-wider uppercase rotate-1">
            {roomCode ? "Waiting Room" : "Play Skribbl"}
          </h1>
        </header>

        {!roomCode ? (
          <div className="flex flex-col gap-6">
            <div className="bg-yellow-100 border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <label className="block font-black text-lg mb-2 uppercase tracking-widest text-gray-700">Display Name</label>
              <input 
                type="text" 
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={15}
                className="w-full border-4 border-black p-3 rounded-xl font-black text-xl focus:outline-none focus:ring-4 focus:ring-yellow-300"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-stretch mt-4">
              <div className="flex-1 bg-green-100 border-4 border-black rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">Start a Game</h2>
                <button 
                  onClick={handleCreateRoom}
                  disabled={!isConnected}
                  className="w-full bg-green-400 hover:bg-green-500 text-black border-4 border-black py-3 rounded-xl font-black text-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                >
                  CREATE ROOM
                </button>
              </div>

              <div className="hidden md:flex items-center font-black text-gray-400">OR</div>

              <form onSubmit={handleJoinRoom} className="flex-1 bg-blue-100 border-4 border-black rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">Join a Game</h2>
                <input 
                  type="text" 
                  placeholder="6-LETTER CODE"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full border-4 border-black p-3 rounded-xl font-black text-center text-xl tracking-widest mb-4 focus:outline-none focus:ring-4 focus:ring-blue-300 uppercase"
                />
                <button 
                  type="submit"
                  disabled={!isConnected || joinCode.length < 6}
                  className="w-full bg-blue-400 hover:bg-blue-500 text-black border-4 border-black py-3 rounded-xl font-black text-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                >
                  JOIN ROOM
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-gray-100 border-4 border-black rounded-xl p-4">
              <div>
                <p className="font-bold text-gray-500 uppercase tracking-widest mb-1 text-sm">Room Code</p>
                <h2 className="text-4xl font-black tracking-widest text-black">{roomCode}</h2>
              </div>
              <button 
                onClick={handleLeaveRoom}
                className="bg-red-400 hover:bg-red-500 text-black border-4 border-black px-6 py-2 rounded-xl font-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
              >
                LEAVE
              </button>
            </div>

            <PlayerList />

            {user?.id === hostId ? (
              <button 
                onClick={handleStartGame}
                className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white border-4 border-black py-4 rounded-xl font-black text-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all tracking-widest"
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