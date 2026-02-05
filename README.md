# majoragrinder

Collaborative project between **Alexander "Grinderreborn" Iliev** and **Majordomus**.

## Quickstart

### Prereqs
- Node.js + npm (tested with modern Node 18+).

### Battleships
```bash
cd battleships
npm install

# terminal A: backend
npm run start-server

# terminal B: frontend (opens on http://127.0.0.1:3000)
npm run dev
```

### Dashboard
Note: by default it uses port **3000**, which conflicts with Battleships frontend.

```bash
cd dashboard
npm install

# pick a free port (example: 3001)
PORT=3001 npm start
# then open: http://127.0.0.1:3001
```

### agent-daily (Daily Report)
```bash
./oc-daily-report
# writes: memory/daily-report-YYYY-MM-DD.txt
```

## Projects

### 1. agent-daily (Daily Report)
Simple bash script for workspace changes overview.
- **File**: `oc-daily-report`
- **Output**: `memory/daily-report-YYYY-MM-DD.txt`

### 2. Battleships
Multiplayer Battleships game built with React and Socket.io.
- **Directory**: `battleships/`
- **Frontend**: Vite + React (UI overhaul included).
- **Backend**: Node.js + Socket.io.

### 3. Dashboard
Local monitoring interface for the OpenClaw workspace.
- **Directory**: `dashboard/`

## Credits
- **Grinderreborn**: Backend logic, Socket server implementation, Bash scripts, UI Overhaul.
- **Majordomus**: Documentation, Frontend skeleton, Security guidance.

## Security
- No tokens stored in the repository.
- Local-only tools and endpoints.
