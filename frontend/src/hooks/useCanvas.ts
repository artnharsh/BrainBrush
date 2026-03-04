import { useState } from "react";

type LineType = {
  points: number[];
};

export default function useCanvas() {
  const [lines, setLines] = useState<LineType[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (pos: { x: number; y: number }) => {
    setIsDrawing(true);
    setLines((prev) => [...prev, { points: [pos.x, pos.y] }]);
  };

  const draw = (pos: { x: number; y: number }) => {
    if (!isDrawing) return;

    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];
      lastLine.points = lastLine.points.concat([pos.x, pos.y]);

      const updatedLines = [...prevLines];
      updatedLines.splice(prevLines.length - 1, 1, lastLine);

      return updatedLines;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return {
    lines,
    startDrawing,
    draw,
    stopDrawing,
  };
}