// src/components/CanvasBoard.tsx
import { useEffect, useRef, useMemo } from "react";
import { useSocket } from "../hooks/useSocket";
import { useGameStore } from "../store/useGameStore";
import { drawLine } from "../utils/drawUtils";
import { throttle } from "../utils/throttle";
import WordSelectionModal from "./WordSelectionModal";

export default function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPos = useRef({ x: 0, y: 0 });

  const { socket } = useSocket();
  const roomCode = useGameStore((state) => state.roomCode);
  const user = useGameStore((state) => state.user);
  const currentDrawer = useGameStore((state) => state.currentDrawer);

  const isMyTurn = user?.id === currentDrawer;

  // --- 1. DPI SCALING (From Day 6) ---
  useEffect(() => {
    // ... (Keep your exact resizeCanvas logic from Day 6 here)
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        // Set default background to white so snapshots don't have transparent backgrounds
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // --- 2. THE SNAPSHOT TRICK & SOCKET LISTENERS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // A. Receive normal drawing lines
    const onDrawLine = (data: any) => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      drawLine({
        ctx,
        x0: data.x0 * w, y0: data.y0 * h, x1: data.x1 * w, y1: data.y1 * h,
        color: data.color, width: data.width,
      });
    };

    // B. If a new player joins, the backend asks US (the drawer) for a picture
    const onSendSnapshot = (data: { targetSocketId: string }) => {
      if (!isMyTurn) return; // Only the drawer provides the snapshot
      // Convert the HTML Canvas into a Base64 Image string
      const imageBase64 = canvas.toDataURL("image/png");
      socket.emit("deliver_canvas_snapshot", {
        targetSocketId: data.targetSocketId,
        imageBase64,
      });
    };

    // C. We are the new player, and we just received the picture!
    const onReceiveSnapshot = (imageBase64: string) => {
      const img = new Image();
      img.onload = () => {
        // Clear the canvas and paste the image perfectly
        const w = canvas.getBoundingClientRect().width;
        const h = canvas.getBoundingClientRect().height;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = imageBase64;
    };

    socket.on("draw_line", onDrawLine);
    socket.on("send_canvas_snapshot", onSendSnapshot);
    socket.on("receive_canvas_snapshot", onReceiveSnapshot);

    return () => { 
      socket.off("draw_line", onDrawLine); 
      socket.off("send_canvas_snapshot", onSendSnapshot);
      socket.off("receive_canvas_snapshot", onReceiveSnapshot);
    };
  }, [socket, isMyTurn]);

  // --- 3. REQUEST SNAPSHOT ON MOUNT ---
  useEffect(() => {
    // If I'm NOT the drawer, ask the backend to get me the current picture
    if (!isMyTurn && roomCode) {
      socket.emit("request_canvas_sync", roomCode);
    }
  }, [isMyTurn, roomCode, socket]);

  // --- 4. THROTTLED EMITTER ---
  // Memoize the throttled function so it isn't recreated on every render
  const emitDrawLine = useMemo(
    () => throttle((data: any) => socket.emit("draw_line", data), 30), // 30ms limit (approx 30fps)
    [socket]
  );

  // --- DRAWING LOGIC ---
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMyTurn) return;
    isDrawing.current = true;
    currentPos.current = getCoordinates(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !isMyTurn) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const newPos = getCoordinates(e);
    
    // Draw instantly locally
    drawLine({
      ctx,
      x0: currentPos.current.x, y0: currentPos.current.y, x1: newPos.x, y1: newPos.y,
      color: "#000000", width: 5,
    });

    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;

    // Use the 30ms throttled emitter instead of raw socket.emit!
    emitDrawLine({
      roomCode,
      x0: currentPos.current.x / w, y0: currentPos.current.y / h,
      x1: newPos.x / w, y1: newPos.y / h,
      color: "#000000", width: 5,
    });

    currentPos.current = newPos;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  return (
    <div className="w-full h-full bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden cursor-crosshair">
      <WordSelectionModal />
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        className="touch-none w-full h-full block"
      />
    </div>
  );
}