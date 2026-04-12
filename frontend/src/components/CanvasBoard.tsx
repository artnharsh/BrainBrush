// src/components/CanvasBoard.tsx
import { useEffect, useRef, useMemo, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { drawLine } from "../utils/drawUtils";
import { throttle } from "../utils/throttle";
import WordSelectionModal from "./WordSelectionModal";
import { socket } from "../socketClient";

// --- PURE PIXEL MATH FOR ERASER ---
const dist2 = (v: { x: number, y: number }, w: { x: number, y: number }) => (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
const distToSegmentSquared = (p: { x: number, y: number }, v: { x: number, y: number }, w: { x: number, y: number }) => {
  let l2 = dist2(v, w);
  if (l2 === 0) return dist2(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
};

const COLORS = ["#000000", "#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPos = useRef({ x: 0, y: 0 });

  const segmentsRef = useRef<any[]>([]);
  const currentStrokeId = useRef<string>("");

  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  const roomCode = useGameStore((state) => state.roomCode);
  const user = useGameStore((state) => state.user);
  const currentDrawer = useGameStore((state) => state.currentDrawer);

  const isMyTurn = user?.id === currentDrawer;

  // Stability fix: Keep track of turn without triggering re-renders in socket listeners
  const isMyTurnRef = useRef(isMyTurn);
  useEffect(() => { isMyTurnRef.current = isMyTurn; }, [isMyTurn]);

  // THE NUKE: Guarantees the canvas is wiped completely clean
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Reset transform matrix to ignore DPI scaling temporarily, wipe it, then restore!
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;

    segmentsRef.current.forEach(seg => {
      drawLine({
        ctx, x0: seg.x0 * w, y0: seg.y0 * h, x1: seg.x1 * w, y1: seg.y1 * h,
        color: seg.color, width: seg.width
      });
    });
  };

  // FIX: Auto-wipe memory when the drawer changes
  useEffect(() => {
    segmentsRef.current = [];
    redrawCanvas();
  }, [currentDrawer]);

  // --- DPI SCALING ---
  useEffect(() => {
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
      if (ctx) ctx.scale(dpr, dpr);
      redrawCanvas();
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // --- SOCKET LISTENERS (LOCKED IN) ---
  useEffect(() => {
    const onDrawLine = (segment: any) => {
      segmentsRef.current.push(segment);
      redrawCanvas();
    };

    const onEraseStroke = (strokeId: string) => {
      segmentsRef.current = segmentsRef.current.filter(s => s.strokeId !== strokeId);
      redrawCanvas();
    };

    const onClearCanvas = () => {
      segmentsRef.current = [];
      redrawCanvas();
    };

    const onSendSnapshot = (data: { targetSocketId: string }) => {
      if (!isMyTurnRef.current) return; // Uses ref so listener never detaches!
      socket.emit("deliver_canvas_snapshot", { targetSocketId: data.targetSocketId, segments: segmentsRef.current });
    };

    const onReceiveSnapshot = (data: { segments: any[] }) => {
      segmentsRef.current = data.segments || [];
      redrawCanvas();
    };

    socket.on("draw_line", onDrawLine);
    socket.on("erase_stroke", onEraseStroke);
    socket.on("clear_canvas", onClearCanvas);
    socket.on("send_canvas_snapshot", onSendSnapshot);
    socket.on("receive_canvas_snapshot", onReceiveSnapshot);

    return () => {
      socket.off("draw_line", onDrawLine);
      socket.off("erase_stroke", onEraseStroke);
      socket.off("clear_canvas", onClearCanvas);
      socket.off("send_canvas_snapshot", onSendSnapshot);
      socket.off("receive_canvas_snapshot", onReceiveSnapshot);
    };
  }, []); // Empty array! Listeners mount ONCE and stay forever.

  useEffect(() => {
    if (!isMyTurn && roomCode) socket.emit("request_canvas_sync", roomCode);
  }, [isMyTurn, roomCode]);

  // THROTTLED emit - fires max every 16ms (60fps)
  const emitDrawLine = useMemo(
    () => throttle((segment: any) => {
      socket.emit("draw_line", { roomCode, segment });
    }, 16),
    [roomCode]
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
    currentStrokeId.current = Math.random().toString(36).substring(2, 9);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !isMyTurn) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newPos = getCoordinates(e);
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;

    // FIX: EXACT PIXEL MATH FOR ERASER
    if (isEraser) {
      const hitRadiusSq = 20 * 20; // 20px physical radius
      let hitStrokeId: string | null = null;

      for (let seg of segmentsRef.current) {
        // Convert normalized memory coordinates back to real screen pixels
        const p0 = { x: seg.x0 * w, y: seg.y0 * h };
        const p1 = { x: seg.x1 * w, y: seg.y1 * h };
        const d2 = distToSegmentSquared({ x: newPos.x, y: newPos.y }, p0, p1);

        if (d2 < hitRadiusSq) {
          hitStrokeId = seg.strokeId;
          break; // Found the line! Stop searching.
        }
      }

      if (hitStrokeId) {
        segmentsRef.current = segmentsRef.current.filter(s => s.strokeId !== hitStrokeId);
        redrawCanvas();
        socket.emit("erase_stroke", { roomCode, strokeId: hitStrokeId });
      }
      currentPos.current = newPos;
      return;
    }

    // NORMAL DRAWING
    const segment = {
      strokeId: currentStrokeId.current,
      x0: currentPos.current.x / w, y0: currentPos.current.y / h,
      x1: newPos.x / w, y1: newPos.y / h,
      color: brushColor, width: brushSize,
    };

    segmentsRef.current.push(segment);
    redrawCanvas();
    emitDrawLine(segment);

    currentPos.current = newPos;
  };

  const stopDrawing = () => isDrawing.current = false;

  const handleClearCanvas = () => {
    segmentsRef.current = [];
    redrawCanvas();
    socket.emit("clear_canvas", roomCode);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden">
      <WordSelectionModal />

      {isMyTurn && (
        <div className="bg-gray-100 border-b-4 border-black p-2 flex items-center justify-between z-10 overflow-x-auto no-scrollbar">          <div className="flex gap-2">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setBrushColor(c); setIsEraser(false); }}
              className={`w-8 h-8 rounded-full border-2 ${brushColor === c && !isEraser ? 'border-black scale-110 shadow-md' : 'border-gray-300'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <button
            onClick={() => setIsEraser(true)}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white ${isEraser ? 'border-black scale-110 shadow-md ring-2 ring-red-400' : 'border-gray-300'}`}
            title="Erase Entire Line"
          >
            🧹
          </button>
        </div>

          <div className="flex gap-1 md:gap-2 items-center shrink-0 ml-4">
            <button onClick={() => setBrushSize(3)} className={`p-1 rounded font-bold ${brushSize === 3 ? 'bg-gray-300' : ''}`}>Thin</button>
            <button onClick={() => setBrushSize(6)} className={`p-1 rounded font-bold ${brushSize === 6 ? 'bg-gray-300' : ''}`}>Med</button>
            <button onClick={() => setBrushSize(12)} className={`p-1 rounded font-bold ${brushSize === 12 ? 'bg-gray-300' : ''}`}>Thick</button>
          </div>

          <button
            onClick={handleClearCanvas}
            className="ml-2 bg-red-500 text-white px-2 md:px-3 py-1 rounded text-xs md:text-base font-bold border-2 border-black"
          >
            Clear All
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing}
        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        className={`touch-none flex-1 w-full block ${isMyTurn ? (isEraser ? 'cursor-cell' : 'cursor-crosshair') : 'cursor-default'}`} />
    </div>
  );
}