import { useState } from "react";

type LineType = {
  points: number[];
  color: string;
  size: number;
};

export default function useCanvas() {
  const [lines, setLines] = useState<LineType[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const clearCanvas = () => {
    setLines([]);
  };

  const startDrawing = (
    pos: { x: number; y: number },
    color: string,
    size: number,
  ) => {
    setIsDrawing(true);

    setLines((prev) => [
      ...prev,
      {
        points: [pos.x, pos.y],
        color,
        size,
      },
    ]);
  };

  const draw = (pos: { x: number; y: number }) => {
    if (!isDrawing) return;

    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];

      lastLine.points = lastLine.points.concat([pos.x, pos.y]);

      const updated = [...prevLines];
      updated.splice(prevLines.length - 1, 1, lastLine);

      return updated;
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
    clearCanvas,
  };
}
