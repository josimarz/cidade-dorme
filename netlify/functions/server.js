import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import serverless from 'serverless-http';

// Importar os handlers (vamos precisar copiar os arquivos)
import { GameRoom } from './models/GameRoom.js';
import { Player } from './models/Player.js';
import { RoleAssigner } from './services/RoleAssigner.js';
import { RoomManager } from './services/RoomManager.js';

const app = express();
const server = createServer(app);

// Configurar CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "https://citysleeps.netlify.app",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://citysleeps.netlify.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Room manager global
const roomManager = new RoomManager();

// Configurar handlers WebSocket
io.on('connection', (socket) => {
  console.log('🔌 Novo cliente conectado:', socket.id);

  // Criar sala
  socket.on('room:create', ({ playerName }) => {
    try {
      const room = roomManager.createRoom();
      const narrator = new Player(socket.id, playerName, true);
      room.addPlayer(narrator);
      
      socket.join(room.code);
      socket.emit('room:created', {
        roomCode: room.code,
        player: narrator.toJSON(),
        room: room.toJSON()
      });
      
      console.log(`🏠 Sala ${room.code} criada por ${playerName}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Entrar na sala
  socket.on('room:join', ({ roomCode, playerName }) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        throw new Error('Sala não encontrada');
      }

      const player = new Player(socket.id, playerName, false);
      room.addPlayer(player);
      
      socket.join(roomCode);
      
      // Notificar todos na sala
      io.to(roomCode).emit('room:player_joined', {
        player: player.toJSON(),
        room: room.toJSON()
      });
      
      socket.emit('room:joined', {
        player: player.toJSON(),
        room: room.toJSON()
      });
      
      console.log(`👤 ${playerName} entrou na sala ${roomCode}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Marcar como pronto
  socket.on('player:ready', ({ roomCode }) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        throw new Error('Sala não encontrada');
      }

      const player = room.getPlayer(socket.id);
      if (!player) {
        throw new Error('Jogador não encontrado');
      }

      player.setReady(true);
      
      io.to(roomCode).emit('room:state_changed', {
        room: room.toJSON()
      });
      
      console.log(`✅ ${player.name} está pronto na sala ${roomCode}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Iniciar jogo
  socket.on('game:start', ({ roomCode }) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        throw new Error('Sala não encontrada');
      }

      const narrator = room.getPlayer(socket.id);
      if (!narrator || !narrator.isNarrator) {
        throw new Error('Apenas o narrador pode iniciar o jogo');
      }

      if (!room.canStartGame()) {
        throw new Error('Nem todos os jogadores estão prontos');
      }

      // Sortear papéis
      const roleAssigner = new RoleAssigner();
      const assignments = roleAssigner.assignRoles(room.players);
      
      // Atualizar jogadores com seus papéis
      assignments.forEach(assignment => {
        const player = room.getPlayer(assignment.playerId);
        if (player) {
          player.setRole(assignment.role);
        }
      });

      room.startGame();
      
      // Enviar papéis para cada jogador
      room.players.forEach(player => {
        if (player.isNarrator) {
          // Narrador vê todos os papéis
          io.to(player.socketId).emit('game:started', {
            yourRole: player.role,
            allRoles: room.players.map(p => ({
              name: p.name,
              role: p.role
            })),
            room: room.toJSON()
          });
        } else {
          // Jogadores veem apenas seu papel
          io.to(player.socketId).emit('game:started', {
            yourRole: player.role,
            room: room.toJSON()
          });
        }
      });
      
      console.log(`🎮 Jogo iniciado na sala ${roomCode}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Obter estado da sala
  socket.on('room:get_state', ({ roomCode }) => {
    try {
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        throw new Error('Sala não encontrada');
      }

      const player = room.getPlayer(socket.id);
      if (!player) {
        throw new Error('Jogador não encontrado');
      }

      socket.emit('room:state_update', {
        player: player.toJSON(),
        room: room.toJSON()
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Desconexão
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
    
    // Remover jogador de todas as salas
    roomManager.removePlayerFromAllRooms(socket.id);
  });
});

// Rota de healthcheck
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota para informações da API
app.get('/api', (req, res) => {
  res.json({
    message: 'Cidade Dorme API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      websocket: 'ws://localhost:3000'
    }
  });
});

export const handler = serverless(app); 