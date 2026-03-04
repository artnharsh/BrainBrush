import { Stage, Layer, Line } from "react-konva";
import useCanvas from "../../hooks/useCanvas";

export default function DrawingCanvas() {
  const { lines, startDrawing, draw, stopDrawing } = useCanvas();

  const handleMouseDown = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    startDrawing(pos);
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
            stroke="black"
            strokeWidth={5}
            tension={0.5}
            lineCap="round"
          />
        ))}
      </Layer>
    </Stage>
  );
}