// AudioManager.js - Clean logic for Sound UX
const sounds = {
  collect: new Audio('/sounds/collect.mp3'),
  boost: new Audio('/sounds/boost.mp3'),
  kampan: new Audio('/sounds/kampan.mp3')
};

// Ensure sounds are preloaded and volumes are set
Object.values(sounds).forEach(s => {
  s.preload = 'auto';
});

sounds.kampan.loop = true;

export const playSound = (name) => {
  const s = sounds[name];
  if (s) {
    if (name === 'kampan') {
      if (s.paused) s.play().catch(() => {});
    } else {
      // For short sounds, clone to allow overlapping
      const clone = s.cloneNode();
      clone.play().catch(() => {});
    }
  }
};

export const stopSound = (name) => {
  const s = sounds[name];
  if (s) {
    s.pause();
    s.currentTime = 0;
  }
};
