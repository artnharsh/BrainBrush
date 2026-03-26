// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "../socketClient";
import { useGameStore } from "../store/useGameStore";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);
  const user = useGameStore((state) => state.user);
  const setRoom = useGameStore((state) => state.setRoom);
  const updatePlayers = useGameStore((state) => state.updatePlayers);

  useEffect(() => {
    if (!isAuthenticated) return;

    connectSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    // --- ALIGNMENT: Catching your backend's exact events ---
    
    const onRoomCreated = ({ roomCode }: { roomCode: string }) => {
      console.log("🏠 Room Created:", roomCode);
      // If I created it, I am the host!
      if (user) {
        setRoom(roomCode, [user.id], user.id);
      }
    };

    const onPlayerList = (players: string[]) => {
      console.log("👥 Players updated:", players);
      // Your backend sends the array of player IDs. 
      // The first person in the Redis array is usually the host!
      const assumedHostId = players[0]; 
      updatePlayers(players, assumedHostId);
    };

    const onError = (message: string) => {
      console.error("🔴 Backend Error:", message);
      alert(`Error: ${message}`); // Simple alert for now, we can make it a nice Toast later
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_created", onRoomCreated);
    socket.on("player_list", onPlayerList);
    socket.on("error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_created", onRoomCreated);
      socket.off("player_list", onPlayerList);
      socket.off("error", onError);
      disconnectSocket();
    };
  }, [isAuthenticated, user, setRoom, updatePlayers]);

  return { socket, isConnected };
};