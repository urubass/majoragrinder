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
if (!inBounds(c.x, c.y)) return { ok: false, reason: "Mimo grid" };
const k = key(c.x, c.y);
if (occupied.has(k)) return { ok: false, reason: "Překryv lodí" };
occupied.add(k);
}
}
for (const s of allShips) {
for (const c of s.coords) {
for (const [nx, ny] of neighbors8(c.x, c.y)) {
if (!inBounds(nx, ny)) continue;
const nk = key(nx, ny);
if (occupied.has(nk) && !s.coords.some((cc) => cc.x === nx && cc.y === ny)) {
return { ok: false, reason: "Lodě se nesmí dotýkat (ani diagonálně)" };
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
const sockRef = useRef(null);

useEffect(() => {
const s = io("http://127.0.0.1:3001", { transports: ["websocket"] });
sockRef.current = s;
s.on("connect", () => setConnected(true));
s.on("disconnect", () => { setConnected(false); setPlayer(null); setStatus(null); setToast("disconnect"); });
s.on("roomJoined", (p) => { setPlayer(p); setToast(""); });
s.on("gameStatus", (st) => { setStatus(st); setToast(""); });
s.on("shipsPlaced", () => setToast("Server přijal lodě. Čekám na soupeře…"));
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
const handler = (e) => { if (e.key.toLowerCase() === "r") setDir((d) => (d === "H" ? "V" : "H")); };
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

function join() { if (!roomId.trim()) return setToast("Zadej roomId"); setToast(""); sockRef.current?.emit("joinRoom", roomId.trim()); }
function clearPlacement() { setShips([]); setToast(""); }
function placeAt(x, y) {
if (!canPlace || ships.length >= FLEET.length) return;
const len = FLEET[ships.length];
const coords = buildShipCoords(len, { x, y }, dir);
if (coords.some((c) => !inBounds(c.x, c.y))) return setToast("Mimo grid");
if (coords.some((c) => occupiedSet.has(key(c.x, c.y)))) return setToast("Kolize");
const next = [...ships, { coords }];
const v = validateNoTouch(next);
if (!v.ok) return setToast(v.reason);
setToast(""); setShips(next);
}
function submitShips() {
if (!player?.roomId) return setToast("Nejsi v roomce");
if (ships.length !== FLEET.length) return setToast("Nemáš položené všechny lodě");
const v = validateNoTouch(ships);
if (!v.ok) return setToast(v.reason);
setToast(""); sockRef.current?.emit("placeShips", { roomId: player.roomId, ships });
}
function fireAt(x, y) {
if (!canPlay || !yourTurn) return;
const k = key(x, y);
if (shots.has(k)) return;
setToast(""); sockRef.current?.emit("fireShot", { roomId: player.roomId, x, y });
}

return (
<div className="wrap">
<div className="status card">
<div className="pill">socket: {connected ? "connected" : "offline"}</div>
<div className="pill">room: {player?.roomId || "-"}</div>
<div className="pill">side: {player?.side || "-"}</div>
<div className="pill">state: {String(phase)}</div>
<div className="pill">turn: {yourTurn ? "YOU" : "OTHER"}</div>
<div className="pill">rotate: R ({dir})</div>
{phase === "finished" ? <div className="pill">winner: {status?.winner}</div> : null}
</div>
<div className="row">
<div class="card" style={{flex:"1 1 340px"}}>
<div className="h">1) Join room</div>
<input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="roomId" />
<button onClick={join}>Join</button>
{toast && <div className="toast">{toast}</div>}
</div>
<div class="card" style={{flex:"1 1 420px"}}>
<div className="h">2) Moje pole</div>
<button onClick={() => setDir(d => d==="H"?"V":"H")}>Rotate (R)</button>
<button onClick={clearPlacement}>Clear</button>
<button onClick={submitShips} disabled={ships.length !== FLEET.length || !canPlace}>Submit</button>
<div className="grid">
{Array.from({length:100}).map((_,i)=>{
const x=i%10, y=Math.floor(i/10);
return <div key={i} className={"cell "+(occupiedSet.has(key(x,y))?"ship":"")} onClick={()=>placeAt(x,y)} />
})}
</div>
</div>
<div class="card" style={{flex:"1 1 420px"}}>
<div className="h">3) Enemy pole</div>
<div className="grid">
{Array.from({length:100}).map((_,i)=>{
const x=i%10, y=Math.floor(i/10);
const r=shots.get(key(x,y));
return <div key={i} className={"cell enemy "+(r?r:"")} onClick={()=>fireAt(x,y)} />
})}
</div>
</div>
</div>
</div>
);
}
