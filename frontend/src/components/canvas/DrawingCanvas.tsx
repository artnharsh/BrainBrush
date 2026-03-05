import { Stage, Layer, Line } from "react-konva";
import useCanvas from "../../hooks/useCanvas";
import { useGameStore } from "../../store/gameStore";

type Props = {
  canvas: ReturnType<typeof useCanvas>;
};

export default function DrawingCanvas({ canvas }: Props) {
  const { lines, startDrawing, draw, stopDrawing } = canvas;

  const color = useGameStore((s) => s.color);
  const brushSize = useGameStore((s) => s.brushSize);
  const tool = useGameStore((s) => s.tool);

  const handleMouseDown = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();

    startDrawing(pos, tool === "eraser" ? "white" : color, brushSize);
  };

  const handleMouseMove = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    draw(pos);
  };

  return (
    <Stage
      width={700}
      height={500}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrawing}
      className="border rounded-lg bg-white"
    >
      <Layer>
        {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke={line.color}
            strokeWidth={line.size}
            tension={0.5}
            lineCap="round"
          />
        ))}
      </Layer>
    </Stage>
  );
}
