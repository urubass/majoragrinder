const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'memory', 'donut_state.json');

function loadState(defaultState) {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading state:', err);
  }
  return defaultState;
}

function saveState(state) {
  try {
    // Ensure memory directory exists
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

module.exports = { loadState, saveState };
