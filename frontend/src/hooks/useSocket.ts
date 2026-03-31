// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "../socketClient";
import { useGameStore } from "../store/useGameStore";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  // ==========================================
  // 1. ZUSTAND STATE & ACTIONS
  // 🚨 ALL hooks MUST be inside this block!
  // ==========================================
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);
  const user = useGameStore((state) => state.user);
  const setRoom = useGameStore((state) => state.setRoom);
  const updatePlayers = useGameStore((state) => state.updatePlayers);
  
  const startGameAction = useGameStore((state) => state.startGame);
  const addMessage = useGameStore((state) => state.addMessage);
  const updateScores = useGameStore((state) => state.updateScores);
  const syncGameState = useGameStore((state) => state.syncGameState);

  // ==========================================
  // 2. SOCKET LISTENERS & LIFECYCLE
  // ==========================================
  useEffect(() => {
    // Don't connect if the user isn't logged in
    if (!isAuthenticated) return;

    connectSocket();

    // --- A. Connection Events ---
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // --- B. Lobby Events ---
    const onRoomCreated = ({ roomCode }: { roomCode: string }) => {
      console.log("🏠 Room Created:", roomCode);
      if (user) {
        setRoom(roomCode, [user.id], user.id);
      }
    };

    const onPlayerList = (players: string[]) => {
      console.log("👥 Players updated:", players);
      const assumedHostId = players[0];
      updatePlayers(players, assumedHostId);
    };

    // --- C. Game Events ---
    const onGameStarted = (gameState: any) => {
      console.log("🎮 Game Started!", gameState);
      startGameAction(gameState);
    };

    const onChatMessage = (message: any) => {
      addMessage(message);
    };

    const onScoreUpdate = (scores: any) => {
      updateScores(scores);
    };

    const onTurnUpdated = (game: any) => {
      syncGameState(game);
    };

    // --- D. Error Handling ---
    const onError = (message: string) => {
      console.error("🔴 Backend Error:", message);
      alert(`Error: ${message}`);
    };

    // ==========================================
    // 3. ATTACH LISTENERS
    // ==========================================
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_created", onRoomCreated);
    socket.on("player_list", onPlayerList);
    socket.on("game_started", onGameStarted);
    socket.on("chat_message", onChatMessage);
    socket.on("score_update", onScoreUpdate);
    socket.on("turn_updated", onTurnUpdated);
    socket.on("error", onError);

    // ==========================================
    // 4. CLEANUP (PREVENT MEMORY LEAKS)
    // ==========================================
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_created", onRoomCreated);
      socket.off("player_list", onPlayerList);
      socket.off("game_started", onGameStarted);
      socket.off("chat_message", onChatMessage);
      socket.off("score_update", onScoreUpdate);
      socket.off("turn_updated", onTurnUpdated);
      socket.off("error", onError);
      
      disconnectSocket();
    };
  }, [
    // React strictly requires all external variables used inside useEffect to be in this array
    isAuthenticated, user, setRoom, updatePlayers, 
    startGameAction, addMessage, updateScores, syncGameState
  ]);

  return { socket, isConnected };
};