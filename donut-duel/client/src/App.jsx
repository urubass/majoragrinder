import React, { useEffect, useRef, useReducer, useState } from 'react';
import { io } from 'socket.io-client';
import { playSound, stopSound } from './AudioManager';
import './App.css';

const SOCKET_URL = 'http://localhost:3001';

const initialState = {
  myId: null,
  players: {},
  donuts: [],
  subsidies: [],
  arenaSize: 800,
  timeLeft: 60,
  winner: null,
  particles: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload };
    case 'SET_MY_ID':
      return { ...state, myId: action.payload };
    case 'UPDATE_PLAYERS':
      return { ...state, players: action.payload };
    case 'UPDATE_PLAYER':
      return { ...state, players: { ...state.players, [action.payload.id]: action.payload } };
    case 'UPDATE_DONUTS':
      return { ...state, donuts: action.payload };
    case 'UPDATE_SUBSIDIES':
      return { ...state, subsidies: action.payload };
    case 'UPDATE_TIMER':
      return { ...state, timeLeft: action.payload };
    case 'GAME_OVER':
      return { ...state, winner: action.payload };
    case 'GAME_RESET':
      return { ...initialState, myId: state.myId, players: action.payload.players, donuts: action.payload.donuts, arenaSize: action.payload.arenaSize };
    case 'SPAWN_PARTICLES':
      return { ...state, particles: [...state.particles, ...action.payload].slice(-50) };
    case 'CLEAN_PARTICLES':
      return { ...state, particles: state.particles.filter(p => p.life > 0) };
    default:
      return state;
  }
}

const Leaderboard = ({ players, myId }) => {
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
  return (
    <div className="leaderboard-glass">
      <h2 className="neon-text">Dotačný Žebříček</h2>
      <ul className="player-list">
        {sortedPlayers.map((p, i) => (
          <li key={p.id} className={`player-row ${i === 0 ? 'top-king' : ''}`}>
            <span className="rank">#{i + 1}</span>
            <span className="name">{p.id === myId ? 'VY' : `SÚPER (${p.id.substr(0,4)})`}</span>
            <span className="donut-total">{p.score} 🍩</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Shop = ({ score, onBuy, disabled }) => {
  return (
    <div className="shop-glass">
      <h2 className="neon-text">Dotačný Shop</h2>
      <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '10px' }}>
        Kúpiť certifikát (20 🍩)
      </div>
      <button 
        className="btn-premium-shop" 
        onClick={onBuy}
        disabled={disabled || score < 20}
      >
        AKTIVOVAŤ BOOST
      </button>
    </div>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef();
  const playerPosRef = useRef({ x: 0, y: 0 });
  const displayPlayersRef = useRef({});
  const requestRef = useRef();

  const isCrisis = state.donuts.length < 3;
  const crisisRef = useRef(false);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('init', (data) => {
      dispatch({ type: 'INIT', payload: data });
      displayPlayersRef.current = JSON.parse(JSON.stringify(data.players));
      playerPosRef.current = { x: data.players[data.id].x, y: data.players[data.id].y };
    });

    socketRef.current.on('timerUpdate', (time) => dispatch({ type: 'UPDATE_TIMER', payload: time }));
    socketRef.current.on('gameOver', (data) => {
      dispatch({ type: 'GAME_OVER', payload: data.winner });
      stopSound('kampan');
    });

    socketRef.current.on('gameReset', (data) => {
      dispatch({ type: 'GAME_RESET', payload: data });
      if (state.myId) playerPosRef.current = { x: data.players[state.myId].x, y: data.players[state.myId].y };
    });

    socketRef.current.on('scoreUpdate', ({ playerId, score }) => {
      const p = displayPlayersRef.current[playerId];
      if (p) {
        spawnParticles(p.x, p.y, '#ffd700');
        playSound('collect');
      }
      dispatch({ type: 'UPDATE_PLAYER', payload: { ...state.players[playerId], score } });
    });

    socketRef.current.on('subsidyEffect', ({ playerId, active }) => {
      const p = displayPlayersRef.current[playerId];
      if (p && active) {
        spawnParticles(p.x, p.y, '#00f6ff');
        playSound('boost');
      }
      dispatch({ type: 'UPDATE_PLAYER', payload: { ...state.players[playerId], subsidyActive: active } });
    });

    socketRef.current.on('newPlayer', (p) => {
      dispatch({ type: 'UPDATE_PLAYER', payload: p });
      displayPlayersRef.current[p.id] = p;
    });

    socketRef.current.on('playerMoved', (p) => {
      dispatch({ type: 'UPDATE_PLAYER', payload: p });
    });

    socketRef.current.on('donutsUpdate', (d) => dispatch({ type: 'UPDATE_DONUTS', payload: d }));
    socketRef.current.on('subsidiesUpdate', (s) => dispatch({ type: 'UPDATE_SUBSIDIES', payload: s }));

    socketRef.current.on('playerDisconnected', (id) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: Object.fromEntries(Object.entries(state.players).filter(([k]) => k !== id)) });
      delete displayPlayersRef.current[id];
    });

    return () => socketRef.current.disconnect();
  }, [state.myId]);

  useEffect(() => {
    if (isCrisis && !crisisRef.current) {
      playSound('kampan');
    } else if (!isCrisis && crisisRef.current) {
      stopSound('kampan');
    }
    crisisRef.current = isCrisis;
  }, [isCrisis]);

  const spawnParticles = (x, y, color) => {
    const newParticles = Array.from({ length: 12 }).map(() => ({
      id: Math.random(),
      x,
      y,
      tx: (Math.random() - 0.5) * 150,
      ty: (Math.random() - 0.5) * 150,
      color
    }));
    dispatch({ type: 'SPAWN_PARTICLES', payload: newParticles });
  };

  const animate = () => {
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
    const lerpAmt = 0.25;

    Object.keys(state.players).forEach(id => {
      if (displayPlayersRef.current[id]) {
        displayPlayersRef.current[id].x = lerp(displayPlayersRef.current[id].x, state.players[id].x, lerpAmt);
        displayPlayersRef.current[id].y = lerp(displayPlayersRef.current[id].y, state.players[id].y, lerpAmt);
        displayPlayersRef.current[id].score = state.players[id].score;
        displayPlayersRef.current[id].subsidyActive = state.players[id].subsidyActive;
      }
    });
    
    const avatars = document.querySelectorAll('.player');
    avatars.forEach(avatar => {
      const id = avatar.getAttribute('data-id');
      const p = displayPlayersRef.current[id];
      if (p) {
        avatar.style.left = `${p.x}px`;
        avatar.style.top = `${p.y}px`;
        if (p.subsidyActive) avatar.classList.add('active-subsidy');
        else avatar.classList.remove('active-subsidy');
      }
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [state.players]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!state.myId || state.winner) return;
      const p = state.players[state.myId];
      const step = p && p.subsidyActive ? 25 : 15;
      let { x, y } = playerPosRef.current;
      if (e.key === 'ArrowUp') y -= step;
      if (e.key === 'ArrowDown') y += step;
      if (e.key === 'ArrowLeft') x -= step;
      if (e.key === 'ArrowRight') x += step;
      x = Math.max(0, Math.min(state.arenaSize - 34, x));
      y = Math.max(0, Math.min(state.arenaSize - 34, y));
      if (x !== playerPosRef.current.x || y !== playerPosRef.current.y) {
        playerPosRef.current = { x, y };
        socketRef.current.emit('move', { x, y });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.myId, state.arenaSize, state.players, state.winner]);

  const myPlayer = state.myId ? state.players[state.myId] : null;

  return (
    <div className="game-container">
      {state.winner && (
        <div className="winner-modal">
          <div className="winner-title">VÍTĚZNÝ ÚNOR</div>
          <div className="winner-name">DOTAČNÝ KRÁĽ: {state.winner.id === state.myId ? 'VY' : 'SÚPER'} ({state.winner.score} koblih)</div>
          <div className="bude-lip">BUDE LÍP!</div>
          <button className="btn-restart" onClick={() => socketRef.current.emit('requestReset')}>NOVÁ KAMPÁŇ</button>
        </div>
      )}

      <div className="hud-glass">
        <h1 className="title-neon">Donut Duel</h1>
        <div className="stats-row">
          <div className="stat-card">
            <span>ČAS</span>
            <span className="count-neon">{state.timeLeft}s</span>
          </div>
          <div className="stat-card">
            <span>VAŠE KOBLIHY</span>
            <span className="count-neon">{myPlayer?.score || 0}</span>
          </div>
          <div className="stat-card">
            <span>DOTÁCIE</span>
            <span className={`status-neon ${myPlayer?.subsidyActive ? 'active-text' : ''}`}>
              {myPlayer?.subsidyActive ? 'AKTÍVNE' : 'ČEKÁNÍ'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Leaderboard players={state.players} myId={state.myId} />
          <Shop 
            score={myPlayer?.score || 0} 
            disabled={myPlayer?.subsidyActive}
            onBuy={() => socketRef.current.emit('buyCertificate')}
          />
        </div>

        <div className={`arena ${isCrisis ? 'crisis' : ''}`} style={{ width: state.arenaSize, height: state.arenaSize }}>
          {isCrisis && <div className="campaign-alert">KAMPÁŇ!</div>}
          {state.donuts.map(d => <div key={d.id} className="donut" style={{ left: d.x, top: d.y }}>🍩</div>)}
          {state.subsidies.map(s => <div key={s.id} className="subsidy-packet" style={{ left: s.x, top: s.y }}>💰</div>)}
          
          {state.particles.map(p => (
            <div key={p.id} className="particle-burst" style={{ 
              left: p.x, 
              top: p.y, 
              backgroundColor: p.color,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`
            }} />
          ))}

          {Object.values(state.players).map(p => (
            <div key={p.id} data-id={p.id} className="player"
              style={{ backgroundColor: p.color, color: p.color, border: p.id === state.myId ? '2px solid white' : 'none' }}>
              <div className="player-label">{p.id === state.myId ? 'VY' : 'SÚPER'} ({p.score})</div>
            </div>
          ))}
        </div>
      </div>

      <div className="controls-hint">POUŽÍVAJTE ŠÍPKY NA POHYB</div>
    </div>
  );
}

export default App;
