import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types/game';

export function LobbyPage() {
  const { state, setReady, startGame, disconnect } = useGame();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!state.room || !state.playerId) {
    return null;
  }

  const currentPlayer = state.room.players.find(p => p.id === state.playerId);
  const isNarrator = currentPlayer?.isNarrator || false;
  const canStart = state.room.canStart && isNarrator;

  const handleReadyToggle = async () => {
    if (isNarrator) return; // Narrador não precisa marcar como pronto
    
    setLoading(true);
    try {
      const newReadyState = !isReady;
      const response = await setReady(newReadyState);
      if (response.success) {
        setIsReady(newReadyState);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!canStart) return;
    
    setLoading(true);
    try {
      await startGame();
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    disconnect();
  };

  const getPlayerIcon = (player: Player) => {
    if (player.isNarrator) return '👑';
    if (player.isReady) return '✅';
    return '⏳';
  };

  const getPlayerStatus = (player: Player) => {
    if (player.isNarrator) return 'Narrador';
    if (player.isReady) return 'Pronto';
    return 'Aguardando';
  };

  const getRoomStateMessage = () => {
    const { playerCount, minPlayers, maxPlayers } = state.room!;
    
    if (playerCount < minPlayers) {
      return `Aguardando mais ${minPlayers - playerCount} jogador(es) para começar`;
    }
    
    if (state.room!.canStart) {
      return 'Todos prontos! O narrador pode iniciar o jogo';
    }
    
    const notReady = state.room!.players.filter(p => !p.isReady && !p.isNarrator).length;
    return `Aguardando ${notReady} jogador(es) ficarem prontos`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center text-white pt-8">
          <h1 className="text-2xl font-bold mb-2">🌙 Cidade Dorme</h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <p className="text-lg font-mono tracking-widest">{state.room.id}</p>
            <p className="text-sm text-primary-100">Código da Sala</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
          
          {/* Room Status */}
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">
              {state.room.canStart ? '🎮' : '⏳'}
            </div>
            <p className="text-gray-600 text-sm">
              {getRoomStateMessage()}
            </p>
          </div>

          {/* Players List */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-800">
              Jogadores ({state.room.playerCount}/{state.room.maxPlayers})
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {state.room.players.map((player) => (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    player.id === state.playerId 
                      ? 'bg-primary-50 border-primary-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getPlayerIcon(player)}</span>
                    <div>
                      <p className="font-medium text-gray-800">
                        {player.name}
                        {player.id === state.playerId && (
                          <span className="text-primary-600 text-sm ml-1">(você)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{getPlayerStatus(player)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            
            {/* Ready Button (apenas para jogadores) */}
            {!isNarrator && (
              <button
                onClick={handleReadyToggle}
                disabled={loading}
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                  isReady
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                {loading ? 'Atualizando...' : (isReady ? '✅ Pronto' : '⏳ Marcar como Pronto')}
              </button>
            )}

            {/* Narrator Status */}
            {isNarrator && (
              <div className="w-full bg-yellow-100 border border-yellow-300 text-yellow-800 font-semibold py-3 px-6 rounded-lg text-center">
                👑 Você é o Narrador (sempre pronto)
              </div>
            )}

            {/* Start Game Button (apenas para narrador) */}
            {isNarrator && (
              <button
                onClick={handleStartGame}
                disabled={!canStart || loading}
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                  canStart
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Iniciando...' : '🎮 Iniciar Jogo'}
              </button>
            )}

            {/* Leave Room Button */}
            <button
              onClick={handleLeaveRoom}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isNarrator ? '🚪 Encerrar Sala' : '🚪 Sair da Sala'}
            </button>
          </div>

          {/* Game Rules */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Papéis do Jogo:</h4>
            <div className="text-sm text-gray-600 grid grid-cols-2 gap-1">
              <div>• 1 Narrador 👑</div>
              <div>• 1 Assassino 🗡️</div>
              <div>• 1 Curandeiro 💊</div>
              <div>• 1 Detetive 🔍</div>
              <div>• 1 Fofoqueiro 📢</div>
              <div>• Demais: Vítimas 👥</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
} 