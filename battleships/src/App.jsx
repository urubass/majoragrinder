import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./style.css";

const SIZE = 10;
const FLEET = [5, 4, 3, 3, 2];

const inBounds = (x, y) => x >= 0 && x < SIZE && y >= 0 && y < SIZE;
const key = (x, y) => `${x},${y}`;

function neighbors8(x, y) {
  const res = [];
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      res.push([x + dx, y + dy]);
    }
  return res;
}

function buildShipCoords(len, start, dir) {
  const coords = [];
  for (let i = 0; i < len; i++) {
    const x = start.x + (dir === "H" ? i : 0);
    const y = start.y + (dir === "V" ? i : 0);
    coords.push({ x, y });
  }
  return coords;
}

function validateNoTouch(allShips) {
<<<<<<< Updated upstream
  // allShips: [{coords:[{x,y}...]}]
  const occupied = new Set();

  for (const s of allShips) {
    for (const c of s.coords) {
      if (!inBounds(c.x, c.y)) return { ok: false, reason: "Mimo grid" };
      const k = key(c.x, c.y);
      if (occupied.has(k)) return { ok: false, reason: "Překryv lodí" };
      occupied.add(k);
    }
  }

  // no-touch incl diagonal
=======
  const occupied = new Set();
  for (const s of allShips) {
    for (const c of s.coords) {
      if (!inBounds(c.x, c.y)) return { ok: false, reason: "Out of bounds" };
      const k = key(c.x, c.y);
      if (occupied.has(k)) return { ok: false, reason: "Overlapping ships" };
      occupied.add(k);
    }
  }
>>>>>>> Stashed changes
  for (const s of allShips) {
    for (const c of s.coords) {
      for (const [nx, ny] of neighbors8(c.x, c.y)) {
        if (!inBounds(nx, ny)) continue;
        const nk = key(nx, ny);
<<<<<<< Updated upstream
        if (
          occupied.has(nk) &&
          !s.coords.some((cc) => cc.x === nx && cc.y === ny)
        ) {
          return { ok: false, reason: "Lodě se nesmí dotýkat (ani diagonálně)" };
=======
        if (occupied.has(nk) && !s.coords.some((cc) => cc.x === nx && cc.y === ny)) {
          return { ok: false, reason: "Ships cannot touch (including diagonally)" };
>>>>>>> Stashed changes
        }
      }
    }
  }
<<<<<<< Updated upstream

  return { ok: true };
}

function Pill({ children, tone }) {
  const cls = ["pill", tone ? `pill--${tone}` : ""].join(" ");
  return <span className={cls}>{children}</span>;
=======
  return { ok: true };
>>>>>>> Stashed changes
}

export default function App() {
  const [roomId, setRoomId] = useState("");
  const [connected, setConnected] = useState(false);
<<<<<<< Updated upstream

  const [player, setPlayer] = useState(null); // {playerId, side, roomId}
  const [status, setStatus] = useState(null); // {state, turn, winner?}
  const [toast, setToast] = useState("");

  const [dir, setDir] = useState("H");
  const [ships, setShips] = useState([]); // [{coords:[{x,y}...]}]
  const [shots, setShots] = useState(new Map()); // enemy shots key->"hit"|"miss"
  const [lastShot, setLastShot] = useState(null); // {x,y,hit,player}

  const sockRef = useRef(null);

  const phase = status?.state || "waiting"; // waiting|placing|playing|finished
  const yourTurn = !!(
    status?.turn &&
    player?.playerId &&
    status.turn === player.playerId
  );
  const canPlace = phase === "placing";
  const canPlay = phase === "playing";

  const nextLen = ships.length < FLEET.length ? FLEET[ships.length] : null;

  const occupiedSet = useMemo(() => {
    const set = new Set();
    for (const s of ships) for (const c of s.coords) set.add(key(c.x, c.y));
    return set;
  }, [ships]);

  useEffect(() => {
    // Same-origin by default (works for tunnel / server-served frontend)
    const origin = window.location.origin;
    const s = io(origin, { transports: ["websocket"] });
    sockRef.current = s;

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => {
      setConnected(false);
      setPlayer(null);
      setStatus(null);
      setToast("Disconnected");
    });

    s.on("roomJoined", (p) => {
      setPlayer(p);
      setToast("");
    });

    s.on("gameStatus", (st) => {
      setStatus(st);
      setToast("");
    });

    s.on("shipsPlaced", () => {
      setToast("Lodě odeslány. Čekám na soupeře…");
    });

    s.on("shotResult", (sr) => {
      // { player: socket_id_strelca, x, y, hit: true/false }
      if (!sr || sr.x == null || sr.y == null) return;
      setLastShot({ x: sr.x, y: sr.y, hit: !!sr.hit, player: sr.player });

      // Only track *our* enemy grid history here
      if (sr.player && player?.playerId && sr.player !== player.playerId) return;
      setShots((prev) => {
        const n = new Map(prev);
        n.set(key(sr.x, sr.y), sr.hit ? "hit" : "miss");
        return n;
      });
    });

    s.on("error", (e) => setToast(e?.message || String(e)));

    return () => s.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.playerId]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() === "r") setDir((d) => (d === "H" ? "V" : "H"));
      if (e.key === "Escape") setToast("");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function join() {
    const trimmed = roomId.trim();
    if (!trimmed) return setToast("Zadej roomId");
    setToast("");
    sockRef.current?.emit("joinRoom", trimmed);
=======
  const [player, setPlayer] = useState(null);
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState("");
  const [dir, setDir] = useState("H");
  const [ships, setShips] = useState([]);
  const [shots, setShots] = useState(new Map());
  const [hoveredCell, setHoveredCell] = useState(null);
  const sockRef = useRef(null);

  useEffect(() => {
    const s = io("/", { transports: ["websocket"] });
    sockRef.current = s;
    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => {
      setConnected(false);
      setPlayer(null);
      setStatus(null);
      setToast("Disconnected from server");
    });
    s.on("roomJoined", (p) => {
      setPlayer(p);
      setToast(`Joined room: ${p.roomId}`);
      setTimeout(() => setToast(""), 3000);
    });
    s.on("gameStatus", (st) => {
      setStatus(st);
    });
    s.on("shipsPlaced", () => setToast("Ships deployed. Waiting for opponent..."));
    s.on("shotResult", (sr) => {
      if (!sr || sr.x == null || sr.y == null) return;
      if (sr.player && player?.playerId && sr.player !== player.playerId) return;
      setShots((prev) => {
        const n = new Map(prev);
        n.set(key(sr.x, sr.y), sr.hit ? "hit" : "miss");
        return n;
      });
    });
    s.on("error", (e) => setToast(e?.message || String(e)));
    return () => s.close();
  }, [player?.playerId]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key.toLowerCase() === "r") setDir((d) => (d === "H" ? "V" : "H"));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const occupiedSet = useMemo(() => {
    const set = new Set();
    for (const s of ships) for (const c of s.coords) set.add(key(c.x, c.y));
    return set;
  }, [ships]);

  const phase = status?.state || "lobby";
  const yourTurn = !!(status?.turn && player?.playerId && status.turn === player.playerId);
  const canPlace = phase === "placing";
  const canPlay = phase === "playing";

  function join() {
    if (!roomId.trim()) return setToast("Enter Room ID");
    setToast("");
    sockRef.current?.emit("joinRoom", roomId.trim());
>>>>>>> Stashed changes
  }

  function clearPlacement() {
    setShips([]);
    setToast("");
  }

  function placeAt(x, y) {
    if (!canPlace || ships.length >= FLEET.length) return;
<<<<<<< Updated upstream

    const coords = buildShipCoords(nextLen, { x, y }, dir);

    if (coords.some((c) => !inBounds(c.x, c.y))) return setToast("Mimo grid");
    if (coords.some((c) => occupiedSet.has(key(c.x, c.y)))) return setToast("Kolize");

    const next = [...ships, { coords }];
    const v = validateNoTouch(next);
    if (!v.ok) return setToast(v.reason);

=======
    const len = FLEET[ships.length];
    const coords = buildShipCoords(len, { x, y }, dir);
    if (coords.some((c) => !inBounds(c.x, c.y))) return setToast("Out of bounds");
    if (coords.some((c) => occupiedSet.has(key(c.x, c.y)))) return setToast("Collision");
    const next = [...ships, { coords }];
    const v = validateNoTouch(next);
    if (!v.ok) return setToast(v.reason);
>>>>>>> Stashed changes
    setToast("");
    setShips(next);
  }

  function submitShips() {
<<<<<<< Updated upstream
    if (!player?.roomId) return setToast("Nejsi v roomce");
    if (ships.length !== FLEET.length) return setToast("Nemáš položené všechny lodě");

    const v = validateNoTouch(ships);
    if (!v.ok) return setToast(v.reason);

=======
    if (!player?.roomId) return setToast("Not in a room");
    if (ships.length !== FLEET.length) return setToast("Place all ships first");
    const v = validateNoTouch(ships);
    if (!v.ok) return setToast(v.reason);
>>>>>>> Stashed changes
    setToast("");
    sockRef.current?.emit("placeShips", { roomId: player.roomId, ships });
  }

  function fireAt(x, y) {
<<<<<<< Updated upstream
    if (!canPlay) return;
    if (!yourTurn) return setToast("Nejsi na tahu");

    const k = key(x, y);
    if (shots.has(k)) return;

    setToast("");
    sockRef.current?.emit("fireShot", { roomId: player.roomId, x, y });
  }

  const stateTone =
    phase === "finished"
      ? "danger"
      : phase === "playing"
        ? yourTurn
          ? "success"
          : ""
        : phase === "placing"
          ? "warn"
          : "";

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <div className="brand__title">Loďe</div>
          <div className="brand__sub">minimal MVP • React + Socket.io</div>
        </div>
        <div className="badges" aria-label="Game status">
          <Pill tone={connected ? "success" : "danger"}>
            {connected ? "online" : "offline"}
          </Pill>
          <Pill tone={stateTone}>state: {phase}</Pill>
          <Pill>room: {player?.roomId || "-"}</Pill>
          <Pill>side: {player?.side || "-"}</Pill>
          <Pill tone={yourTurn ? "success" : ""}>
            turn: {yourTurn ? "YOU" : "OTHER"}
          </Pill>
        </div>
      </header>

      <main className="layout">
        <aside className="panel" aria-label="Controls">
          <section className="section">
            <h2 className="h">Join</h2>
            <p className="muted">
              Zadej roomId a připoj se. Druhý hráč použije stejný roomId.
            </p>
            <div className="controls">
              <label className="field">
                <span className="field__label">roomId</span>
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="např. lobsters"
                  inputMode="text"
                  autoComplete="off"
                  aria-label="Room id"
                />
              </label>
              <button className="btn" onClick={join} disabled={!connected}>
                Join
              </button>
            </div>
          </section>

          <section className="section">
            <h2 className="h">Placement</h2>
            <p className="muted">
              Lodě: {FLEET.join(", ")}. Rotate: <kbd>R</kbd>. Žádný dotyk ani
              diagonálně.
            </p>

            <div className="controls controls--inline">
              <button
                className="btn btn--ghost"
                onClick={() => setDir((d) => (d === "H" ? "V" : "H"))}
              >
                Rotate ({dir})
              </button>
              <button
                className="btn btn--ghost"
                onClick={clearPlacement}
                disabled={!canPlace}
              >
                Clear
              </button>
              <button
                className="btn"
                onClick={submitShips}
                disabled={!canPlace || ships.length !== FLEET.length}
              >
                Submit
              </button>
            </div>

            <div className="meta">
              <Pill tone={ships.length === FLEET.length ? "success" : ""}>
                ships: {ships.length}/{FLEET.length}
              </Pill>
              <Pill>next: {nextLen ?? "done"}</Pill>
              <Pill>R: {dir}</Pill>
            </div>

            <div className="legend" aria-label="Legend">
              <span className="legend__item">
                <span className="swatch swatch--ship" /> ship
              </span>
              <span className="legend__item">
                <span className="swatch swatch--hit" /> hit
              </span>
              <span className="legend__item">
                <span className="swatch swatch--miss" /> miss
              </span>
            </div>

            {toast ? (
              <div className="toast" role="status" aria-live="polite">
                <div className="toast__text">{toast}</div>
                <button
                  className="toast__x"
                  onClick={() => setToast("")}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            ) : null}

            {phase === "finished" ? (
              <div className="callout callout--finish" role="status">
                Winner: <b>{status?.winner}</b>
              </div>
            ) : null}
          </section>

          <section className="section">
            <h2 className="h">Last shot</h2>
            <p className="muted">
              {lastShot
                ? `${lastShot.player === player?.playerId ? "You" : "Opponent"} @ ${lastShot.x},${lastShot.y} → ${lastShot.hit ? "HIT" : "MISS"}`
                : "—"}
            </p>
          </section>
        </aside>

        <section className="boards" aria-label="Boards">
          <div className="board">
            <div className="board__head">
              <h2 className="h">Your board</h2>
              <span className="muted">click to place</span>
            </div>
            <div className="grid" role="grid" aria-label="Your grid">
              {Array.from({ length: SIZE * SIZE }).map((_, i) => {
                const x = i % SIZE;
                const y = Math.floor(i / SIZE);
                const isShip = occupiedSet.has(key(x, y));
                return (
                  <button
                    key={i}
                    className={"cell " + (isShip ? "ship" : "")}
                    onClick={() => placeAt(x, y)}
                    disabled={!canPlace}
                    aria-label={`Your cell ${x},${y}`}
                    title={`${x},${y}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="board">
            <div className="board__head">
              <h2 className="h">Enemy board</h2>
              <span className="muted">click to shoot</span>
            </div>
            <div
              className={"grid " + (canPlay ? "" : "grid--dim")}
              role="grid"
              aria-label="Enemy grid"
            >
              {Array.from({ length: SIZE * SIZE }).map((_, i) => {
                const x = i % SIZE;
                const y = Math.floor(i / SIZE);
                const r = shots.get(key(x, y));
                const cls = [
                  "cell",
                  "enemy",
                  r === "hit" ? "hit" : r === "miss" ? "miss" : "",
                ].join(" ");
                const disabled = !canPlay || !yourTurn || !!r;

                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => fireAt(x, y)}
                    disabled={disabled}
                    aria-label={`Enemy cell ${x},${y}`}
                    title={disabled ? "" : `${x},${y}`}
                  />
                );
              })}
            </div>
            {!canPlay ? (
              <div className="hint">Battle starts after both players submit ships.</div>
            ) : null}
            {canPlay && !yourTurn ? <div className="hint">Waiting for opponent…</div> : null}
          </div>
        </section>
      </main>
=======
    if (!canPlay || !yourTurn) return;
    const k = key(x, y);
    if (shots.has(k)) return;
    sockRef.current?.emit("fireShot", { roomId: player.roomId, x, y });
  }

  const previewCoords = useMemo(() => {
    if (!canPlace || ships.length >= FLEET.length || !hoveredCell) return [];
    const len = FLEET[ships.length];
    return buildShipCoords(len, hoveredCell, dir);
  }, [canPlace, ships.length, hoveredCell, dir]);

  const isPreviewValid = useMemo(() => {
    if (previewCoords.length === 0) return true;
    if (previewCoords.some((c) => !inBounds(c.x, c.y))) return false;
    const next = [...ships, { coords: previewCoords }];
    return validateNoTouch(next).ok;
  }, [previewCoords, ships]);

  return (
    <div className="wrap">
      <header className="header">
        <div className="title">BATTLESHIPS</div>
        <div className="status-bar">
          <div className={`pill ${connected ? "active" : ""}`}>
            {connected ? "Online" : "Offline"}
          </div>
          {player?.roomId && <div className="pill">Room: {player.roomId}</div>}
          {player?.side && <div className="pill">Side: {player.side}</div>}
          {yourTurn && canPlay && <div className="pill your-turn">Your Turn</div>}
          {!yourTurn && canPlay && <div className="pill">Opponent's Turn</div>}
        </div>
      </header>

      {phase === "finished" && (
        <div className="turn-banner">
          Winner: {status?.winner === player?.side ? "YOU" : "OPPONENT"}
        </div>
      )}

      {canPlay && !status?.winner && (
        <div className="turn-banner" style={{ color: yourTurn ? "var(--accent)" : "var(--text-muted)" }}>
          {yourTurn ? "Your turn to strike" : "Awaiting opponent's move"}
        </div>
      )}

      <main className="game-area">
        <div className="board-container">
          <div className="board-label">Your Fleet</div>
          <div className="grid">
            {Array.from({ length: 100 }).map((_, i) => {
              const x = i % 10, y = Math.floor(i / 10);
              const isShip = occupiedSet.has(key(x, y));
              const isPreview = previewCoords.some(c => c.x === x && c.y === y);
              
              let className = "cell";
              if (isShip) className += " ship";
              if (isPreview) className += isPreviewValid ? " preview" : " preview-invalid";

              return (
                <div
                  key={i}
                  className={className}
                  onClick={() => placeAt(x, y)}
                  onMouseEnter={() => setHoveredCell({ x, y })}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              );
            })}
          </div>
          {canPlace && (
            <div className="ship-indicator">
              {FLEET.map((len, idx) => (
                <div 
                  key={idx} 
                  className={`ship-dot ${ships.length > idx ? "placed" : ""}`}
                  title={`Ship length: ${len}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className={`board-container ${!canPlay && "hidden"}`}>
          <div className="board-label">Enemy Waters</div>
          <div className="grid">
            {Array.from({ length: 100 }).map((_, i) => {
              const x = i % 10, y = Math.floor(i / 10);
              const r = shots.get(key(x, y));
              return (
                <div
                  key={i}
                  className={`cell enemy ${r || ""}`}
                  onClick={() => fireAt(x, y)}
                />
              );
            })}
          </div>
        </div>
      </main>

      <footer className="controls">
        {phase === "lobby" && (
          <div className="join-form">
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
            />
            <button className="primary" onClick={join}>Join Game</button>
          </div>
        )}

        {canPlace && (
          <>
            <button onClick={() => setDir(d => d === "H" ? "V" : "H")}>
              Rotate (R)
            </button>
            <button onClick={clearPlacement}>Reset</button>
            <button 
              className="primary" 
              onClick={submitShips} 
              disabled={ships.length !== FLEET.length}
            >
              Deploy Fleet
            </button>
          </>
        )}
        
        {phase === "finished" && (
          <button className="primary" onClick={() => window.location.reload()}>
            Play Again
          </button>
        )}
      </footer>

      {toast && <div className="toast">{toast}</div>}
>>>>>>> Stashed changes
    </div>
  );
}
