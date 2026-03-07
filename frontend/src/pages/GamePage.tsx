import { useParams } from "react-router-dom";

import useSocket from "../hooks/useSocket";
import PlayerList from "../components/player/PlayerList";
import DrawingCanvas from "../components/canvas/DrawingCanvas";
import ChatBox from "../components/chat/ChatBox";
import BrushSelector from "../components/toolbar/BrushSelector";
import ColorPalette from "../components/toolbar/ColorPalette";
import Eraser from "../components/toolbar/Eraser";

import useCanvas from "../hooks/useCanvas";
import ClearCanvas from "../components/toolbar/ClearCanvas";
import { useEffect } from "react";

export default function GamePage() {
  const socket = useSocket();

  const { roomId } = useParams();
  const canvas = useCanvas();

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_room", roomId);
  }, [socket, roomId]);

  const handleDrawStart = (line: any) => {
    socket?.emit("draw_start", {
      roomId,
      line,
    });
  };

  const handleDrawMove = (point: { x: number; y: number }) => {
    socket?.emit("draw_move", {
      roomId,
      point,
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Main Game Area */}
      <div className="flex flex-1">
        <div className="w-1/5 border-r p-3">
          <PlayerList />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <DrawingCanvas
            canvas={canvas}
            onDrawStart={handleDrawStart}
            onDrawMove={handleDrawMove}
          />
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
        <ClearCanvas canvas={canvas} />
      </div>
    </div>
  );
}