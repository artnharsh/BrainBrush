import LatencyIndicator from "../latency/LatencyIndicator";

type Props = {
  name: string;
};

export default function PlayerCard({ name }: Props) {
  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <span>{name}</span>

      <LatencyIndicator />
    </div>
  );
}
