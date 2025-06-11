# 🌙 Cidade Dorme - Sorteio de Papéis Online

Um sistema web para sortear e gerenciar os papéis do jogo **Cidade Dorme** (também conhecido como Mafia/Werewolf). Permite que o narrador crie uma sala online e os jogadores entrem para receber seus papéis automaticamente.

## 📱 Características

- **Interface mobile-first** otimizada para smartphones
- **Comunicação em tempo real** via WebSockets
- **6 papéis diferentes**: Narrador, Assassino, Curandeiro, Detetive, Fofoqueiro, Vítimas
- **Salas privadas** com códigos únicos de 4 caracteres
- **6-15 jogadores** por sala
- **Distribuição automática** de papéis seguindo as regras do jogo
- **Visão especial do narrador** para acompanhar todos os papéis

## 🎮 Como Funciona

### Papéis do Jogo
- **1 Narrador** 👑 - Conduz o jogo e conhece todos os papéis
- **1 Assassino** 🗡️ - Elimina jogadores durante a noite
- **1 Curandeiro** 💊 - Pode salvar um jogador por noite
- **1 Detetive** 🔍 - Investiga jogadores para identificar o assassino
- **1 Fofoqueiro** 📢 - Conhece informações sobre outros jogadores
- **Demais Vítimas** 👥 - Devem identificar e eliminar o assassino

### Fluxo do Jogo
1. **Narrador cria uma sala** e compartilha o código
2. **Jogadores entram** na sala com seus nomes
3. **Todos marcam como "pronto"** quando estiverem preparados
4. **Narrador inicia o sorteio** dos papéis
5. **Cada jogador vê seu papel** (apenas o narrador vê todos)

## 🛠️ Tecnologias

### Backend
- **Node.js** + Express.js
- **Socket.IO** para comunicação em tempo real
- **ES Modules** para JavaScript moderno

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** para estilização responsiva
- **Socket.IO Client** para WebSockets
- **Vite** como build tool

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <repository-url>
cd cidade-dorme
```

### 2. Instalar dependências do servidor
```bash
cd server
npm install
```

### 3. Instalar dependências do cliente
```bash
cd ../client
npm install
```

### 4. Executar em desenvolvimento

**Terminal 1 - Servidor:**
```bash
cd server
npm run dev
```
O servidor rodará em `http://localhost:3000`

**Terminal 2 - Cliente:**
```bash
cd client
npm run dev
```
O cliente rodará em `http://localhost:5173`

### 5. Acessar a aplicação
Abra `http://localhost:5173` no navegador ou dispositivo móvel.

## 📦 Build para Produção

### Cliente
```bash
cd client
npm run build
```
Os arquivos serão gerados em `client/dist/`

### Servidor
```bash
cd server
npm start
```

### Variáveis de Ambiente
Crie um arquivo `.env` no servidor (opcional):
```
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=production
```

## 🎯 Como Jogar

### Para o Narrador:
1. Clique em **"Criar Sala (Narrador)"**
2. Digite seu nome e crie a sala
3. Compartilhe o **código da sala** com os jogadores
4. Aguarde todos os jogadores entrarem e ficarem prontos
5. Clique em **"🎮 Iniciar Jogo"**
6. Conduza o jogo vendo todos os papéis na sua tela

### Para os Jogadores:
1. Clique em **"Entrar em Sala"**
2. Digite o **código da sala** e seu **nome**
3. Clique em **"⏳ Marcar como Pronto"**
4. Aguarde o narrador iniciar o jogo
5. Veja seu papel e siga as instruções

## 🏗️ Arquitetura

```
cidade-dorme/
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── models/         # GameRoom, Player
│   │   ├── services/       # RoleAssigner, RoomManager
│   │   ├── websocket/      # Socket.IO handlers
│   │   └── server.js       # Servidor principal
│   └── package.json
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # HomePage, LobbyPage, GamePage
│   │   ├── context/        # GameContext (WebSocket + Estado)
│   │   ├── types/          # Interfaces TypeScript
│   │   └── main.tsx        # Entrada da aplicação
│   └── package.json
└── README.md
```

## 🔧 Funcionalidades Técnicas

### Gerenciamento de Estado
- Context API para estado global
- WebSocket listeners para sincronização em tempo real
- Reconexão automática em caso de queda

### Validações
- Mínimo 6, máximo 15 jogadores
- Nomes únicos (com sufixo numérico automático)
- Estados de sala consistentes
- Prevenção de ações inválidas

### Segurança
- Papéis visíveis apenas para o jogador correspondente
- Narrador tem visão privilegiada
- Códigos de sala únicos
- Validação server-side

### Mobile-First
- Interface otimizada para toque
- Responsivo em diferentes tamanhos de tela
- Prevenção de zoom indesejado no iOS
- Navegação intuitiva

## 🧪 Testes

Para testar localmente com múltiplos jogadores:
1. Abra várias abas/janelas do navegador
2. Use modo anônimo para simular diferentes usuários
3. Teste em diferentes dispositivos na mesma rede

## 📝 API WebSocket

### Eventos do Cliente para Servidor:
- `room:create` - Criar sala
- `room:join` - Entrar na sala  
- `player:ready` - Marcar como pronto
- `game:start` - Iniciar jogo (apenas narrador)
- `room:get_state` - Obter estado atual

### Eventos do Servidor para Cliente:
- `room:player_joined` - Novo jogador entrou
- `room:player_left` - Jogador saiu
- `room:state_changed` - Estado da sala mudou
- `game:started` - Jogo iniciado com papéis

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🎉 Divirta-se!

Agora você tem tudo pronto para jogar **Cidade Dorme** de forma digital! 🌙✨ 