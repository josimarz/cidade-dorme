import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { HomePage } from './components/HomePage';
import { LobbyPage } from './components/LobbyPage';
import { GamePage } from './components/GamePage';

function AppContent() {
  const { state } = useGame();

  // Determinar qual página mostrar baseado no estado
  if (!state.room) {
    return <HomePage />;
  }

  if (state.room.state === 'in_progress' && state.yourRole) {
    return <GamePage />;
  }

  return <LobbyPage />;
}

function App() {
  return (
    <GameProvider>
      <div className="App">
        <AppContent />
      </div>
    </GameProvider>
  );
}

export default App; 