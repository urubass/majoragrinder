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

#### Admin flags (dev/testing)

The server contains a guarded `adminEvent` socket handler for testing events.

- Enable explicitly:
  ```bash
  ENABLE_ADMIN=1 npm start
  ```
- Or run in non-production (default): `NODE_ENV` not set to `production`.

### 2. Start the Client

```bash
cd client
npm install
npm run dev
```

The client will run on `http://localhost:5173` (default Vite port).

#### Client admin UI (dev/testing)

Admin panel is only visible in:
- Vite dev mode (`import.meta.env.DEV`), or
- when started with:
  ```bash
  VITE_ENABLE_ADMIN=1 npm run dev
  ```

Toggle the admin panel by clicking the **Donut Duel** title.

## How to Play

- Open the client in two different browser tabs/windows.
- Use **Arrow Keys** to move your player.
- Collect **Donuts (🍩)** to increase your score.
- Compete with the other player in real-time!
