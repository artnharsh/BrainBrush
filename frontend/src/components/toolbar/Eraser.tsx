import { useGameStore } from "../../store/gameStore";

export default function Eraser() {

  const setTool = useGameStore((state) => state.setTool);

  return (
    <button
      onClick={() => setTool("eraser")}
      className="px-4 py-2 border rounded"
    >
      Eraser
    </button>
  );
}