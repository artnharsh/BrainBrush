import { useGameStore } from "../../store/gameStore";

export default function BrushSelector() {

  const setBrushSize = useGameStore((state) => state.setBrushSize);
  const setTool = useGameStore((state) => state.setTool);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => {
          setBrushSize(3);
          setTool("brush");
        }}
        className="px-3 py-1 border rounded"
      >
        Small
      </button>

      <button
        onClick={() => {
          setBrushSize(6);
          setTool("brush");
        }}
        className="px-3 py-1 border rounded"
      >
        Medium
      </button>

      <button
        onClick={() => {
          setBrushSize(10);
          setTool("brush");
        }}
        className="px-3 py-1 border rounded"
      >
        Large
      </button>
    </div>
  );
}