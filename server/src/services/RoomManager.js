import { GameRoom } from '../models/GameRoom.js';

export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  /**
   * Cria uma nova sala
   * @param {string} narratorName 
   * @param {string} narratorSocketId 
   * @returns {GameRoom}
   */
  createRoom(narratorName, narratorSocketId) {
    const roomId = this.generateRoomId();
    const room = new GameRoom(roomId, narratorName, narratorSocketId);
    
    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * Busca uma sala pelo ID
   * @param {string} roomId 
   * @returns {GameRoom|null}
   */
  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Remove uma sala
   * @param {string} roomId 
   */
  removeRoom(roomId) {
    this.rooms.delete(roomId);
  }

  /**
   * Busca uma sala que contém um jogador específico
   * @param {string} socketId 
   * @returns {GameRoom|null}
   */
  findRoomByPlayer(socketId) {
    for (const room of this.rooms.values()) {
      if (room.findPlayerBySocket(socketId)) {
        return room;
      }
    }
    return null;
  }

  /**
   * Remove um jogador de qualquer sala que ele esteja
   * @param {string} socketId 
   * @returns {GameRoom|null} Sala da qual o jogador foi removido
   */
  removePlayerFromAnyRoom(socketId) {
    const room = this.findRoomByPlayer(socketId);
    if (!room) {
      return null;
    }

    const player = room.findPlayerBySocket(socketId);
    if (player) {
      try {
        room.removePlayer(player.id);
        
        // Se a sala ficou vazia (apenas narrador), remove a sala
        if (room.players.size <= 1) {
          this.removeRoom(room.id);
        }
      } catch (error) {
        // Se for o narrador tentando sair, remove a sala inteira
        if (error.message.includes('narrador não pode sair')) {
          this.removeRoom(room.id);
        }
      }
    }

    return room;
  }

  /**
   * Gera um ID único para a sala (4 caracteres)
   * @returns {string}
   */
  generateRoomId() {
    let roomId;
    do {
      roomId = Math.random().toString(36).substr(2, 4).toUpperCase();
    } while (this.rooms.has(roomId));
    
    return roomId;
  }

  /**
   * Retorna estatísticas das salas
   * @returns {Object}
   */
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalPlayers: Array.from(this.rooms.values()).reduce((sum, room) => sum + room.players.size, 0),
      roomsByState: this.getRoomsByState()
    };
  }

  /**
   * Agrupa salas por estado
   * @returns {Object}
   */
  getRoomsByState() {
    const stats = {};
    
    for (const room of this.rooms.values()) {
      stats[room.state] = (stats[room.state] || 0) + 1;
    }
    
    return stats;
  }

  /**
   * Remove salas vazias ou muito antigas (limpeza)
   */
  cleanup() {
    const now = new Date();
    const roomsToRemove = [];

    for (const [roomId, room] of this.rooms.entries()) {
      // Remover salas com apenas 1 jogador (narrador) e mais de 1 hora de inatividade
      const hoursSinceCreated = (now - room.createdAt) / (1000 * 60 * 60);
      
      if (room.players.size <= 1 && hoursSinceCreated > 1) {
        roomsToRemove.push(roomId);
      }
    }

    roomsToRemove.forEach(roomId => {
      this.removeRoom(roomId);
    });

    return roomsToRemove.length;
  }
} 