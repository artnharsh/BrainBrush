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
  
  const startGameAction = useGameStore((state) => state.startGame);
  const addMessage = useGameStore((state) => state.addMessage);
  const updateScores = useGameStore((state) => state.updateScores);
  const syncGameState = useGameStore((state) => state.syncGameState);
  const updateTimer = useGameStore((state) => state.updateTimer);
  const resetRoom = useGameStore((state) => state.resetRoom); 

  // ========================================================
  // EFFECT 1: STRICTLY FOR CONNECTING / DISCONNECTING
  // This only runs when authentication changes. It will NOT 
  // disconnect you just because someone scored a point.
  // ========================================================
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    connectSocket();

    const onConnect = () => {
      setIsConnected(true);
      const currentUser = useGameStore.getState().user;
    };
    const onDisconnect = () => {
      setIsConnected(false);
      resetRoom(); // Only wipe state on a REAL disconnect
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // Notice we are NOT calling disconnectSocket() here!
    };
  }, [isAuthenticated, resetRoom]);

  useEffect(() => {
    if (isConnected && user) {
      // By using 'as any', we can grab the Google Auth name without TS yelling at us!
      const realName = user.username || (user as any).name || (user as any).email?.split('@')[0] || `Guest-${user.id.slice(-4)}`;
      
      socket.emit("register_name", { id: user.id, username: realName });
    }
  }, [isConnected, user]);


  // ========================================================
  // EFFECT 2: STRICTLY FOR GAME LISTENERS
  // This can re-run safely whenever Zustand state changes 
  // because it only removes listeners, not the actual socket.
  // ========================================================
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const onRoomCreated = ({ roomCode }: { roomCode: string }) => {
      if (user) setRoom(roomCode, [user.id], user.id);
    };

    const onPlayerList = (players: string[]) => {
      const assumedHostId = players[0];
      updatePlayers(players, assumedHostId);
    };

    const onGameStarted = (gameState: any) => {
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

    const onWordChosen = (data: { hiddenWord: string }) => {
      const currentState = useGameStore.getState();
      if (currentState.user?.id !== currentState.currentDrawer) {
        syncGameState({ word: data.hiddenWord });
      }
    };

    const onTimerUpdate = (time: number) => {
      updateTimer(time);
    };

    const onGameOver = (data: any) => {
      console.log("🛑 Game Over:", data);
      useGameStore.getState().syncGameState({ gameStatus: 'podium' });
    };

    const onError = (message: string) => {
      console.error("🔴 Backend Error:", message);
      alert(`Error: ${message}`);
    };

    const onNameDictUpdate = (dict: Record<string, string>) => {
      useGameStore.getState().syncGameState({ playerNames: dict });
    };

    const onCorrectGuessersUpdate = (guessers: string[]) => {
      useGameStore.getState().syncGameState({ correctGuessers: guessers });
    };

    // Attach Listeners
    socket.on("room_created", onRoomCreated);
    socket.on("player_list", onPlayerList);
    socket.on("game_started", onGameStarted);
    socket.on("chat_message", onChatMessage);
    socket.on("score_update", onScoreUpdate);
    socket.on("turn_updated", onTurnUpdated);
    socket.on("word_chosen", onWordChosen);
    socket.on("timer_update", onTimerUpdate);
    socket.on("game_over", onGameOver);
    socket.on("error", onError);
    socket.on("correct_guessers_update", onCorrectGuessersUpdate);
    socket.on("name_dict_update", onNameDictUpdate);

    // Clean up Listeners
    return () => {
      socket.off("room_created", onRoomCreated);
      socket.off("player_list", onPlayerList);
      socket.off("game_started", onGameStarted);
      socket.off("chat_message", onChatMessage);
      socket.off("score_update", onScoreUpdate);
      socket.off("turn_updated", onTurnUpdated);
      socket.off("word_chosen", onWordChosen);
      socket.off("timer_update", onTimerUpdate);
      socket.off("game_over", onGameOver);
      socket.off("error", onError);
      socket.off("correct_guessers_update", onCorrectGuessersUpdate);
      socket.off("name_dict_update", onNameDictUpdate);
      // NO disconnectSocket() HERE!
    };
  }, [
    isAuthenticated, isConnected, user, setRoom, updatePlayers, 
    startGameAction, addMessage, updateScores, syncGameState, updateTimer, resetRoom
  ]);

  return { socket, isConnected };
};