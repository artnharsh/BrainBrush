export interface DrawLineProps {
  ctx: CanvasRenderingContext2D;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  width: number;
}

// A pure function to draw a smooth line
export const drawLine = ({ ctx, x0, y0, x1, y1, color, width }: DrawLineProps) => {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  
  // CRITICAL for smooth drawing:
  ctx.lineCap = "round";  // Makes the ends of the lines circular, not flat
  ctx.lineJoin = "round"; // Makes the corners where lines meet smooth
  
  ctx.stroke();
  ctx.closePath();
};