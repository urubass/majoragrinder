// Empire Crisis event engine for Donut Sim
// Exports: rollEvent(state) -> { happened, event, state }

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const EVENTS = [
  {
    id: 'eu-inspection',
    name: 'Inspekcia z Bruselu',
    desc: 'Kontrola z EU. Papierova vojna a krátenie dotácií.',
    apply: (s) => ({ ...s, budget: s.budget - 5_000_000, popularity: s.popularity - 5 }),
  },
  {
    id: 'pruhonice-leak',
    name: 'Únik z Průhonic',
    desc: 'Niekto ťa cvakol s cudzím rožkom. Internet horí.',
    apply: (s) => ({ ...s, popularity: s.popularity - 15 }),
  },
  {
    id: 'tradicional-protest',
    name: 'Protest tradičníkov',
    desc: 'Kalousek reve na námestí. Billboardy musia ísť.',
    apply: (s) => ({ ...s, budget: s.budget - 1_000_000, popularity: s.popularity - 2 }),
  },
  {
    id: 'penam-strike',
    name: 'Štrajk v Pename',
    desc: 'Pekári chcú viac. Nepečie sa.',
    apply: (s) => ({ ...s, inventory: s.inventory - 5000, popularity: s.popularity - 3 }),
  },
  {
    id: 'butterfly-invasion',
    name: 'Motýle invázia',
    desc: 'Zázrak! Motýle všade. Národ v eufórii.',
    apply: (s) => ({ ...s, popularity: s.popularity + 20, budget: s.budget - 500_000 }),
  },
  {
    id: 'helicopter-pruhonice',
    name: 'Vrtuľník nad Průhonicemi',
    desc: 'Novinári šmírujú z výšky. Právnici stoja peniaze.',
    apply: (s) => ({ ...s, popularity: s.popularity - 5, budget: s.budget - 2_000_000 }),
  },
  {
    id: 'record-rapeseed-harvest',
    name: 'Rekordná žatva repky',
    desc: 'Pole dalo maximum. Penam ide naplno.',
    apply: (s) => ({ ...s, popularity: s.popularity + 6, inventory: s.inventory + 2000 }),
  },
];

function normalizeState(state) {
  return {
    ...state,
    inventory: Math.max(0, Math.floor(state.inventory ?? 0)),
    budget: Math.max(0, Math.floor(state.budget ?? 0)),
    popularity: clamp(Math.round(state.popularity ?? 0), 0, 100),
    day: Math.max(1, Math.floor(state.day ?? 1)),
  };
}

function rollEvent(state, opts = {}) {
  const chance = typeof opts.chance === 'number' ? opts.chance : 0.35;
  const happened = Math.random() < chance;
  const base = normalizeState(state);
  if (!happened) return { happened: false, event: null, state: base };

  const event = pick(EVENTS);
  const next = normalizeState(event.apply(base));
  return { happened: true, event, state: next };
}

module.exports = {
  EVENTS,
  rollEvent,
};
