import { Player } from './Player.js';
import { RoleAssigner } from '../services/RoleAssigner.js';

export class GameRoom {
  static STATES = {
    WAITING: 'waiting',
    READY: 'ready',
    IN_PROGRESS: 'in_progress',
    FINISHED: 'finished'
  };

  constructor(id, narratorName, narratorSocketId) {
    this.id = id;
    this.state = GameRoom.STATES.WAITING;
    this.players = new Map();
    this.createdAt = new Date();
    this.startedAt = null;
    
    // Criar o narrador
    const narratorId = this.generatePlayerId();
    const narrator = new Player(narratorId, narratorName, narratorSocketId);
    narrator.setNarrator(true);
    narrator.setReady(true); // Narrador sempre está pronto
    
    this.players.set(narratorId, narrator);
    this.narratorId = narratorId;
  }

  /**
   * Adiciona um jogador à sala
   * @param {string} name 
   * @param {string} socketId 
   * @returns {Player}
   */
  addPlayer(name, socketId) {
    if (this.state !== GameRoom.STATES.WAITING) {
      throw new Error('Não é possível entrar na sala neste momento');
    }

    if (this.players.size >= 15) {
      throw new Error('Sala lotada (máximo 15 jogadores)');
    }

    // Verificar se o nome já existe e ajustar se necessário
    const uniqueName = this.generateUniqueName(name);
    
    const playerId = this.generatePlayerId();
    const player = new Player(playerId, uniqueName, socketId);
    
    this.players.set(playerId, player);
    return player;
  }

  /**
   * Remove um jogador da sala
   * @param {string} playerId 
   */
  removePlayer(playerId) {
    if (playerId === this.narratorId) {
      throw new Error('O narrador não pode sair da sala');
    }

    this.players.delete(playerId);
    
    // Se não há jogadores suficientes, voltar para waiting
    if (this.players.size < 6 && this.state === GameRoom.STATES.READY) {
      this.state = GameRoom.STATES.WAITING;
    }
  }

  /**
   * Marca um jogador como pronto
   * @param {string} playerId 
   * @param {boolean} ready 
   */
  setPlayerReady(playerId, ready) {
    const player = this.players.get(playerId);
    if (!player) {
      throw new Error('Jogador não encontrado');
    }

    player.setReady(ready);
    this.updateRoomState();
  }

  /**
   * Inicia o jogo (somente o narrador pode fazer isso)
   * @param {string} narratorId 
   */
  startGame(narratorId) {
    if (narratorId !== this.narratorId) {
      throw new Error('Apenas o narrador pode iniciar o jogo');
    }

    if (this.state !== GameRoom.STATES.READY) {
      throw new Error('Não é possível iniciar o jogo neste momento');
    }

    // Distribuir papéis
    const playersList = Array.from(this.players.values());
    const roleAssignments = RoleAssigner.assignRoles(playersList);
    
    // Aplicar papéis aos jogadores
    for (const [playerId, role] of roleAssignments.entries()) {
      const player = this.players.get(playerId);
      if (player) {
        player.setRole(role);
      }
    }

    this.state = GameRoom.STATES.IN_PROGRESS;
    this.startedAt = new Date();
  }

  /**
   * Atualiza o estado da sala baseado nos jogadores
   */
  updateRoomState() {
    if (this.state === GameRoom.STATES.IN_PROGRESS || this.state === GameRoom.STATES.FINISHED) {
      return; // Estados finais, não mudam automaticamente
    }

    const playerCount = this.players.size;
    
    // Verificar se todos os jogadores (exceto narrador) estão prontos
    // O narrador é automaticamente considerado pronto
    const allPlayersReady = Array.from(this.players.values())
      .filter(p => !p.isNarrator) // Excluir narrador da verificação
      .every(p => p.isReady);

    if (playerCount >= 6 && allPlayersReady) {
      this.state = GameRoom.STATES.READY;
    } else {
      this.state = GameRoom.STATES.WAITING;
    }
  }

  /**
   * Gera um nome único para o jogador
   * @param {string} baseName 
   * @returns {string}
   */
  generateUniqueName(baseName) {
    const existingNames = Array.from(this.players.values()).map(p => p.name);
    
    if (!existingNames.includes(baseName)) {
      return baseName;
    }

    let counter = 2;
    let uniqueName = `${baseName} ${counter}`;
    
    while (existingNames.includes(uniqueName)) {
      counter++;
      uniqueName = `${baseName} ${counter}`;
    }
    
    return uniqueName;
  }

  /**
   * Gera um ID único para o jogador
   * @returns {string}
   */
  generatePlayerId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Busca jogador por socket ID
   * @param {string} socketId 
   * @returns {Player|null}
   */
  findPlayerBySocket(socketId) {
    return Array.from(this.players.values()).find(p => p.socketId === socketId);
  }

  /**
   * Retorna informações públicas da sala
   * @returns {Object}
   */
  toPublic() {
    return {
      id: this.id,
      state: this.state,
      playerCount: this.players.size,
      players: Array.from(this.players.values()).map(p => p.toPublic()),
      canStart: this.state === GameRoom.STATES.READY,
      minPlayers: 6,
      maxPlayers: 15
    };
  }

  /**
   * Retorna informações completas para o narrador
   * @returns {Object}
   */
  toNarratorView() {
    return {
      ...this.toPublic(),
      playersWithRoles: Array.from(this.players.values()).map(p => p.toPrivate())
    };
  }
} 