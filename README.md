# majoragrinder (workspace monorepo)

This repo is a **workspace monorepo**: multiple small projects living together.

Issue tracker: <https://github.com/urubass/majoragrinder/issues>

## Quickstart (5 minutes)

### Requirements
- Node.js (recommended: latest LTS)
- Linux/macOS/Windows (WSL ok)

### 1) Daily report
```bash
chmod +x ./oc-daily-report
./oc-daily-report
```
Output: `memory/daily-report-YYYY-MM-DD.txt`

### 2) Quiz
```bash
cd quiz
npm i
node index.js
```

### 3) Donut Sim
```bash
cd donut-sim
npm i
node index.js
```

### 4) Donut Market
```bash
cd donut-market
npm i
node index.js
```

### 5) Majoragrinder CLI (subproject)
```bash
cd majoragrinder
node bin/index.js status
node bin/index.js dotace --json
```

### 6) Dashboard (simple local backend)
```bash
cd majoragrinder/dashboard
npm i
node server.js
# open http://127.0.0.1:3000
```

### 7) Battleships
```bash
cd battleships
npm i
# start server
node server.cjs
# in another terminal, start UI (if present)
# npm run dev
```

## Projects
- `oc-daily-report` — daily workspace report
- `quiz/` — CLI quiz
- `donut-sim/` — terminal game
- `donut-market/` — market experiment
- `majoragrinder/` — CLI + dashboard backend
- `battleships/` — multiplayer game

## Security
- Do not commit tokens/keys.
- `memory/` and `node_modules/` should stay local.
