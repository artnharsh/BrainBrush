// src/pages/GamePage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { useSocket } from "../hooks/useSocket"; 

import GameHeader from "../components/GameHeader";
import CanvasBoard from "../components/CanvasBoard";
import ChatBox from "../components/ChatBox";
import ScoreBoard from "../components/ScoreBoard"; 
import Podium from "../components/Podium";

export default function GamePage() {
  useSocket(); 

  const navigate = useNavigate();
  const gameStatus = useGameStore((state) => state.gameStatus);

  useEffect(() => {
    if (gameStatus !== 'playing' && gameStatus !== 'podium') {
      navigate('/lobby', { replace: true });
    }
  }, [gameStatus, navigate]);

  return (
    <div className="min-h-screen bg-sky-100 p-4 md:p-8 font-sans flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        <GameHeader />
        
        {/* 🚨 SHOW PODIUM IF GAME OVER, OTHERWISE SHOW THE 3-COLUMN BOARD */}
        {gameStatus === 'podium' ? (
          <Podium />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[650px]">
            {/* Column 1: Leaderboard */}
            <div className="flex-1 min-h-[300px] lg:min-h-0">
               <ScoreBoard />
            </div>
            
            {/* Column 2: Canvas (Takes up 2x the space) */}
            <div className="flex-[2] min-h-[400px] lg:min-h-0">
              <CanvasBoard />
            </div>
            
            {/* Column 3: Chat */}
            <div className="flex-1 min-h-[400px] lg:min-h-0">
              <ChatBox />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}