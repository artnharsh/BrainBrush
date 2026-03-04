import PlayerCard from "./PlayerCard";

export default function PlayerList() {

  const players = [
    { id: 1, name: "Player1" },
    { id: 2, name: "Player2" },
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Players</h3>

      <div className="flex flex-col gap-2">
        {players.map((player) => (
          <PlayerCard key={player.id} name={player.name} />
        ))}
      </div>

    </div>
  );
}