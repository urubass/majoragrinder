// BinaryProtocol.js - Efektivní přenos pozic a Delta Kompresia
// Tento protokol šetrí dotačné bajty a maximalizuje rýchlosť v aréne.

/**
 * Zabalí pozíciu hráča do binárneho bufferu (4 bajty).
 */
export const packPosition = (x, y) => {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint16(0, Math.round(x));
  view.setUint16(2, Math.round(y));
  return buffer;
};

/**
 * Zabalí DELTU (zmenu) pozície (2 bajty).
 * Používame Int8, aby sme pokryli zmeny od -128 do 127 pixelov.
 */
export const packDelta = (dx, dy) => {
  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);
  view.setInt8(0, Math.round(dx));
  view.setInt8(1, Math.round(dy));
  return buffer;
};

/**
 * Rozbalí deltu z binárneho bufferu.
 */
export const unpackDelta = (buffer) => {
  const view = new DataView(buffer);
  return {
    dx: view.getInt8(0),
    dy: view.getInt8(1)
  };
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
