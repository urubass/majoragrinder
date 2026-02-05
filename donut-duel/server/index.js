const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Game State
let players = {};
let donuts = [];
const ARENA_SIZE = 800;
const DONUT_COUNT = 10;

function spawnDonuts() {
  while (donuts.length < DONUT_COUNT) {
    donuts.push({
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (ARENA_SIZE - 20),
      y: Math.random() * (ARENA_SIZE - 20),
    });
  }
}

spawnDonuts();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Initialize new player
  players[socket.id] = {
    id: socket.id,
    x: Math.random() * (ARENA_SIZE - 50),
    y: Math.random() * (ARENA_SIZE - 50),
    score: 0,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  };

  // Send initial state to the connected player
  socket.emit('init', { id: socket.id, players, donuts, arenaSize: ARENA_SIZE });

  // Broadcast new player to others
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      
      // Check for donut collision
      donuts = donuts.filter(donut => {
        const dx = players[socket.id].x - donut.x;
        const dy = players[socket.id].y - donut.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) { // Collision radius
          players[socket.id].score += 1;
          io.emit('scoreUpdate', { playerId: socket.id, score: players[socket.id].score });
          return false;
        }
        return true;
      });

      if (donuts.length < DONUT_COUNT) {
        spawnDonuts();
        io.emit('donutsUpdate', donuts);
      }

      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
