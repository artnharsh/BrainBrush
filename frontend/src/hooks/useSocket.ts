import { useEffect, useState } from "react";
import { connectSocket } from "../services/socketService";
import { Socket } from "socket.io-client";

export default function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = connectSocket();

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
}
