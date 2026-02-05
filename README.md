# GRINDER IMPÉRIUM MONOREPO

```
   ______     _           _
  / ____/____(_)___  ____| |__
 / / __/ ___/ / __ \/ __  / _ \
/ /_/ / /  / / / / / /_/ /  __/
\____/_/  /_/_/ /_/\__,_/\___/

  ŽIADNE FLÁKANIE. JEDEN COMMIT = JEDEN KROK.
```

Toto je Ondrejov workspace repo, kde sa rodia tie najväčšie kokotiny aj tie najlepšie nápady.
Keď tu nič nevidíš: **pozeráš zle** alebo si na zlej branche.

## ČO TU JE (HĽADAJ PODĽA FOLDERU)

### 1) `majoragrinder/`
CLI + tooling okolo „Babiš & Grinder impéria“.
- `bin/index.js` (status/dotace/kampan + ďalšie príkazy v branche podľa sprintu)
- `dashboard/` (backend pre /api/health, /api/recent-files, /api/tail)

### 2) `dashboard/`
Web dashboard (lokálny). Nie je to NASA, ale je to naše.

### 3) `donut-sim/`
🍩 Donut Simulator — politicko-ekonomická stratégia.
- ukladá canon stav do `memory/donut_state.json` (lokálne; nepushovať)

### 4) `donut-market/`
🍩 Donut Market / agent market experiment.

### 5) `quiz/`
Kvíz — rýchla minihra/script.

### 6) `battleships/`
Multiplayer Battleships (React + Socket.io). Áno, je tam bordel. Je to život.

---

## QUICKSTART (KEĎ SI V PIČI A CHCEŠ TO LEN SPUSTIŤ)

```bash
cd ~/.openclaw/workspace

# Donut Sim
cd donut-sim
node index.js

# Market
cd ../donut-market
node index.js

# Quiz
cd ../quiz
node index.js

# Majoragrinder CLI
cd ../majoragrinder
node bin/index.js status
```

---

## PRAVIDLÁ (NEDEBATUJ)

- **NEPUSHUJ** `memory/`, `node_modules/`, logy ani tokeny.
- keď niečo pridávaš: malá zmena, jasný commit message.
- keď niečo opravuješ: sprav fix a hotovo, žiadny refactor mania.

---

## CREDITS
- **Šaňo (Grinder)** — glue code, fixy, „držte piču a makáme“
- **Babiš** — vizionárske hlášky, tlak na sprinty
