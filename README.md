# MAJORAGRINDER

```
   ███╗   ███╗ █████╗      ██╗ ██████╗ ██████╗
   ████╗ ████║██╔══██╗     ██║██╔════╝██╔═══██╗
   ██╔████╔██║███████║     ██║██║     ██║   ██║
   ██║╚██╔╝██║██╔══██║██   ██║██║     ██║   ██║
   ██║ ╚═╝ ██║██║  ██║╚█████╔╝╚██████╗╚██████╔╝
   ╚═╝     ╚═╝╚═╝  ╚═╝ ╚════╝  ╚═════╝ ╚═════╝

   GRINDER IMPÉRIUM TOOLING — ŽIADNE FLÁKANIE
```

Toto je náš malý repo-chaos, čo robí **veľké veci**:
- denný report (OpenClaw workspace)
- mini CLI nástroje pre „impérium“
- dashboard backend endpointy (tail/health/recent-files)

**Šaňo štýl pravidlo:** jeden malý krok, jeden commit. Keď nevieš čo, sprav docs fix. Keď vieš čo, sprav fix.

---

## ČO TU JE

### 1) `oc-daily-report` (bash)
Generuje report do `memory/`:
- `git status -sb`
- commity od včera 00:00
- zmenené súbory (name-status)
- diff stat

**Použitie:**
```bash
chmod +x ./oc-daily-report
./oc-daily-report
```

Voliteľné env:
- `WS` (default `~/.openclaw/workspace`)
- `OUT_DIR` (default `$WS/memory`)

---

### 2) CLI tool: `node bin/index.js`
Áno, je to jednoduché. A práve preto to funguje.

```bash
node bin/index.js status
node bin/index.js status --json

node bin/index.js dotace
node bin/index.js dotace --json

node bin/index.js kampan

node bin/index.js news
node bin/index.js live --every 5
```

- `status --json` = strojovo čitateľný výstup (pre dashboard/boty)
- `dotace --json` = `{ dotaceCzk: number }`
- `news` = **CNN reportáž** (Babiš & Grinder TV)
- `live` = TV ticker (opakované news)

---

### 3) Dashboard backend: `dashboard/server.js`
Express backend (lokálne na loopback) s endpointmi:
- `/api/health` — check OpenClaw gateway
- `/api/recent-files` — posledné súbory vo workspace
- `/api/tail?path=...&n=100` — tail logu

**Bezpečnosť:** `/api/tail` má allowlist len na:
- `/tmp/openclaw`
- `$WORKSPACE/memory`

A je to robené **boundary-safe** (nie prefix-hack typu `/tmp/openclaw2/...`).

---

## QUICKSTART (KEĎ SI BRAIND… no, keď sa ponáhľaš)

```bash
cd ~/.openclaw/workspace/majoragrinder

# report
./oc-daily-report

# CLI
node bin/index.js status
node bin/index.js status --json

# dashboard backend (ak máš deps)
node dashboard/server.js
```

---

## KONTRIBÚCIA (SYSTÉM, NIE FILOZOFIA)

1) sprav branch: `sprint-YYYY-MM-DD-<short>`
2) sprav malú zmenu (30–60 riadkov max)
3) sanity check (aspoň spusti príkaz)
4) commit message:
   - `sprint: ...` pre sprintové mikro veci
   - `fix(dashboard): ...` pre bezpečnosť
   - `feat: ...` keď pridávaš niečo nové

---

## DISCLAIMER
- nič tu nemaže (má to čítať a reportovať)
- tokeny/secret nikdy nepushovať

---

## CREDITS
- Šaňo (Grinder) — glue code, fixy, „držte piču a makáme“
- Babiš — vizionárske hlášky, tlak na sprinty
Collaborative project between **Alexander "Grinderreborn" Iliev** and **Babiš**