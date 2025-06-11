import React from 'react';
import { useGame } from '../context/GameContext';
import { ROLES, RoleType } from '../types/game';

export function GamePage() {
  const { state, disconnect } = useGame();

  if (!state.room || !state.yourRole) {
    return null;
  }

  const isNarrator = state.isNarrator;
  const yourRole = state.yourRole as RoleType;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case ROLES.NARRADOR: return '👑';
      case ROLES.ASSASSINO: return '🗡️';
      case ROLES.CURANDEIRO: return '💊';
      case ROLES.DETETIVE: return '🔍';
      case ROLES.FOFOQUEIRO: return '📢';
      case ROLES.VITIMA: return '👥';
      default: return '❓';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case ROLES.NARRADOR: return 'from-yellow-400 to-yellow-600';
      case ROLES.ASSASSINO: return 'from-red-500 to-red-700';
      case ROLES.CURANDEIRO: return 'from-green-400 to-green-600';
      case ROLES.DETETIVE: return 'from-blue-400 to-blue-600';
      case ROLES.FOFOQUEIRO: return 'from-purple-400 to-purple-600';
      case ROLES.VITIMA: return 'from-gray-400 to-gray-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case ROLES.NARRADOR:
        return 'Você conduz o jogo e conhece todos os papéis. Mantenha o equilíbrio e a diversão!';
      case ROLES.ASSASSINO:
        return 'Você deve eliminar os outros jogadores durante a noite. Mantenha sua identidade em segredo!';
      case ROLES.CURANDEIRO:
        return 'Você pode salvar uma pessoa por noite (inclusive você mesmo). Use seu poder com sabedoria!';
      case ROLES.DETETIVE:
        return 'Você pode investigar um jogador por noite para descobrir se é o assassino ou não.';
      case ROLES.FOFOQUEIRO:
        return 'Você conhece dois outros jogadores e seus papéis. Use essa informação estrategicamente!';
      case ROLES.VITIMA:
        return 'Você deve sobreviver e ajudar a identificar o assassino através da discussão e votação.';
      default:
        return 'Papel desconhecido.';
    }
  };

  const handleNewGame = () => {
    disconnect();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-800 to-dark-900 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center text-white pt-8">
          <h1 className="text-2xl font-bold mb-2">🌙 Cidade Dorme</h1>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-lg font-mono tracking-widest">{state.room.id}</p>
            <p className="text-sm text-gray-300">Jogo em Andamento</p>
          </div>
        </div>

        {/* Your Role Card */}
        <div className={`bg-gradient-to-br ${getRoleColor(yourRole)} rounded-2xl shadow-xl p-6 text-white animate-fade-in`}>
          <div className="text-center">
            <div className="text-6xl mb-4">{getRoleIcon(yourRole)}</div>
            <h2 className="text-2xl font-bold mb-2">SEU PAPEL</h2>
            <h3 className="text-3xl font-bold mb-4">{yourRole}</h3>
            <p className="text-white/90 leading-relaxed">
              {getRoleDescription(yourRole)}
            </p>
          </div>
        </div>

        {/* Narrator View - All Roles */}
        {isNarrator && state.room.playersWithRoles && (
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              👑 Visão do Narrador
            </h3>
            <div className="space-y-3">
              {state.room.playersWithRoles.map((player) => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getRoleIcon(player.role || '')}</span>
                    <div>
                      <p className="font-medium text-gray-800">{player.name}</p>
                      <p className="text-sm text-gray-600">{player.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player List (Public View) */}
        {!isNarrator && (
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Jogadores na Partida
            </h3>
            <div className="space-y-2">
              {state.room.players.map((player) => (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.id === state.playerId 
                      ? 'bg-primary-50 border border-primary-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {player.isNarrator ? '👑' : '🎭'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">
                        {player.name}
                        {player.id === state.playerId && (
                          <span className="text-primary-600 text-sm ml-1">(você)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {player.isNarrator ? 'Narrador' : 'Jogador'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Como Jogar</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>1. Noite:</strong> Jogadores especiais fazem suas ações em segredo</p>
            <p><strong>2. Dia:</strong> Discussão sobre quem pode ser o assassino</p>
            <p><strong>3. Votação:</strong> Grupo vota para eliminar suspeito</p>
            <p><strong>4. Repetir:</strong> Até assassino ser eliminado ou sobrar sozinho</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNewGame}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200"
        >
          🏠 Voltar ao Início
        </button>

        {/* Footer */}
        <div className="text-center text-white/70 text-sm">
          <p>Mantenha esta tela segura! 🤫</p>
          <p>Apenas você deve ver seu papel.</p>
        </div>

      </div>
    </div>
  );
} 