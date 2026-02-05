# Donut Duel

A real-time multiplayer game where players compete to collect donuts in an arena.

## Tech Stack

- **Frontend**: Vite + React + Socket.io-client
- **Backend**: Node.js + Express + Socket.io

## Project Structure

```
donut-duel/
├── client/          # Frontend React application
│   ├── src/
│   │   ├── App.jsx  # Game logic and UI
│   │   └── App.css  # Game styles
│   └── ...
└── server/          # Backend Socket.io server
    └── index.js     # Server logic and game state
```

## Getting Started

### 1. Start the Server

```bash
cd server
npm install
npm start
```

The server will run on `http://localhost:3001`.

### 2. Start the Client

```bash
cd client
npm install
npm run dev
```

The client will run on `http://localhost:5173` (default Vite port).

## How to Play

- Open the client in two different browser tabs/windows.
- Use **Arrow Keys** to move your player.
- Collect **Donuts (🍩)** to increase your score.
- Compete with the other player in real-time!
