// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "../socketClient";
import { useGameStore } from "../store/useGameStore";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  // 1. Use your new properties!
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);
  const syncGameState = useGameStore((state) => state.syncGameState);

  useEffect(() => {
    // 2. Only connect if your store says we are authenticated
    if (!isAuthenticated) return;

    connectSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = (error: Error) => setIsConnected(false);
    
    // 3. Use your new master sync function
    const onSyncState = (fullGameState: any) => syncGameState(fullGameState);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("sync_state", onSyncState);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("sync_state", onSyncState);
      disconnectSocket();
    };
  }, [isAuthenticated, syncGameState]);

  return { socket, isConnected };
};