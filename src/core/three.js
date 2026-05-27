/** Re-export global Three.js loaded via script tag in index.html */
export const THREE = globalThis.THREE;

export function assertThreeLoaded() {
  if (!THREE) {
    throw new Error('Three.js não carregou. Confira se existe lib/three.min.js na pasta do projeto.');
  }
}
