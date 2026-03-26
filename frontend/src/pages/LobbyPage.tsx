import { useSocket } from "../hooks/useSocket";

export default function LobbyPage() {
  const { isConnected } = useSocket();

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-2xl bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 -rotate-1">
        
        <header className="flex justify-between items-center border-b-4 border-black pb-4 mb-8">
          <h1 className="text-4xl font-black text-yellow-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] tracking-wider">
            LOBBY
          </h1>
          
          <div className="flex items-center gap-2 font-bold border-2 border-black px-4 py-2 rounded-full bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className={`w-3 h-3 rounded-full border-2 border-black ${isConnected ? 'bg-green-400' : 'bg-red-500 animate-pulse'}`}></div>
            {isConnected ? "Connected" : "Reconnecting..."}
          </div>
        </header>

        <div className="text-center py-12">
          <p className="text-2xl font-bold text-gray-700 animate-bounce">
            Waiting for players to join...
          </p>
        </div>
        
      </div>
    </div>
  );
}