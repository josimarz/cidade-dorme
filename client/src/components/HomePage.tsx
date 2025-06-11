import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export function HomePage() {
  const { state, createRoom, joinRoom } = useGame();
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [narratorName, setNarratorName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narratorName.trim()) return;
    
    setLoading(true);
    try {
      const response = await createRoom(narratorName.trim());
      if (!response.success) {
        console.error('Erro ao criar sala:', response.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !playerName.trim()) return;
    
    setLoading(true);
    try {
      const response = await joinRoom(roomId.trim().toUpperCase(), playerName.trim());
      if (!response.success) {
        console.error('Erro ao entrar na sala:', response.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!state.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando ao servidor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">🌙 Cidade Dorme</h1>
          <p className="text-primary-100">Sorteio de papéis online</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
          
          {/* Error Display */}
          {state.error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {state.error}
            </div>
          )}

          {mode === 'home' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-center text-gray-800">
                Como deseja jogar?
              </h2>
              
              <button
                onClick={() => setMode('create')}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-3"
              >
                <span className="text-2xl">👑</span>
                <span>Criar Sala (Narrador)</span>
              </button>
              
              <button
                onClick={() => setMode('join')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-3"
              >
                <span className="text-2xl">🎭</span>
                <span>Entrar em Sala</span>
              </button>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Como funciona:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• O narrador cria uma sala</li>
                  <li>• Jogadores entram com o código da sala</li>
                  <li>• Mínimo 6, máximo 15 jogadores</li>
                  <li>• Papéis sorteados automaticamente</li>
                </ul>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Criar Sala</h2>
                <button
                  type="button"
                  onClick={() => setMode('home')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu nome (Narrador)
                </label>
                <input
                  type="text"
                  value={narratorName}
                  onChange={(e) => setNarratorName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Digite seu nome"
                  maxLength={20}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !narratorName.trim()}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? 'Criando...' : 'Criar Sala'}
              </button>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Entrar na Sala</h2>
                <button
                  type="button"
                  onClick={() => setMode('home')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código da Sala
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  placeholder="ABCD"
                  maxLength={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu nome
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Digite seu nome"
                  maxLength={20}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !roomId.trim() || !playerName.trim()}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? 'Entrando...' : 'Entrar na Sala'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
} 