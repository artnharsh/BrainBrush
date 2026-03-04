type Props = {
  latency: number;
};

export default function LatencyIndicator({ latency }: Props) {

  let color = "bg-green-500";

  if (latency > 150) color = "bg-yellow-500";
  if (latency > 250) color = "bg-red-500";

  return (
    <div className="flex items-center gap-2">

      <div className={`w-3 h-3 rounded-full ${color}`} />

      <span className="text-sm">{latency} ms</span>

    </div>
  );
}