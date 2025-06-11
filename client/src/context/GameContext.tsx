import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, WebSocketResponse, Room, Player } from '../types/game';

interface GameContextType {
  state: GameState;
  createRoom: (narratorName: string) => Promise<WebSocketResponse>;
  joinRoom: (roomId: string, playerName: string) => Promise<WebSocketResponse>;
  setReady: (ready: boolean) => Promise<WebSocketResponse>;
  startGame: () => Promise<WebSocketResponse>;
  disconnect: () => void;
}

type GameAction =
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ROOM'; payload: Room }
  | { type: 'SET_PLAYER_DATA'; payload: { playerId: string; yourRole?: string; isNarrator: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_GAME' };

const initialState: GameState = {
  room: null,
  playerId: null,
  yourRole: null,
  isNarrator: false,
  isConnected: false,
  error: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_ROOM':
      return { ...state, room: action.payload, error: null };
    case 'SET_PLAYER_DATA':
      return {
        ...state,
        playerId: action.payload.playerId,
        yourRole: action.payload.yourRole || state.yourRole,
        isNarrator: action.payload.isNarrator,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_GAME':
      return { ...initialState, isConnected: state.isConnected };
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

let socket: Socket | null = null;

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    // Conectar ao servidor WebSocket
    const serverUrl = import.meta.env.VITE_SERVER_URL || 
      (import.meta.env.PROD ? 'https://citysleeps.netlify.app' : 'http://localhost:3000');
    socket = io(serverUrl);

    socket.on('connect', () => {
      console.log('Conectado ao servidor');
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    socket.on('disconnect', () => {
      console.log('Desconectado do servidor');
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    socket.on('room:player_joined', ({ room }: { room: Room }) => {
      dispatch({ type: 'SET_ROOM', payload: room });
    });

    socket.on('room:player_left', ({ room }: { room: Room }) => {
      dispatch({ type: 'SET_ROOM', payload: room });
    });

    socket.on('room:state_changed', ({ room }: { room: Room }) => {
      dispatch({ type: 'SET_ROOM', payload: room });
    });

    socket.on('game:started', ({ room, yourRole, isNarrator }: {
      room: Room;
      yourRole: string;
      isNarrator: boolean;
    }) => {
      dispatch({ type: 'SET_ROOM', payload: room });
      dispatch({ type: 'SET_PLAYER_DATA', payload: { 
        playerId: state.playerId || '', 
        yourRole, 
        isNarrator 
      } });
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  const createRoom = (narratorName: string): Promise<WebSocketResponse> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: 'Conexão não estabelecida' });
        return;
      }

      socket.emit('room:create', { narratorName }, (response: WebSocketResponse) => {
        if (response.success && response.room && response.playerId) {
          dispatch({ type: 'SET_ROOM', payload: response.room });
          dispatch({ type: 'SET_PLAYER_DATA', payload: { 
            playerId: response.playerId, 
            isNarrator: true 
          } });
        } else {
          dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao criar sala' });
        }
        resolve(response);
      });
    });
  };

  const joinRoom = (roomId: string, playerName: string): Promise<WebSocketResponse> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: 'Conexão não estabelecida' });
        return;
      }

      socket.emit('room:join', { roomId, playerName }, (response: WebSocketResponse) => {
        if (response.success && response.room && response.playerId) {
          dispatch({ type: 'SET_ROOM', payload: response.room });
          dispatch({ type: 'SET_PLAYER_DATA', payload: { 
            playerId: response.playerId, 
            isNarrator: false 
          } });
        } else {
          dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao entrar na sala' });
        }
        resolve(response);
      });
    });
  };

  const setReady = (ready: boolean): Promise<WebSocketResponse> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: 'Conexão não estabelecida' });
        return;
      }

      socket.emit('player:ready', { ready }, (response: WebSocketResponse) => {
        if (!response.success) {
          dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao marcar como pronto' });
        }
        resolve(response);
      });
    });
  };

  const startGame = (): Promise<WebSocketResponse> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: 'Conexão não estabelecida' });
        return;
      }

      socket.emit('game:start', {}, (response: WebSocketResponse) => {
        if (!response.success) {
          dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao iniciar jogo' });
        }
        resolve(response);
      });
    });
  };

  const disconnect = () => {
    socket?.disconnect();
    dispatch({ type: 'CLEAR_GAME' });
  };

  return (
    <GameContext.Provider value={{
      state,
      createRoom,
      joinRoom,
      setReady,
      startGame,
      disconnect,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 