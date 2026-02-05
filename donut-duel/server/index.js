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
let subsidies = [];
const ARENA_SIZE = 800;
const DONUT_COUNT = 10;
const SUBSIDY_CHANCE = 0.05;

function spawnDonuts() {
  while (donuts.length < DONUT_COUNT) {
    donuts.push({
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (ARENA_SIZE - 24),
      y: Math.random() * (ARENA_SIZE - 24),
    });
  }
}

function spawnSubsidy() {
  if (subsidies.length < 2 && Math.random() < SUBSIDY_CHANCE) {
    subsidies.push({
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (ARENA_SIZE - 30),
      y: Math.random() * (ARENA_SIZE - 30),
    });
    io.emit('subsidiesUpdate', subsidies);
  }
}

spawnDonuts();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  players[socket.id] = {
    id: socket.id,
    x: Math.random() * (ARENA_SIZE - 50),
    y: Math.random() * (ARENA_SIZE - 50),
    score: 0,
    subsidyActive: false,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  };

  socket.emit('init', { id: socket.id, players, donuts, subsidies, arenaSize: ARENA_SIZE });
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
        
        if (distance < 30) {
          players[socket.id].score += 1;
          io.emit('scoreUpdate', { playerId: socket.id, score: players[socket.id].score });
          return false;
        }
        return true;
      });

      // Check for subsidy collision
      subsidies = subsidies.filter(sub => {
        const dx = players[socket.id].x - sub.x;
        const dy = players[socket.id].y - sub.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 35) {
          players[socket.id].subsidyActive = true;
          io.emit('subsidyEffect', { playerId: socket.id, active: true });
          
          // Disable after 5 seconds
          setTimeout(() => {
            if (players[socket.id]) {
              players[socket.id].subsidyActive = false;
              io.emit('subsidyEffect', { playerId: socket.id, active: false });
            }
          }, 5000);
          
          return false;
        }
        return true;
      });

      if (donuts.length < DONUT_COUNT) {
        spawnDonuts();
        io.emit('donutsUpdate', donuts);
      }
      
      spawnSubsidy();

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
