import useCanvas from "../../hooks/useCanvas";

type Props = {
  canvas: ReturnType<typeof useCanvas>;
};

export default function ClearCanvas({canvas}: Props) {
  const { clearCanvas } = canvas;

  return (
    <button onClick={clearCanvas} className="px-4 py-2 border rounded">
      Clear
    </button>
  );
}
