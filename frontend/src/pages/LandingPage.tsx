import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate("/lobby");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold">SketchArena</h1>

      <button
        onClick={handleCreateRoom}
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        Create Room
      </button>
    </div>
  );
}