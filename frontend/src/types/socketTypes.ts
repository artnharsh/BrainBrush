// Socket event types - data coming from backend over WebSockets

// ==========================================
// GAME STATE (Mirror from backend)
// ==========================================
export interface GameState {
  roomCode: string;
  players: string[];
  currentPlayerIndex: number;
  currentRound: number;
  totalRounds: number;
  drawer: string;
  word: string;
  wordChoices: string[];
  timer: number;
  scores: Record<string, number>;
}

// ==========================================
// USER TYPES
// ==========================================
export interface User {
  id: string;
  email?: string;
  username?: string;
  name?: string;
}

// ==========================================
// GAME EVENT TYPES
// ==========================================
export interface GameStartedEvent extends GameState {}

export interface ChatMessage {
  sender: string;
  text: string;
  type: 'normal' | 'success' | 'error';
}

// ==========================================
// SOCKET EVENT PAYLOADS - ROOM OPERATIONS
// ==========================================
export interface RoomCreatedEvent {
  roomCode: string;
}

export interface PlayerListEvent {
  players: string[];
}

// ==========================================
// SOCKET EVENT PAYLOADS - GAME OPERATIONS
// ==========================================
export interface WordChosenEvent {
  hiddenWord: string;
}

export interface ScoreUpdateEvent {
  [userId: string]: number;
}

export interface CorrectGuessersUpdateEvent {
  guessers: string[];
}

export interface TurnUpdatedEvent extends GameState {}

export interface GameOverEvent {
  reason?: string;
}

// ==========================================
// SOCKET EVENT PAYLOADS - DRAWING OPERATIONS
// ==========================================
export interface CanvasSegment {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  lineWidth: number;
}

export interface DrawLineEvent {
  segment: CanvasSegment;
}

export interface EraseStrokeEvent {
  strokeId: string;
}

export interface SendCanvasSnapshotEvent {
  targetSocketId: string;
}

export interface ReceiveCanvasSnapshotEvent {
  segments: CanvasSegment[];
}

// ==========================================
// SOCKET EVENT PAYLOADS - NAME MANAGEMENT
// ==========================================
export interface NameDictUpdateEvent {
  [userId: string]: string;
}

// ==========================================
// SOCKET EVENT PAYLOADS - ERROR HANDLING
// ==========================================
export interface SocketErrorEvent {
  message: string;
}
