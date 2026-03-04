import { useNavigate } from "react-router-dom";

export default function LobbyPage() {
  const navigate = useNavigate();

  const startGame = () => {
    const roomId = "ABC123";
    navigate(`/game/${roomId}`);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">
      <h2 className="text-3xl font-semibold">Lobby</h2>

      <button
        onClick={startGame}
        className="px-6 py-3 bg-green-600 text-white rounded-lg"
      >
        Start Game
      </button>
    </div>
  );
}