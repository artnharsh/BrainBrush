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
    <div className="min-h-screen bg-sky-100 p-2 md:p-6 lg:p-8 font-sans flex flex-col items-center">
      <div className="w-full max-w-[1600px] flex flex-col gap-4 md:gap-6">
        <GameHeader />
        
        {gameStatus === 'podium' ? (
          <Podium />
        ) : (
          /* MOBILE: Stacked (Canvas first via order-first)
             DESKTOP: 3-Column Grid 
          */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:h-[calc(100vh-180px)]">
            
            {/* Column 1: ScoreBoard (Hidden/Bottom on mobile, Left on Desktop) */}
            <div className="order-2 lg:order-1 lg:col-span-1 h-[400px] lg:h-full">
               <ScoreBoard />
            </div>
            
            {/* Column 2: Canvas (Top on mobile, Middle on Desktop) */}
            <div className="order-1 lg:order-2 lg:col-span-2 h-[450px] md:h-[600px] lg:h-full">
              <CanvasBoard />
            </div>
            
            {/* Column 3: Chat (Bottom on mobile, Right on Desktop) */}
            <div className="order-3 lg:order-3 lg:col-span-1 h-[450px] lg:h-full">
              <ChatBox />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}