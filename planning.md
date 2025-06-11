# Planejamento Arquitetural - Site Cidade Dorme

## Fase 1 - Análise de Requisitos ✅

### Requisitos Funcionais Explícitos

1. **Gestão de Papéis**
   - 6 tipos de papéis: Narrador, Assassino, Curandeiro, Detetive, Fofoqueiro, Vítima
   - Regras de quantidade: 1 narrador, 1 assassino, 1 curandeiro, 1 detetive, 1 fofoqueiro, demais são vítimas

2. **Gestão de Salas**
   - Narrador cria uma sala de jogo
   - Outros jogadores acessam a mesma sala
   - Identificação por nome dos jogadores

3. **Sistema de Sorteio**
   - Narrador inicia o sorteio quando todos estão prontos
   - Distribuição automática dos papéis conforme regras

4. **Visualização de Papéis**
   - Cada jogador vê apenas seu próprio papel
   - Narrador vê todos os papéis de todos os jogadores

5. **Comunicação em Tempo Real**
   - Sistema baseado em sockets para sincronização
   - Interface web responsiva para dispositivos móveis

### Requisitos Funcionais Implícitos

1. **Estados da Sala**
   - Aguardando jogadores
   - Pronto para sorteio
   - Jogo em andamento
   - Jogo finalizado

2. **Validações**
   - Mínimo: 6 jogadores, Máximo: 15 jogadores
   - Nomes únicos dentro da sala (com sufixo numérico se duplicado)

3. **Persistência de Sessão**
   - Salas persistem indefinidamente
   - Reconexão automática se jogador sair e voltar

### Requisitos Não-Funcionais

1. **Performance**
   - Resposta em tempo real via WebSockets
   - Suporte a múltiplas salas simultâneas

2. **Usabilidade**
   - Interface otimizada para dispositivos móveis
   - UX intuitiva para jogadores casuais

3. **Escalabilidade**
   - Múltiplas salas simultâneas
   - Gestão eficiente de conexões WebSocket

4. **Segurança**
   - Códigos únicos de sala
   - Prevenção de acesso não autorizado aos papéis

5. **Manutenibilidade**
   - Código limpo e bem estruturado
   - Fácil adição de novos papéis no futuro

## Fase 2 - Contexto do Sistema

### Stack Tecnológico Escolhido

**Backend:**
- Node.js + Express.js
- Socket.IO para WebSockets
- Armazenamento em memória (Redis opcional para produção)

**Frontend:**
- React.js com TypeScript
- Socket.IO Client
- Tailwind CSS para responsividade mobile
- Vite como build tool

**Justificativa:**
- Socket.IO oferece fallbacks automáticos e melhor experiência em tempo real
- React + TypeScript para manutenibilidade e type safety
- Tailwind para desenvolvimento rápido de UI responsiva

### Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile/Web    │    │   Web Server    │    │   Game Engine   │
│     Client      │◄──►│  (Express +     │◄──►│   (Memory)      │
│  (React + WS)   │    │   Socket.IO)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Fase 3 - Componentes Principais

### 1. Game Engine (Backend)
- **GameRoom**: Gerencia estado da sala
- **Player**: Representa jogador na sala
- **RoleAssigner**: Lógica de sorteio de papéis
- **RoomManager**: Coordena múltiplas salas

### 2. API WebSocket (Backend)
- `room:create` - Criar nova sala
- `room:join` - Entrar na sala
- `room:ready` - Marcar jogador como pronto
- `game:start` - Iniciar sorteio (apenas narrador)
- `game:state` - Sincronizar estado

### 3. Frontend Components
- **HomePage**: Criar/entrar sala
- **LobbyPage**: Lista jogadores, botão "pronto"
- **GamePage**: Exibir papel do jogador
- **NarratorView**: Visão especial do narrador

### 4. State Management
- Context API para estado global
- WebSocket listeners para sincronização
- Persistent storage para reconexão

## Fase 4 - Implementação

### Estrutura de Diretórios
```
cidade-dorme/
├── server/
│   ├── src/
│   │   ├── models/
│   │   ├── services/
│   │   ├── websocket/
│   │   └── server.js
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── main.tsx
│   └── package.json
└── README.md
```

### Tarefas de Implementação

#### Backend (server/)
1. ✅ Setup inicial Express + Socket.IO
2. ✅ Modelo GameRoom com estados
3. ✅ Modelo Player e validações
4. ✅ RoleAssigner com lógica de sorteio
5. ✅ RoomManager para múltiplas salas
6. ✅ WebSocket handlers principais
7. ✅ Validações e tratamento de erros

#### Frontend (client/)
1. ✅ Setup React + Vite + TypeScript
2. ✅ Configuração Tailwind CSS
3. ✅ Context para WebSocket + Estado global
4. ✅ HomePage (criar/entrar sala)
5. ✅ LobbyPage (aguardar jogadores)
6. ✅ GamePage (exibir papéis)
7. ✅ NarratorView (visão completa)
8. ✅ Responsividade mobile

### Confidence: 95%

### Próximos Passos
- Implementar backend primeiro
- Implementar frontend
- Testes básicos de integração
- README com instruções 