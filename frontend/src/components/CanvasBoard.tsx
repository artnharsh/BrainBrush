import { useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { useGameStore } from "../store/useGameStore";
import { drawLine } from "../utils/drawUtils";

export default function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 1. We use refs for drawing state to PREVENT React from re-rendering 60 times a second!
  const isDrawing = useRef(false);
  const currentPos = useRef({ x: 0, y: 0 });

  const { socket } = useSocket();
  const roomCode = useGameStore((state) => state.roomCode);
  const user = useGameStore((state) => state.user);
  const currentDrawer = useGameStore((state) => state.currentDrawer);

  const isMyTurn = user?.id === currentDrawer;

  // --- DPI SCALING & RESIZING ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      // 1. Get the actual CSS display size
      const { width, height } = parent.getBoundingClientRect();

      // 2. Get the screen's pixel ratio (Retina displays are usually 2 or 3)
      const dpr = window.devicePixelRatio || 1;

      // 3. Set the internal resolution multiplied by the DPR to fix blurriness
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // 4. Force the CSS to match the parent
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // 5. Scale the context so our drawing coordinates still map 1:1 with CSS pixels
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // --- SOCKET LISTENERS (Receiving other people's drawings) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onDrawLine = (data: { x0: number; y0: number; x1: number; y1: number; color: string; width: number }) => {
      // DENORMALIZE: Convert the incoming percentages (0.0 to 1.0) back into absolute pixels based on OUR screen size
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      drawLine({
        ctx,
        x0: data.x0 * w,
        y0: data.y0 * h,
        x1: data.x1 * w,
        y1: data.y1 * h,
        color: data.color,
        width: data.width,
      });
    };

    socket.on("draw_line", onDrawLine);
    return () => { socket.off("draw_line", onDrawLine); };
  }, [socket]);

  // --- DRAWING LOGIC (Mouse & Touch) ---
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and mobile touch events seamlessly
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
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

    // 1. Draw instantly on our own screen (Optimistic UI)
    drawLine({
      ctx,
      x0: currentPos.current.x,
      y0: currentPos.current.y,
      x1: newPos.x,
      y1: newPos.y,
      color: "#000000", // Hardcoded black for now (we'll add color pickers later)
      width: 5,
    });

    // 2. NORMALIZE: Convert pixels to percentages before sending to the server
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;

    socket.emit("draw_line", {
      roomCode,
      x0: currentPos.current.x / w,
      y0: currentPos.current.y / h,
      x1: newPos.x / w,
      y1: newPos.y / h,
      color: "#000000",
      width: 5,
    });

    // 3. Update the tracking ref
    currentPos.current = newPos;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  return (
    <div className="w-full h-full bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing} // Stops drawing if mouse leaves the canvas
        onTouchStart={startDrawing} // Mobile support
        onTouchMove={draw}          // Mobile support
        onTouchEnd={stopDrawing}    // Mobile support
        className="touch-none w-full h-full block" // touch-none prevents page scrolling while drawing on mobile
      />
    </div>
  );
}