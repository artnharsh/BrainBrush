import { useParams } from "react-router-dom";

import PlayerList from "../components/player/PlayerList";
import DrawingCanvas from "../components/canvas/DrawingCanvas";
import ChatBox from "../components/chat/ChatBox";
import BrushSelector from "../components/toolbar/BrushSelector";
import ColorPalette from "../components/toolbar/ColorPalette";
import Eraser from "../components/toolbar/Eraser";

export default function GamePage() {
  const { roomId } = useParams();

  return (
    <div className="h-screen flex flex-col">

      {/* Main Game Area */}
      <div className="flex flex-1">

        <div className="w-1/5 border-r p-3">
          <PlayerList />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <DrawingCanvas />
        </div>

        <div className="w-1/4 border-l p-3">
          <ChatBox />
        </div>

      </div>

      {/* Toolbar */}
      <div className="h-20 border-t flex items-center justify-center gap-6">
        <BrushSelector />
        <ColorPalette />
        <Eraser />
      </div>

    </div>
  );
}