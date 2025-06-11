import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, WebSocketResponse, Room } from '../types/game';

interface GameContextType {
  state: GameState;
  createRoom: (narratorName: string) => Promise<WebSocketResponse>;
  joinRoom: (roomId: string, playerName: string) => Promise<WebSocketResponse>;
  setReady: (ready: boolean) => Promise<WebSocketResponse>;
  startGame: () => Promise<WebSocketResponse>;
  pollRoomState: () => void;
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

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const baseURL = import.meta.env.VITE_SERVER_URL || 
    (import.meta.env.PROD ? 'https://citysleeps.netlify.app/.netlify/functions' : 'http://localhost:3000');

  // Polling para atualizar estado da sala
  useEffect(() => {
    let intervalId: number;
    
    if (state.room && state.playerId) {
      intervalId = setInterval(() => {
        pollRoomState();
      }, 2000); // Poll a cada 2 segundos
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.room, state.playerId]);

  useEffect(() => {
    // Simular conexão sempre ativa para HTTP
    dispatch({ type: 'SET_CONNECTED', payload: true });
  }, []);

  const apiCall = async (endpoint: string, data: any = {}): Promise<WebSocketResponse> => {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão'
      };
    }
  };

  const createRoom = async (narratorName: string): Promise<WebSocketResponse> => {
    const response = await apiCall('/room/create', { narratorName });
    
    if (response.success && response.room && response.playerId) {
      dispatch({ type: 'SET_ROOM', payload: response.room });
      dispatch({ type: 'SET_PLAYER_DATA', payload: { 
        playerId: response.playerId, 
        isNarrator: true 
      } });
    } else {
      dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao criar sala' });
    }
    
    return response;
  };

  const joinRoom = async (roomId: string, playerName: string): Promise<WebSocketResponse> => {
    const response = await apiCall('/room/join', { roomId, playerName });
    
    if (response.success && response.room && response.playerId) {
      dispatch({ type: 'SET_ROOM', payload: response.room });
      dispatch({ type: 'SET_PLAYER_DATA', payload: { 
        playerId: response.playerId, 
        isNarrator: false 
      } });
    } else {
      dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao entrar na sala' });
    }
    
    return response;
  };

  const setReady = async (ready: boolean): Promise<WebSocketResponse> => {
    if (!state.room || !state.playerId) {
      return { success: false, error: 'Dados da sala não encontrados' };
    }

    const response = await apiCall('/player/ready', { 
      roomId: state.room.id, 
      playerId: state.playerId,
      ready 
    });
    
    if (!response.success) {
      dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao marcar como pronto' });
    }
    
    return response;
  };

  const startGame = async (): Promise<WebSocketResponse> => {
    if (!state.room || !state.playerId) {
      return { success: false, error: 'Dados da sala não encontrados' };
    }

    const response = await apiCall('/game/start', { 
      roomId: state.room.id, 
      playerId: state.playerId 
    });
    
    if (response.success && response.yourRole) {
      dispatch({ type: 'SET_PLAYER_DATA', payload: { 
        playerId: state.playerId, 
        yourRole: response.yourRole,
        isNarrator: state.isNarrator
      } });
    } else {
      dispatch({ type: 'SET_ERROR', payload: response.error || 'Erro ao iniciar jogo' });
    }
    
    return response;
  };

  const pollRoomState = async () => {
    if (!state.room || !state.playerId) return;

    const response = await apiCall('/room/state', { 
      roomId: state.room.id, 
      playerId: state.playerId 
    });
    
    if (response.success && response.room) {
      dispatch({ type: 'SET_ROOM', payload: response.room });
      
      if (response.yourRole && response.yourRole !== state.yourRole) {
        dispatch({ type: 'SET_PLAYER_DATA', payload: { 
          playerId: state.playerId, 
          yourRole: response.yourRole,
          isNarrator: state.isNarrator
        } });
      }
    }
  };

  const disconnect = () => {
    dispatch({ type: 'CLEAR_GAME' });
  };

  return (
    <GameContext.Provider value={{
      state,
      createRoom,
      joinRoom,
      setReady,
      startGame,
      pollRoomState,
      disconnect,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 