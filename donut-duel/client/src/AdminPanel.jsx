import React from 'react';

function isAdminEnabled() {
  // Vite exposes only VITE_* env vars.
  const enableByEnv = import.meta?.env?.VITE_ENABLE_ADMIN === '1';
  const enableByDev = import.meta?.env?.DEV === true;
  return enableByDev || enableByEnv;
}

export default function AdminPanel({ socket, open }) {
  if (!isAdminEnabled()) return null;
  if (!open) return null;

  const emit = (type) => {
    try {
      socket?.emit('adminEvent', type);
    } catch {
      // ignore
    }
  };

  return (
    <div className="dd-admin-panel">
      <div className="dd-admin-title">DEV Admin</div>
      <div className="dd-admin-buttons">
        <button className="dd-admin-btn" onClick={() => emit('AUDIT')}>AUDIT</button>
        <button className="dd-admin-btn" onClick={() => emit('EET_BONUS')}>EET_BONUS</button>
        <button className="dd-admin-btn" onClick={() => emit('CERPANI')}>CERPANI</button>
      </div>
      <div className="dd-admin-hint">
        Toggle: klikni na titul <code>Donut Duel</code>. Viditelné jen v <code>DEV</code> nebo s <code>VITE_ENABLE_ADMIN=1</code>.
      </div>
    </div>
  );
}
