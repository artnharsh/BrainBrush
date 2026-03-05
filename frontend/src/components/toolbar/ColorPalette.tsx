import { useGameStore } from "../../store/gameStore";

export default function ColorPalette() {

const setColor = useGameStore((state) => state.setColor);
const setTool = useGameStore((state) => state.setTool);

  const colors = ["black", "red", "blue", "green"];

  return (
    <div className="flex gap-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => {
            setColor(color);
            setTool("brush");
          }}
          className="w-6 h-6 rounded-full border"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}