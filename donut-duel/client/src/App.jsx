import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [donuts, setDonuts] = useState(0);
  const [dotaceActive, setDotaceActive] = useState(false);

  return (
    <div className="arena-root">
      {/* Skleněný HUD Panel */}
      <div className="hud-glass">
        <h1 className="title-neon">Donut Duel</h1>
        <div className="stats-row">
          <div className="stat-card">
            <span>Koblihy:</span>
            <span className="count-neon">{donuts}</span>
          </div>
          <div className={`stat-card ${dotaceActive ? 'active' : ''}`}>
            <span>Dotace:</span>
            <span className="status-neon">{dotaceActive ? 'AKTIVNÍ' : 'ČEKÁNÍ'}</span>
          </div>
        </div>
      </div>

      {/* Herní plocha - Placeholder */}
      <div className="game-grid">
        <div className="player-avatar neon-blue">U</div>
        <div className="player-avatar neon-pink">O</div>
        <div className="donut-item" style={{top: '40%', left: '60%'}}>🍩</div>
      </div>

      <button className="btn-premium" onClick={() => setDonuts(d => d + 1)}>
        SEBRAT KOBLIHU
      </button>
    </div>
  );
};

export default App;
