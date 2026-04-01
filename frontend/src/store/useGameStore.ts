// src/store/useGameStore.ts
import { create } from 'zustand';

// --- TYPES ---
export interface User {
  id: string;
  username: string;
}

export interface ChatMessage {
  sender: string;
  text: string;
  type: 'normal' | 'success' | 'system';
}

interface GameState {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;

  // Room State
  roomCode: string | null;
  players: string[];
  hostId: string | null;

  // Active Game State
  gameStatus: 'lobby' | 'playing' | 'finished';
  currentDrawer: string | null;
  word: string | null;
  wordChoices: string[];
  timer: number;
  scores: Record<string, number>;
  messages: ChatMessage[];
  currentRound: number;
  totalRounds: number;

  // --- ACTIONS ---
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  
  setRoom: (roomCode: string, players: string[], hostId: string) => void;
  updatePlayers: (players: string[], hostId?: string) => void;
  
  startGame: (gameState: Partial<GameState>) => void;
  updateTimer: (time: number) => void;
  addMessage: (msg: ChatMessage) => void;
  updateScores: (scores: Record<string, number>) => void;
  
  syncGameState: (fullState: Partial<GameState>) => void;
  resetRoom: () => void;
}

// --- STORE IMPLEMENTATION ---
export const useGameStore = create<GameState>((set) => ({
  user: null,
  isAuthenticated: false,
  roomCode: null,
  players: [],
  hostId: null,
  gameStatus: 'lobby',
  currentDrawer: null,
  word: null,
  wordChoices: [],
  timer: 60,
  scores: {},
  messages: [],
  currentRound: 0,
  totalRounds: 3,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, roomCode: null, gameStatus: 'lobby' });
  },

  setRoom: (roomCode, players, hostId) => 
    set({ roomCode, players, hostId, gameStatus: 'lobby' }),

  updatePlayers: (players, hostId) => 
    set((state) => ({ players, hostId: hostId || state.hostId })),

  // 🚨 THE FIX: Map backend's 'drawer' to frontend's 'currentDrawer'
  startGame: (gameState) => 
    set({ 
      ...gameState, 
      currentDrawer: (gameState as any).drawer || gameState.currentDrawer,
      wordChoices: (gameState as any).wordChoices || [], 
      gameStatus: 'playing', 
      messages: [] 
    }),

  updateTimer: (timer) => set({ timer }),

  addMessage: (msg) => 
    set((state) => ({ messages: [...state.messages, msg] })),

  updateScores: (scores) => set({ scores }),

  // 🚨 THE FIX: Map it here too so mid-game turn changes work!
  syncGameState: (fullState) => set((state) => ({ 
    ...state, 
    ...fullState,
    currentDrawer: (fullState as any).drawer || fullState.currentDrawer || state.currentDrawer
  })),

  resetRoom: () => set({ 
    roomCode: null,     
    players: [],        
    hostId: null,       
    gameStatus: 'lobby', 
    currentDrawer: null, 
    word: null, 
    timer: 60, 
    messages: [] 
  }),
}));