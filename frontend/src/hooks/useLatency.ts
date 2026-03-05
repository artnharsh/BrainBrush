import { useEffect, useState } from "react";

export default function useLatency() {
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    const measureLatency = async () => {
      const start = Date.now();

      await fetch("http://localhost:3000/ping");

      const end = Date.now();

      setLatency(end - start);
    };

    const interval = setInterval(measureLatency, 3000);

    return () => clearInterval(interval);
  }, []);

  return latency;
}
