import React, { useEffect, useRef, useReducer, useState } from 'react';
import { io } from 'socket.io-client';
import { playSound, stopSound } from './AudioManager';
import { packPosition } from './BinaryProtocol';
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
  particles: [],
  activeEvent: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT': return { ...state, ...action.payload };
    case 'UPDATE_PLAYER': return { ...state, players: { ...state.players, [action.payload.id]: action.payload } };
    case 'UPDATE_PLAYER_CHAT': 
      return { ...state, players: { ...state.players, [action.payload.id]: { ...state.players[action.payload.id], chat: action.payload.chat } } };
    case 'UPDATE_DONUTS': return { ...state, donuts: action.payload };
    case 'UPDATE_SUBSIDIES': return { ...state, subsidies: action.payload };
    case 'UPDATE_TIMER': return { ...state, timeLeft: action.payload };
    case 'GAME_OVER': return { ...state, winner: action.payload };
    case 'GAME_RESET': return { ...initialState, myId: state.myId, players: action.payload.players, donuts: action.payload.donuts, arenaSize: action.payload.arenaSize };
    case 'EVENT_START': return { ...state, activeEvent: action.payload };
    case 'EVENT_END': return { ...state, activeEvent: null };
    case 'SPAWN_PARTICLES': return { ...state, particles: [...state.particles, ...action.payload].slice(-100) };
    case 'PLAYER_DISC': 
      const next = { ...state.players };
      delete next[action.payload];
      return { ...state, players: next };
    default: return state;
  }
}

const Leaderboard = ({ players, myId }) => {
  const sorted = Object.values(players).sort((a, b) => b.score - a.score);
  return (
    <div className="leaderboard-glass">
      <h2 className="neon-text">Žebříček</h2>
      <ul className="player-list">
        {sorted.map((p, i) => (
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

const QuickChat = ({ onSend }) => {
  const messages = ["Všetci kradnú!", "To je kampaň!", "Bude líp!", "Dotace schválena!"];
  return (
    <div className="quick-chat-panel">
      {messages.map(m => (
        <button key={m} className="btn-quick-chat" onClick={() => onSend(m)}>{m}</button>
      ))}
    </div>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showAnnouncer, setShowAnnouncer] = useState(false);
  const socketRef = useRef();
  const workerRef = useRef();
  const playerPosRef = useRef({ x: 0, y: 0 });
  const displayPlayersRef = useRef({});
  const requestRef = useRef();
  const updateQueueRef = useRef({}); // Jitter Buffer

  useEffect(() => {
    workerRef.current = new Worker(new URL('./BinaryWorker.js', import.meta.url));
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.on('init', (data) => {
      dispatch({ type: 'INIT', payload: data });
      displayPlayersRef.current = JSON.parse(JSON.stringify(data.players));
      playerPosRef.current = { x: data.players[data.id].x, y: data.players[data.id].y };
    });

    socketRef.current.on('timerUpdate', (t) => dispatch({ type: 'UPDATE_TIMER', payload: t }));
    socketRef.current.on('gameOver', (d) => { dispatch({ type: 'GAME_OVER', payload: d.winner }); stopSound('kampan'); });
    socketRef.current.on('gameReset', (d) => {
      dispatch({ type: 'GAME_RESET', payload: d });
      displayPlayersRef.current = JSON.parse(JSON.stringify(d.players));
      if (state.myId) playerPosRef.current = { x: d.players[state.myId].x, y: d.players[state.myId].y };
    });

    socketRef.current.on('scoreUpdate', ({ playerId, score }) => {
      const p = displayPlayersRef.current[playerId];
      if (p) spawnParticles(p.x, p.y, '#ffd700');
      playSound('collect');
      dispatch({ type: 'UPDATE_PLAYER', payload: { ...state.players[playerId], score } });
    });

    socketRef.current.on('subsidyEffect', ({ playerId, active }) => {
      const p = displayPlayersRef.current[playerId];
      if (active && p) spawnParticles(p.x, p.y, '#00f6ff');
      if (active) playSound('boost');
      dispatch({ type: 'UPDATE_PLAYER', payload: { ...state.players[playerId], subsidyActive: active } });
    });

    socketRef.current.on('chatUpdate', ({ playerId, message }) => {
      const p = displayPlayersRef.current[playerId];
      if (p) spawnChatParticles(p.x, p.y, message);
      dispatch({ type: 'UPDATE_PLAYER_CHAT', payload: { id: playerId, chat: message } });
      setTimeout(() => dispatch({ type: 'UPDATE_PLAYER_CHAT', payload: { id: playerId, chat: null } }), 3000);
    });

    socketRef.current.on('eventStart', (ev) => { 
      dispatch({ type: 'EVENT_START', payload: ev }); 
      setShowAnnouncer(true);
      setTimeout(() => setShowAnnouncer(false), 3000);
      playSound('boost'); 
    });
    
    socketRef.current.on('eventEnd', () => dispatch({ type: 'EVENT_END' }));
    socketRef.current.on('newPlayer', (p) => { dispatch({ type: 'UPDATE_PLAYER', payload: p }); displayPlayersRef.current[p.id] = p; });
    
    socketRef.current.on('playerMoved', (p) => {
      // Jitter Buffer: Queue updates instead of immediate set
      if (p.id !== state.myId) {
        if (!updateQueueRef.current[p.id]) updateQueueRef.current[p.id] = [];
        updateQueueRef.current[p.id].push({ x: p.x, y: p.y, ts: Date.now() });
      }
    });

    socketRef.current.on('donutsUpdate', (d) => dispatch({ type: 'UPDATE_DONUTS', payload: d }));
    socketRef.current.on('subsidiesUpdate', (s) => dispatch({ type: 'UPDATE_SUBSIDIES', payload: s }));
    socketRef.current.on('playerDisconnected', (id) => { dispatch({ type: 'PLAYER_DISC', payload: id }); delete displayPlayersRef.current[id]; delete updateQueueRef.current[id]; });

    return () => { socketRef.current.disconnect(); workerRef.current.terminate(); };
  }, [state.myId]);

  const spawnParticles = (x, y, color) => {
    const p = Array.from({ length: 10 }).map(() => ({ id: Math.random(), type: 'pixel', x, y, tx: (Math.random()-0.5)*150, ty: (Math.random()-0.5)*150, color }));
    dispatch({ type: 'SPAWN_PARTICLES', payload: p });
  };

  const spawnChatParticles = (x, y, msg) => {
    let emoji = '🍩';
    if (msg.includes('kampaň')) emoji = '‼️';
    if (msg.includes('líp')) emoji = '❤️';
    if (msg.includes('kradnú')) emoji = '⛓️';
    if (msg.includes('schválena')) emoji = '💰';
    
    const p = Array.from({ length: 6 }).map(() => ({ id: Math.random(), type: 'emoji', emoji, x, y, tx: (Math.random()-0.5)*200, ty: (Math.random()-0.5)*200 }));
    dispatch({ type: 'SPAWN_PARTICLES', payload: p });
  };

  const animate = () => {
    const lerp = (s, e, a) => (1 - a) * s + a * e;
    
    Object.keys(state.players).forEach(id => {
      const p = state.players[id];
      const disp = displayPlayersRef.current[id];
      if (!disp) return;

      if (id === state.myId) {
        disp.x = lerp(disp.x, p.x, 0.4);
        disp.y = lerp(disp.y, p.y, 0.4);
      } else {
        // High-speed Jitter Buffer Interpolation
        const queue = updateQueueRef.current[id];
        if (queue && queue.length > 0) {
          const target = queue[0];
          disp.x = lerp(disp.x, target.x, 0.2);
          disp.y = lerp(disp.y, target.y, 0.2);
          if (Math.abs(disp.x - target.x) < 1 && Math.abs(disp.y - target.y) < 1) queue.shift();
        }
      }
    });

    document.querySelectorAll('.player').forEach(el => {
      const p = displayPlayersRef.current[el.getAttribute('data-id')];
      if (p) { el.style.left = `${p.x}px`; el.style.top = `${p.y}px`; }
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => { requestRef.current = requestAnimationFrame(animate); return () => cancelAnimationFrame(requestRef.current); }, [state.players]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!state.myId || state.winner) return;
      if (state.activeEvent?.name === 'AUDIT' && state.activeEvent?.victim === state.myId) return;
      const p = state.players[state.myId];
      const step = p?.subsidyActive ? 25 : 15;
      let { x, y } = playerPosRef.current;
      if (e.key === 'ArrowUp') y -= step; if (e.key === 'ArrowDown') y += step;
      if (e.key === 'ArrowLeft') x -= step; if (e.key === 'ArrowRight') x += step;
      x = Math.max(0, Math.min(state.arenaSize-34, x)); y = Math.max(0, Math.min(state.arenaSize-34, y));
      if (x !== playerPosRef.current.x || y !== playerPosRef.current.y) {
        playerPosRef.current = { x, y };
        dispatch({ type: 'UPDATE_PLAYER', payload: { ...p, x, y } });
        socketRef.current.emit('move', { x, y });
      }
    };
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.myId, state.arenaSize, state.players, state.winner, state.activeEvent]);

  return (
    <div className="game-container">
      {state.winner && <div className="winner-modal"><div className="winner-title">VÍTĚZNÝ ÚNOR</div><div className="winner-name">KRÁĽ: {state.winner.id === state.myId ? 'VY' : 'SÚPER'} ({state.winner.score})</div><div className="bude-lip">BUDE LÍP!</div><button className="btn-restart" onClick={() => socketRef.current.emit('requestReset')}>NOVÁ KAMPÁŇ</button></div>}
      {showAnnouncer && state.activeEvent && (<div className="event-announcer"><div className="announcer-title">MIMOŘÁDNÁ ZPRÁVA</div><div className="announcer-text">{state.activeEvent.name}</div></div>)}
      <div className="hud-glass"><h1 className="title-neon">Donut Duel</h1><div className="stats-row"><div className="stat-card"><span>ČAS</span><span className="count-neon">{state.timeLeft}s</span></div><div className="stat-card"><span>KOBLIHY</span><span className="count-neon">{state.players[state.myId]?.score || 0}</span></div><div className="stat-card"><span>DOTÁCIE</span><span className={`status-neon ${state.players[state.myId]?.subsidyActive ? 'active-text' : ''}`}>{state.players[state.myId]?.subsidyActive ? 'AKTÍVNE' : 'ČEKÁNÍ'}</span></div></div></div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Leaderboard players={state.players} myId={state.myId} />
          <div className="shop-glass"><h2 className="neon-text">Shop</h2><button className="btn-premium-shop" onClick={() => socketRef.current.emit('buyCertificate')} disabled={state.players[state.myId]?.score < 20}>BOOST (20🍩)</button></div>
          <div className="shop-glass"><h2 className="neon-text">Chat</h2><QuickChat onSend={(m) => socketRef.current.emit('chatMessage', m)} /></div>
        </div>
        <div className={`arena ${state.donuts.length < 3 ? 'crisis' : ''} ${state.activeEvent?.name === 'EET_BONUS' ? 'eet-active' : ''}`} style={{ width: state.arenaSize, height: state.arenaSize }}>
          <div className={`overlay overlay-audit ${state.activeEvent?.name === 'AUDIT' ? 'active-overlay' : ''}`} />
          <div className={`overlay overlay-eet ${state.activeEvent?.name === 'EET_BONUS' ? 'active-overlay' : ''}`} />
          {state.donuts.length < 3 && <div className="campaign-alert">KAMPÁŇ!</div>}
          {state.donuts.map(d => <div key={d.id} className="donut" style={{ left: d.x, top: d.y }}>🍩</div>)}
          {state.subsidies.map(s => <div key={s.id} className="subsidy-packet" style={{ left: s.x, top: s.y }}>💰</div>)}
          {state.particles.map(p => p.type === 'pixel' ? (
            <div key={p.id} className="particle-burst" style={{ left: p.x, top: p.y, backgroundColor: p.color, '--tx': `${p.tx}px`, '--ty': `${p.ty}px` }} />
          ) : (
            <div key={p.id} className="particle-emoji" style={{ left: p.x, top: p.y, '--tx': `${p.tx}px`, '--ty': `${p.ty}px` }}>{p.emoji}</div>
          ))}
          {Object.values(state.players).map(p => (
            <div key={p.id} data-id={p.id} className={`player ${p.subsidyActive ? 'active-subsidy' : ''} ${state.activeEvent?.name === 'AUDIT' && state.activeEvent?.victim === p.id ? 'frozen' : ''}`} style={{ backgroundColor: p.color, color: p.color, border: p.id === state.myId ? '2px solid white' : 'none' }}>
              {p.chat && <div className="chat-bubble">{p.chat}</div>}
              <div className="player-label">{p.id === state.myId ? 'VY' : 'SÚPER'} ({p.score})</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default App;
