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
  const occupied = new Set();
  for (const s of allShips) {
    for (const c of s.coords) {
      if (!inBounds(c.x, c.y)) return { ok: false, reason: "Out of bounds" };
      const k = key(c.x, c.y);
      if (occupied.has(k)) return { ok: false, reason: "Overlapping ships" };
      occupied.add(k);
    }
  }
  for (const s of allShips) {
    for (const c of s.coords) {
      for (const [nx, ny] of neighbors8(c.x, c.y)) {
        if (!inBounds(nx, ny)) continue;
        const nk = key(nx, ny);
        if (occupied.has(nk) && !s.coords.some((cc) => cc.x === nx && cc.y === ny)) {
          return { ok: false, reason: "Ships cannot touch (including diagonally)" };
        }
      }
    }
  }
  return { ok: true };
}

export default function App() {
  const [roomId, setRoomId] = useState("");
  const [connected, setConnected] = useState(false);
  const [player, setPlayer] = useState(null);
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState("");
  const [dir, setDir] = useState("H");
  const [ships, setShips] = useState([]);
  const [shots, setShots] = useState(new Map());
  const [hoveredCell, setHoveredCell] = useState(null);
  const sockRef = useRef(null);

  useEffect(() => {
    const origin = window.location.origin;
    const s = io(origin, { transports: ["websocket"] });
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
  }

  function clearPlacement() {
    setShips([]);
    setToast("");
  }

  function placeAt(x, y) {
    if (!canPlace || ships.length >= FLEET.length) return;
    const len = FLEET[ships.length];
    const coords = buildShipCoords(len, { x, y }, dir);
    if (coords.some((c) => !inBounds(c.x, c.y))) return setToast("Out of bounds");
    if (coords.some((c) => occupiedSet.has(key(c.x, c.y)))) return setToast("Collision");
    const next = [...ships, { coords }];
    const v = validateNoTouch(next);
    if (!v.ok) return setToast(v.reason);
    setToast("");
    setShips(next);
  }

  function submitShips() {
    if (!player?.roomId) return setToast("Not in a room");
    if (ships.length !== FLEET.length) return setToast("Place all ships first");
    const v = validateNoTouch(ships);
    if (!v.ok) return setToast(v.reason);
    setToast("");
    sockRef.current?.emit("placeShips", { roomId: player.roomId, ships });
  }

  function fireAt(x, y) {
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
          Winner: {status?.winner === player?.playerId ? "YOU" : "OPPONENT"}
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
    </div>
  );
}
