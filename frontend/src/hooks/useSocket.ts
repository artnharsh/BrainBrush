import { useEffect, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "../socketClient";
import { useGameStore } from "../store/useGameStore";
import type {
  GameStartedEvent,
  ChatMessage,
  ScoreUpdateEvent,
  TurnUpdatedEvent,
  WordChosenEvent,
  NameDictUpdateEvent,
  CorrectGuessersUpdateEvent,
  SocketErrorEvent
} from "../types/socketTypes";

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

  // EFFECT 1: STRICTLY FOR CONNECTING / DISCONNECTING
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    connectSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => {
      setIsConnected(false);
      resetRoom(); // Only wipe state on a REAL disconnect
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [isAuthenticated, resetRoom]);

  // EFFECT 2: REGISTER NAME WHEN CONNECTED
  useEffect(() => {
    if (isConnected && user) {
      // Fix 1: removed user.name and user.email — not on User type
      const realName =
        user.username ||
        `Guest-${user.id.slice(-4)}`;

      socket.emit("register_name", { id: user.id, username: realName });
    }
  }, [isConnected, user]);

  // EFFECT 3: STRICTLY FOR GAME LISTENERS
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    const onRoomCreated = ({ roomCode }: { roomCode: string }): void => {
      if (user) setRoom(roomCode, [user.id], user.id);
    };

    const onPlayerList = (players: string[]): void => {
      const assumedHostId = players[0];
      updatePlayers(players, assumedHostId);
    };

    const onGameStarted = (gameState: GameStartedEvent): void => {
      startGameAction(gameState);
    };

    // Fix 2: map socketTypes ChatMessage to store ChatMessage, converting "error" -> "system"
    const onChatMessage = (message: ChatMessage): void => {
      addMessage({
        ...message,
        type: message.type === "error" ? "system" : message.type,
      });
    };

    const onScoreUpdate = (scores: ScoreUpdateEvent): void => {
      updateScores(scores);
    };

    const onTurnUpdated = (game: TurnUpdatedEvent): void => {
      syncGameState(game);
    };

    const onWordChosen = (data: WordChosenEvent): void => {
      const currentState = useGameStore.getState();
      if (currentState.user?.id !== currentState.currentDrawer) {
        syncGameState({ word: data.hiddenWord });
      }
    };

    const onTimerUpdate = (time: number): void => {
      updateTimer(time);
    };

    // Fix 3: removed unused `data` parameter
    const onGameOver = (): void => {
      useGameStore.getState().syncGameState({ gameStatus: 'podium' });
    };

    const onError = (message: SocketErrorEvent): void => {
      console.error("Backend Error:", message);
      alert(`Error: ${message.message}`);
    };

    const onNameDictUpdate = (dict: NameDictUpdateEvent): void => {
      useGameStore.getState().syncGameState({ playerNames: dict });
    };

    const onCorrectGuessersUpdate = (data: CorrectGuessersUpdateEvent): void => {
      useGameStore.getState().syncGameState({ correctGuessers: data.guessers });
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
    };
  }, [
    isAuthenticated, isConnected, user, setRoom, updatePlayers,
    startGameAction, addMessage, updateScores, syncGameState, updateTimer, resetRoom
  ]);

  return { socket, isConnected };
};