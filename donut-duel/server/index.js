const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3001;
const ARENA_SIZE = 800;
const DONUT_COUNT = 10;
const SUBSIDY_CHANCE = 0.05;
const GAME_DURATION = 60; 

class GameEngine {
  constructor() {
    this.players = {};
    this.donuts = [];
    this.subsidies = [];
    this.timeLeft = GAME_DURATION;
    this.gameActive = false;
    this.timerInterval = null;
    this.eventInterval = null;
    this.currentEvent = null;
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

  spawnSubsidy(count = 1) {
    for (let i = 0; i < count; i++) {
      this.subsidies.push({
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * (ARENA_SIZE - 30),
        y: Math.random() * (ARENA_SIZE - 30),
      });
    }
    io.emit('subsidiesUpdate', this.subsidies);
  }

  startGame() {
    if (this.gameActive) return;
    this.gameActive = true;
    this.timeLeft = GAME_DURATION;
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      io.emit('timerUpdate', this.timeLeft);
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
    this.eventInterval = setInterval(() => this.triggerRandomEvent(), 20000);
  }

  triggerRandomEvent() {
    const events = ['AUDIT', 'EET_BONUS', 'CERPANI'];
    const selected = events[Math.floor(Math.random() * events.length)];
    this.currentEvent = selected;
    let duration = 5000;
    let eventData = { name: selected, duration };

    if (selected === 'AUDIT') {
      const pIds = Object.keys(this.players);
      if (pIds.length > 0) {
        const victim = pIds[Math.floor(Math.random() * pIds.length)];
        eventData.victim = victim;
        io.emit('eventStart', eventData);
        setTimeout(() => this.clearEvent(), 3000);
      }
    } else if (selected === 'EET_BONUS') {
      duration = 10000;
      eventData.duration = duration;
      io.emit('eventStart', eventData);
      setTimeout(() => this.clearEvent(), duration);
    } else if (selected === 'CERPANI') {
      this.spawnSubsidy(5);
      io.emit('eventStart', eventData);
      setTimeout(() => this.clearEvent(), 5000);
    }
  }

  clearEvent() {
    this.currentEvent = null;
    io.emit('eventEnd');
  }

  endGame() {
    this.gameActive = false;
    clearInterval(this.timerInterval);
    clearInterval(this.eventInterval);
    this.clearEvent();
    const winner = this.getWinner();
    io.emit('gameOver', { winner });
  }

  getWinner() {
    const playerList = Object.values(this.players);
    if (playerList.length === 0) return null;
    return playerList.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr);
  }

  resetGame() {
    this.timeLeft = GAME_DURATION;
    Object.values(this.players).forEach(p => { p.score = 0; p.subsidyActive = false; });
    this.donuts = [];
    this.subsidies = [];
    this.spawnDonuts();
    this.clearEvent();
    io.emit('gameReset', { players: this.players, donuts: this.donuts, arenaSize: ARENA_SIZE });
    this.startGame();
  }
}

const game = new GameEngine();

io.on('connection', (socket) => {
  game.players[socket.id] = {
    id: socket.id,
    x: Math.random() * (ARENA_SIZE - 50),
    y: Math.random() * (ARENA_SIZE - 50),
    score: 0,
    subsidyActive: false,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  };

  if (!game.gameActive && Object.keys(game.players).length >= 1) game.startGame();

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

  socket.on('moveDelta', (deltaBuffer) => {
    if (!game.gameActive) return;
    const player = game.players[socket.id];
    if (player) {
      const view = new DataView(deltaBuffer);
      const dx = view.getInt8(0);
      const dy = view.getInt8(1);
      player.x += dx;
      player.y += dy;
      
      game.donuts = game.donuts.filter(donut => {
        if (Math.sqrt((player.x - donut.x)**2 + (player.y - donut.y)**2) < 30) {
          player.score += (game.currentEvent === 'EET_BONUS' ? 2 : 1);
          io.emit('scoreUpdate', { playerId: socket.id, score: player.score });
          return false;
        }
        return true;
      });

      game.subsidies = game.subsidies.filter(sub => {
        if (Math.sqrt((player.x - sub.x)**2 + (player.y - sub.y)**2) < 35) {
          activateBoost(socket.id, 5000);
          return false;
        }
        return true;
      });

      if (game.donuts.length < DONUT_COUNT) {
        game.spawnDonuts();
        io.emit('donutsUpdate', game.donuts);
      }
      // Broadcast delta to others
      socket.broadcast.emit('playerDelta', { id: socket.id, delta: deltaBuffer });
    }
  });

  socket.on('chatMessage', (msg) => io.emit('chatUpdate', { playerId: socket.id, message: msg }));
  socket.on('buyCertificate', () => {
    const player = game.players[socket.id];
    if (player && player.score >= 20 && !player.subsidyActive) {
      player.score -= 20;
      io.emit('scoreUpdate', { playerId: socket.id, score: player.score });
      activateBoost(socket.id, 10000);
    }
  });

  function activateBoost(playerId, duration) {
    const p = game.players[playerId];
    if (p) {
      p.subsidyActive = true;
      io.emit('subsidyEffect', { playerId, active: true });
      setTimeout(() => { if (game.players[playerId]) { game.players[playerId].subsidyActive = false; io.emit('subsidyEffect', { playerId, active: false }); } }, duration);
    }
  }

  socket.on('requestReset', () => game.resetGame());
  socket.on('disconnect', () => { delete game.players[socket.id]; io.emit('playerDisconnected', socket.id); });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
