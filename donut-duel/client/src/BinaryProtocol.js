// BinaryProtocol.js - Efektivní přenos pozic pro Donut Duel
// Tento protokol šetrí dotačné bajty a znižuje latenciu na minimum.

/**
 * Zabalí pozíciu hráča do binárneho bufferu (8 bajtov).
 * [0-1] short: ID dĺžka (ak by sme chceli string, ale tu používame socket.id, tak zatiaľ len fixné)
 * [2-3] short: X súradnica
 * [4-5] short: Y súradnica
 * [6-7] reserve
 */
export const packPosition = (x, y) => {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint16(0, Math.round(x));
  view.setUint16(2, Math.round(y));
  return buffer;
};

/**
 * Rozbalí pozíciu z binárneho bufferu.
 */
export const unpackPosition = (buffer) => {
  const view = new DataView(buffer);
  return {
    x: view.getUint16(0),
    y: view.getUint16(2)
  };
};
