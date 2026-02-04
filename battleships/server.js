const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        gameState: 'waiting', // waiting, placing, playing, finished
        turn: 0,
        boards: {},
        shots: {}
      };
    }
    
    if (rooms[roomId].players.length < 2) {
      rooms[roomId].players.push(socket.id);
      console.log(`Player ${socket.id} joined room ${roomId}`);
      
      if (rooms[roomId].players.length === 2) {
        rooms[roomId].gameState = 'placing';
        io.to(roomId).emit('gameStatus', { state: 'placing' });
      }
    } else {
      socket.emit('error', 'Room is full');
    }
  });

  socket.on('placeShips', (data) => {
    // data: { roomId, ships }
    const { roomId, ships } = data;
    const room = rooms[roomId];
    if (!room) return;

    room.boards[socket.id] = ships;
    console.log(`Player ${socket.id} placed ships in room ${roomId}`);

    if (Object.keys(room.boards).length === 2) {
      room.gameState = 'playing';
      room.turn = room.players[0];
      io.to(roomId).emit('gameStatus', { state: 'playing', turn: room.turn });
    }
  });

  socket.on('fireShot', (data) => {
    // data: { roomId, x, y }
    const { roomId, x, y } = data;
    const room = rooms[roomId];
    if (!room || room.gameState !== 'playing' || room.turn !== socket.id) return;

    const opponentId = room.players.find(id => id !== socket.id);
    const hit = checkHit(room.boards[opponentId], x, y);
    
    if (!room.shots[socket.id]) room.shots[socket.id] = [];
    room.shots[socket.id].push({ x, y, hit });

    io.to(roomId).emit('shotResult', { player: socket.id, x, y, hit });

    if (checkWin(room.boards[opponentId], room.shots[socket.id])) {
      room.gameState = 'finished';
      io.to(roomId).emit('gameStatus', { state: 'finished', winner: socket.id });
    } else {
      room.turn = opponentId;
      io.to(roomId).emit('gameStatus', { state: 'playing', turn: room.turn });
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    // Cleanup room logic would go here
  });
});

function checkHit(ships, x, y) {
  return ships.some(ship => ship.coords.some(c => c.x === x && c.y === y));
}

function checkWin(ships, shots) {
  const allShipCoords = ships.flatMap(s => s.coords);
  return allShipCoords.every(c => shots.some(s => s.x === c.x && s.y === c.y && s.hit));
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Battleships server running at http://127.0.0.1:${PORT}`);
});
