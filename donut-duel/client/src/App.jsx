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
      playerPosRef.current = { x: data.players[data.id].x, y: data.players[data.id].y };
    });

    socketRef.current.on('newPlayer', (player) => {
      setPlayers(prev => ({ ...prev, [player.id]: player }));
    });

    socketRef.current.on('playerMoved', (player) => {
      setPlayers(prev => ({ ...prev, [player.id]: player }));
    });

    socketRef.current.on('scoreUpdate', ({ playerId, score }) => {
      setPlayers(prev => ({
        ...prev,
        [playerId]: { ...prev[playerId], score }
      }));
    });

    socketRef.current.on('donutsUpdate', (newDonuts) => {
      setDonuts(newDonuts);
    });

    socketRef.current.on('subsidiesUpdate', (newSubsidies) => {
      setSubsidies(newSubsidies);
    });

    socketRef.current.on('subsidyEffect', ({ playerId, active }) => {
      setPlayers(prev => ({
        ...prev,
        [playerId]: { ...prev[playerId], subsidyActive: active }
      }));
    });

    socketRef.current.on('playerDisconnected', (id) => {
      setPlayers(prev => {
        const newPlayers = { ...prev };
        delete newPlayers[id];
        return newPlayers;
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!myId) return;

      const player = players[myId];
      const step = player && player.subsidyActive ? 25 : 15;
      let { x, y } = playerPosRef.current;

      if (e.key === 'ArrowUp') y -= step;
      if (e.key === 'ArrowDown') y += step;
      if (e.key === 'ArrowLeft') x -= step;
      if (e.key === 'ArrowRight') x += step;

      // Bound checking
      x = Math.max(0, Math.min(arenaSize - 34, x));
      y = Math.max(0, Math.min(arenaSize - 34, y));

      if (x !== playerPosRef.current.x || y !== playerPosRef.current.y) {
        playerPosRef.current = { x, y };
        setPlayers(prev => ({
          ...prev,
          [myId]: { ...prev[myId], x, y }
        }));
        socketRef.current.emit('move', { x, y });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [myId, arenaSize, players]);

  const myPlayer = myId && players[myId] ? players[myId] : null;
  const myScore = myPlayer ? myPlayer.score : 0;
  const isSubsidyActive = myPlayer ? myPlayer.subsidyActive : false;

  return (
    <div className="game-container">
      <div className="hud-glass">
        <h1 className="title-neon">Donut Duel</h1>
        <div className="stats-row">
          <div className="stat-card">
            <span>VAŠE KOBLIHY</span>
            <span className="count-neon">{myScore}</span>
          </div>
          <div className="stat-card">
            <span>DOTÁCIE</span>
            <span className={`status-neon ${isSubsidyActive ? 'active-text' : ''}`}>
              {isSubsidyActive ? 'AKTÍVNE' : 'ČEKÁNÍ'}
            </span>
          </div>
          <div className="stat-card">
            <span>SÚPERI</span>
            <span className="status-neon">{Object.keys(players).length - 1}</span>
          </div>
        </div>
      </div>

      <div className="arena" style={{ width: arenaSize, height: arenaSize }}>
        {donuts.map(donut => (
          <div
            key={donut.id}
            className="donut"
            style={{ left: donut.x, top: donut.y }}
          >
            🍩
          </div>
        ))}
        {subsidies.map(sub => (
          <div
            key={sub.id}
            className="subsidy-packet"
            style={{ left: sub.x, top: sub.y }}
          >
            💰
          </div>
        ))}
        {Object.values(players).map(player => (
          <div
            key={player.id}
            className={`player ${player.subsidyActive ? 'active-subsidy' : ''}`}
            style={{
              left: player.x,
              top: player.y,
              color: player.color,
              backgroundColor: player.color,
              border: player.id === myId ? '2px solid white' : 'none',
              opacity: player.id === myId ? 1 : 0.8
            }}
          >
            <div className="player-label">
              {player.id === myId ? 'VY' : 'SÚPER'}
              {player.id !== myId && ` (${player.score})`}
            </div>
          </div>
        ))}
      </div>
      
      <div className="controls-hint">POUŽÍVAJTE ŠÍPKY NA POHYB {isSubsidyActive && '(SPEED BOOST!)'}</div>
    </div>
  );
}

export default App;
