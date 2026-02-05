import React, { useEffect } from 'react';

const LS_KEY = 'donutduel:tutorialSeen';

export function hasSeenTutorial() {
  try {
    return window.localStorage.getItem(LS_KEY) === '1';
  } catch {
    return false;
  }
}

export function markTutorialSeen() {
  try {
    window.localStorage.setItem(LS_KEY, '1');
  } catch {
    // ignore
  }
}

export default function TutorialOverlay({ open, onClose }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dd-tutorial-backdrop" role="dialog" aria-modal="true" aria-label="Tutorial">
      <div className="dd-tutorial-card">
        <div className="dd-tutorial-title">Jak hrát Donut Duel</div>
        <ol className="dd-tutorial-list">
          <li>Hýbej se šipkami ⬆️⬇️⬅️➡️</li>
          <li>Sbírej 🍩 a 💰 (dotace)</li>
          <li>Shop: BOOST (20🍩), ŠTÍT (30🍩)</li>
          <li>Eventy: AUDIT / EET_BONUS / ČERPÁNÍ</li>
          <li>ESC zavře tutorial</li>
        </ol>
        <div style={{ marginTop: 10, opacity: 0.9 }}>
          Ak neuvidíte dotačný rast, makajte 18 hodín denne ako my!
        </div>
        <div className="dd-tutorial-actions">
          <button
            className="btn-premium-shop"
            onClick={() => {
              markTutorialSeen();
              onClose?.();
            }}
          >
            Rozumím
          </button>
        </div>
      </div>
    </div>
  );
}
