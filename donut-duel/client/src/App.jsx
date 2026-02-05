import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const SOCKET_URL = 'http://localhost:3001';

function App() {
  const [myId, setMyId] = useState(null);
  const [players, setPlayers] = useState({});
  const [donuts, setDonuts] = useState([]);
  const [subsidies, setSubsidies] = useState([]);
  const [arenaSize, setArenaSize] = useState(800);
  const [timeLeft, setTimeLeft] = useState(60);
  const [winner, setWinner] = useState(null);
  
  const socketRef = useRef();
  const playerPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('init', (data) => {
      setMyId(data.id);
      setPlayers(data.players);
      setDonuts(data.donuts);
      setSubsidies(data.subsidies || []);
      setArenaSize(data.arenaSize);
      setTimeLeft(data.timeLeft);
      playerPosRef.current = { x: data.players[data.id].x, y: data.players[data.id].y };
    });

    socketRef.current.on('timerUpdate', (time) => setTimeLeft(time));
    
    socketRef.current.on('gameOver', (data) => {
      setWinner(data.winner);
    });

    socketRef.current.on('gameReset', (data) => {
      setPlayers(data.players);
      setDonuts(data.donuts);
      setWinner(null);
      setTimeLeft(60);
      if (myId) {
        playerPosRef.current = { x: data.players[myId].x, y: data.players[myId].y };
      }
    });

    socketRef.current.on('newPlayer', (p) => setPlayers(prev => ({ ...prev, [p.id]: p })));
    socketRef.current.on('playerMoved', (p) => setPlayers(prev => ({ ...prev, [p.id]: p })));
    socketRef.current.on('scoreUpdate', ({ playerId, score }) => {
      setPlayers(prev => ({ ...prev, [playerId]: { ...prev[playerId], score } }));
    });
    socketRef.current.on('donutsUpdate', (d) => setDonuts(d));
    socketRef.current.on('subsidiesUpdate', (s) => setSubsidies(s));
    socketRef.current.on('subsidyEffect', ({ playerId, active }) => {
      setPlayers(prev => ({ ...prev, [playerId]: { ...prev[playerId], subsidyActive: active } }));
    });
    socketRef.current.on('playerDisconnected', (id) => {
      setPlayers(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });

    return () => socketRef.current.disconnect();
  }, [myId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!myId || winner) return;
      const p = players[myId];
      const step = p && p.subsidyActive ? 25 : 15;
      let { x, y } = playerPosRef.current;
      if (e.key === 'ArrowUp') y -= step;
      if (e.key === 'ArrowDown') y += step;
      if (e.key === 'ArrowLeft') x -= step;
      if (e.key === 'ArrowRight') x += step;
      x = Math.max(0, Math.min(arenaSize - 34, x));
      y = Math.max(0, Math.min(arenaSize - 34, y));
      if (x !== playerPosRef.current.x || y !== playerPosRef.current.y) {
        playerPosRef.current = { x, y };
        setPlayers(prev => ({ ...prev, [myId]: { ...prev[myId], x, y } }));
        socketRef.current.emit('move', { x, y });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [myId, arenaSize, players, winner]);

  const myPlayer = myId ? players[myId] : null;
  const isCrisis = donuts.length < 3;

  return (
    <div className="game-container">
      {winner && (
        <div className="winner-modal">
          <div className="winner-title">VÍTĚZNÝ ÚNOR</div>
          <div className="winner-name">DOTAČNÝ KRÁĽ: {winner.id === myId ? 'VY' : 'SÚPER'} ({winner.score} koblih)</div>
          <div className="bude-lip">BUDE LÍP!</div>
          <button className="btn-restart" onClick={() => socketRef.current.emit('requestReset')}>NOVÁ KAMPÁŇ</button>
        </div>
      )}

      <div className="hud-glass">
        <h1 className="title-neon">Donut Duel</h1>
        <div className="stats-row">
          <div className="stat-card">
            <span>ČAS</span>
            <span className="count-neon">{timeLeft}s</span>
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

      <div className={`arena ${isCrisis ? 'crisis' : ''}`} style={{ width: arenaSize, height: arenaSize }}>
        {isCrisis && <div className="campaign-alert">KAMPÁŇ!</div>}
        {donuts.map(d => <div key={d.id} className="donut" style={{ left: d.x, top: d.y }}>🍩</div>)}
        {subsidies.map(s => <div key={s.id} className="subsidy-packet" style={{ left: s.x, top: s.y }}>💰</div>)}
        {Object.values(players).map(p => (
          <div key={p.id} className={`player ${p.subsidyActive ? 'active-subsidy' : ''}`}
            style={{ left: p.x, top: p.y, backgroundColor: p.color, color: p.color, border: p.id === myId ? '2px solid white' : 'none', opacity: p.id === myId ? 1 : 0.8 }}>
            <div className="player-label">{p.id === myId ? 'VY' : 'SÚPER'} ({p.score})</div>
          </div>
        ))}
      </div>
      <div className="controls-hint">POUŽÍVAJTE ŠÍPKY NA POHYB</div>
    </div>
  );
}

export default App;
