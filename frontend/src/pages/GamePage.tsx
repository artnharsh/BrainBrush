// src/pages/GamePage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import GameHeader from "../components/GameHeader";
import CanvasBoard from "../components/CanvasBoard";
import ChatBox from "../components/ChatBox";

export default function GamePage() {
  const navigate = useNavigate();
  const gameStatus = useGameStore((state) => state.gameStatus);

  // 🚨 THE ROUTE GUARD 🚨
  useEffect(() => {
    // If the game is over, or they try to access this page directly without starting a game
    if (gameStatus !== 'playing') {
      navigate('/lobby', { replace: true });
    }
  }, [gameStatus, navigate]);

  return (
    <div className="min-h-screen bg-sky-100 p-4 md:p-8 font-sans flex flex-col items-center">
      {/* Master Container */}
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <GameHeader />
        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[650px]">
          <div className="flex-[2] min-h-[400px] lg:min-h-0">
            <CanvasBoard />
          </div>
          <div className="flex-1 min-h-[400px] lg:min-h-0">
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
  );
}