// BinaryWorker.js - Multi-threaded binary packet processing
// Tento worker spracováva dotačné bajty na pozadí, aby UI vlákno mohlo svietiť.

self.onmessage = (e) => {
  const { type, buffer } = e.data;

  if (type === 'UNPACK_POSITION') {
    const view = new DataView(buffer);
    const x = view.getUint16(0);
    const y = view.getUint16(2);
    
    // Poslať výsledok späť do UI vlákna
    self.postMessage({ type: 'POSITION_UNPACKED', x, y });
  }
};
