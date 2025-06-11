import { RoomManager } from '../services/RoomManager.js';

const roomManager = new RoomManager();

export function setupWebSocketHandlers(io) {
  
  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Criar uma nova sala
    socket.on('room:create', ({ narratorName }, callback) => {
      try {
        if (!narratorName || narratorName.trim().length === 0) {
          throw new Error('Nome do narrador é obrigatório');
        }

        const room = roomManager.createRoom(narratorName.trim(), socket.id);
        
        // Narrador entra na sala
        socket.join(room.id);
        
        console.log(`Sala criada: ${room.id} por ${narratorName}`);
        
        callback({
          success: true,
          room: room.toPublic(),
          playerId: room.narratorId
        });

      } catch (error) {
        console.error('Erro ao criar sala:', error.message);
        callback({
          success: false,
          error: error.message
        });
      }
    });

    // Entrar em uma sala existente
    socket.on('room:join', ({ roomId, playerName }, callback) => {
      try {
        if (!roomId || !playerName || playerName.trim().length === 0) {
          throw new Error('ID da sala e nome do jogador são obrigatórios');
        }

        const room = roomManager.getRoom(roomId.toUpperCase());
        if (!room) {
          throw new Error('Sala não encontrada');
        }

        const player = room.addPlayer(playerName.trim(), socket.id);
        
        // Jogador entra na sala
        socket.join(room.id);
        
        console.log(`${player.name} entrou na sala ${room.id}`);
        
        // Notificar todos na sala sobre o novo jogador
        socket.to(room.id).emit('room:player_joined', {
          player: player.toPublic(),
          room: room.toPublic()
        });

        callback({
          success: true,
          room: room.toPublic(),
          playerId: player.id
        });

      } catch (error) {
        console.error('Erro ao entrar na sala:', error.message);
        callback({
          success: false,
          error: error.message
        });
      }
    });

    // Marcar jogador como pronto
    socket.on('player:ready', ({ ready }, callback) => {
      try {
        const room = roomManager.findRoomByPlayer(socket.id);
        if (!room) {
          throw new Error('Jogador não está em nenhuma sala');
        }

        const player = room.findPlayerBySocket(socket.id);
        if (!player) {
          throw new Error('Jogador não encontrado');
        }

        room.setPlayerReady(player.id, ready);

        console.log(`${player.name} marcado como ${ready ? 'pronto' : 'não pronto'} na sala ${room.id}`);

        // Notificar todos na sala sobre a mudança
        io.to(room.id).emit('room:state_changed', {
          room: room.toPublic()
        });

        callback({
          success: true,
          room: room.toPublic()
        });

      } catch (error) {
        console.error('Erro ao marcar jogador como pronto:', error.message);
        callback({
          success: false,
          error: error.message
        });
      }
    });

    // Iniciar o jogo (apenas narrador)
    socket.on('game:start', (_, callback) => {
      try {
        const room = roomManager.findRoomByPlayer(socket.id);
        if (!room) {
          throw new Error('Sala não encontrada');
        }

        const player = room.findPlayerBySocket(socket.id);
        if (!player) {
          throw new Error('Jogador não encontrado');
        }

        room.startGame(player.id);

        console.log(`Jogo iniciado na sala ${room.id} por ${player.name}`);

        // Notificar todos na sala que o jogo começou
        for (const [playerId, roomPlayer] of room.players.entries()) {
          const socketId = roomPlayer.socketId;
          
          if (roomPlayer.isNarrator) {
            // Narrador vê todos os papéis
            io.to(socketId).emit('game:started', {
              room: room.toNarratorView(),
              yourRole: roomPlayer.role,
              isNarrator: true
            });
          } else {
            // Jogadores veem apenas seu próprio papel
            io.to(socketId).emit('game:started', {
              room: room.toPublic(),
              yourRole: roomPlayer.role,
              isNarrator: false
            });
          }
        }

        callback({
          success: true,
          room: room.toNarratorView()
        });

      } catch (error) {
        console.error('Erro ao iniciar jogo:', error.message);
        callback({
          success: false,
          error: error.message
        });
      }
    });

    // Obter estado atual da sala
    socket.on('room:get_state', (_, callback) => {
      try {
        const room = roomManager.findRoomByPlayer(socket.id);
        if (!room) {
          throw new Error('Jogador não está em nenhuma sala');
        }

        const player = room.findPlayerBySocket(socket.id);
        if (!player) {
          throw new Error('Jogador não encontrado');
        }

        const isNarrator = player.isNarrator;
        const roomData = isNarrator ? room.toNarratorView() : room.toPublic();

        callback({
          success: true,
          room: roomData,
          playerId: player.id,
          yourRole: player.role,
          isNarrator: isNarrator
        });

      } catch (error) {
        console.error('Erro ao obter estado da sala:', error.message);
        callback({
          success: false,
          error: error.message
        });
      }
    });

    // Desconexão do cliente
    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
      
      try {
        const room = roomManager.removePlayerFromAnyRoom(socket.id);
        
        if (room) {
          // Notificar outros jogadores sobre a saída
          socket.to(room.id).emit('room:player_left', {
            room: room.toPublic()
          });
          
          console.log(`Jogador removido da sala ${room.id}`);
        }
      } catch (error) {
        console.error('Erro ao remover jogador:', error.message);
      }
    });

  });

  // Limpeza periódica de salas antigas (a cada 30 minutos)
  setInterval(() => {
    const removedRooms = roomManager.cleanup();
    if (removedRooms > 0) {
      console.log(`Limpeza: ${removedRooms} salas antigas removidas`);
    }
  }, 30 * 60 * 1000);

  console.log('WebSocket handlers configurados');
} 