import { useEffect, useState } from "react";
import { socket } from "../socketClient";
import { useGameStore } from "../store/useGameStore";
import { ShieldAlert, LogOut } from "lucide-react";

export default function SessionConflictModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const clearAuth = useGameStore((state) => state.clearAuth);

  useEffect(() => {
    const onSessionConflict = (data: { message: string }) => {
      setMessage(data.message);
      setIsVisible(true);
    };

    socket.on("session_conflict", onSessionConflict);

    return () => {
      socket.off("session_conflict", onSessionConflict);
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white border-8 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)] max-w-lg w-full mx-4 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-red-500 px-6 py-4 flex items-center gap-4 border-b-4 border-black">
          <div className="bg-white p-2 border-2 border-black">
            <ShieldAlert size={28} strokeWidth={3} className="text-red-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            Session Conflict
          </h2>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="bg-red-50 border-4 border-dashed border-red-300 p-6 mb-8">
            <p className="font-bold text-lg text-gray-800 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <span className="bg-yellow-400 border-2 border-black px-2 py-0.5 font-black text-xs uppercase shrink-0 mt-0.5">Why?</span>
              <p className="text-sm font-bold text-gray-600">
                Only one active session per account is allowed to prevent game state corruption and ensure fair gameplay.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-black text-white px-8 py-4 font-black uppercase italic text-xl flex items-center justify-center gap-3 
              hover:bg-red-500 transition-all active:translate-y-1 active:shadow-none 
              shadow-[6px_6px_0px_rgba(0,0,0,0.3)] border-4 border-black"
          >
            <LogOut size={24} strokeWidth={3} />
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}
