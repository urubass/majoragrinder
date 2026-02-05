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

// Configuration
const ARENA_SIZE = 800;
const DONUT_COUNT = 10;
const SUBSIDY_CHANCE = 0.05;
const GAME_DURATION = 60; // seconds

// Game State Class for Clean Code
class GameEngine {
  constructor() {
    this.players = {};
    this.donuts = [];
    this.subsidies = [];
    this.timeLeft = GAME_DURATION;
    this.gameActive = false;
    this.timerInterval = null;
    this.spawnDonuts();
  }

  spawnDonuts() {
    while (this.donuts.length < DONUT_COUNT) {
      this.donuts.push({
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * (ARENA_SIZE - 24),
        y: Math.random() * (ARENA_SIZE - 24),
      });
    }
  }

  spawnSubsidy() {
    if (this.subsidies.length < 2 && Math.random() < SUBSIDY_CHANCE) {
      this.subsidies.push({
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * (ARENA_SIZE - 30),
        y: Math.random() * (ARENA_SIZE - 30),
      });
      io.emit('subsidiesUpdate', this.subsidies);
    }
  }

  startGame() {
    if (this.gameActive) return;
    this.gameActive = true;
    this.timeLeft = GAME_DURATION;
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      io.emit('timerUpdate', this.timeLeft);
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  endGame() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    const winner = this.getWinner();
    io.emit('gameOver', { winner });
  }

  getWinner() {
    const playerList = Object.values(this.players);
    if (playerList.length === 0) return null;
    return playerList.reduce((prev, current) => (prev.score > current.score) ? prev : current);
  }

  resetGame() {
    this.timeLeft = GAME_DURATION;
    Object.values(this.players).forEach(p => p.score = 0);
    this.donuts = [];
    this.subsidies = [];
    this.spawnDonuts();
    io.emit('gameReset', { players: this.players, donuts: this.donuts, arenaSize: ARENA_SIZE });
    this.startGame();
  }
}

const game = new GameEngine();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  game.players[socket.id] = {
    id: socket.id,
    x: Math.random() * (ARENA_SIZE - 50),
    y: Math.random() * (ARENA_SIZE - 50),
    score: 0,
    subsidyActive: false,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  };

  if (!game.gameActive && Object.keys(game.players).length >= 1) {
    game.startGame();
  }

  socket.emit('init', { 
    id: socket.id, 
    players: game.players, 
    donuts: game.donuts, 
    subsidies: game.subsidies, 
    arenaSize: ARENA_SIZE,
    timeLeft: game.timeLeft,
    gameActive: game.gameActive
  });

  socket.broadcast.emit('newPlayer', game.players[socket.id]);

  socket.on('move', (data) => {
    if (!game.gameActive) return;
    const player = game.players[socket.id];
    if (player) {
      player.x = data.x;
      player.y = data.y;
      
      // Donut collision
      game.donuts = game.donuts.filter(donut => {
        const dx = player.x - donut.x;
        const dy = player.y - donut.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 30) {
          player.score += 1;
          io.emit('scoreUpdate', { playerId: socket.id, score: player.score });
          return false;
        }
        return true;
      });

      // Subsidy collision
      game.subsidies = game.subsidies.filter(sub => {
        const dx = player.x - sub.x;
        const dy = player.y - sub.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 35) {
          player.subsidyActive = true;
          io.emit('subsidyEffect', { playerId: socket.id, active: true });
          
          setTimeout(() => {
            if (game.players[socket.id]) {
              game.players[socket.id].subsidyActive = false;
              io.emit('subsidyEffect', { playerId: socket.id, active: false });
            }
          }, 5000);
          
          return false;
        }
        return true;
      });

      if (game.donuts.length < DONUT_COUNT) {
        game.spawnDonuts();
        io.emit('donutsUpdate', game.donuts);
      }
      
      game.spawnSubsidy();
      socket.broadcast.emit('playerMoved', player);
    }
  });

  socket.on('requestReset', () => {
    game.resetGame();
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete game.players[socket.id];
    io.emit('playerDisconnected', socket.id);
    if (Object.keys(game.players).length === 0) {
      game.gameActive = false;
      clearInterval(game.timerInterval);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
