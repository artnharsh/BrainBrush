import { create } from "zustand";

type Tool = "brush" | "eraser";

type GameState = {
  color: string;
  brushSize: number;
  tool: Tool;

  setColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setTool: (tool: Tool) => void;
};

export const useGameStore = create<GameState>((set) => ({
  color: "#000000",
  brushSize: 5,
  tool: "brush",

  setColor: (color) => set({ color }),
  setBrushSize: (size) => set({ brushSize: size }),
  setTool: (tool) => set({ tool }),
}));