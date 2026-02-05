function lobby(state) {
  const COST = 10_000_000;
  const WIN_REWARD = 50_000_000;

  if ((state.budget ?? 0) < COST) {
    return "Nedostatek peněz na lobbyování! Musíme víc makat!";
  }

  state.budget -= COST;

  const win = Math.random() < 0.5;

  if (win) {
    state.budget += WIN_REWARD;
    if (typeof state.popularity === "number") state.popularity += 5;
    return "ÚSPĚCH! Vylobbovali jsme 50 mega dotací! Bruselu jsme to vysvětlili!";
  }

  state.budget -= 5_000_000; 
  if (typeof state.popularity === "number") state.popularity -= 10;

  return "KATASTROFA! Poslali na nás audit! Kampaň!";
}

module.exports = { lobby };
