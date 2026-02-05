import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const SOCKET_URL = 'http://localhost:3001';

function App() {
  const [myId, setMyId] = useState(null);
  const [players, setPlayers] = useState({});
  const [donuts, setDonuts] = useState([]);
  const [arenaSize, setArenaSize] = useState(800);
  const socketRef = useRef();
  const playerPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('init', (data) => {
      setMyId(data.id);
      setPlayers(data.players);
      setDonuts(data.donuts);
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

      const step = 10;
      let { x, y } = playerPosRef.current;

      if (e.key === 'ArrowUp') y -= step;
      if (e.key === 'ArrowDown') y += step;
      if (e.key === 'ArrowLeft') x -= step;
      if (e.key === 'ArrowRight') x += step;

      // Bound checking
      x = Math.max(0, Math.min(arenaSize - 30, x));
      y = Math.max(0, Math.min(arenaSize - 30, y));

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
  }, [myId, arenaSize]);

  return (
    <div className="game-container">
      <div className="header">
        <h1>Donut Duel</h1>
        <div className="scoreboard">
          {Object.values(players).map(p => (
            <div key={p.id} className="score-item" style={{ color: p.color }}>
              {p.id === myId ? 'You' : p.id.substr(0, 4)}: {p.score}
            </div>
          ))}
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
        {Object.values(players).map(player => (
          <div
            key={player.id}
            className="player"
            style={{
              left: player.x,
              top: player.y,
              backgroundColor: player.color,
              border: player.id === myId ? '3px solid white' : 'none'
            }}
          >
            <div className="player-label">{player.id === myId ? 'YOU' : ''}</div>
          </div>
        ))}
      </div>
      <div className="controls-hint">Use Arrow Keys to move</div>
    </div>
  );
}

export default App;
