export interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isNarrator: boolean;
  hasRole: boolean;
  role?: string;
}

export interface Room {
  id: string;
  state: 'waiting' | 'ready' | 'in_progress' | 'finished';
  playerCount: number;
  players: Player[];
  canStart: boolean;
  minPlayers: number;
  maxPlayers: number;
  playersWithRoles?: Player[];
}

export interface GameState {
  room: Room | null;
  playerId: string | null;
  yourRole: string | null;
  isNarrator: boolean;
  isConnected: boolean;
  error: string | null;
}

export interface WebSocketResponse {
  success: boolean;
  error?: string;
  room?: Room;
  playerId?: string;
  yourRole?: string;
  isNarrator?: boolean;
}

export const ROLES = {
  NARRADOR: 'Narrador',
  ASSASSINO: 'Assassino',
  CURANDEIRO: 'Curandeiro',
  DETETIVE: 'Detetive',
  FOFOQUEIRO: 'Fofoqueiro',
  VITIMA: 'Vítima'
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES]; 