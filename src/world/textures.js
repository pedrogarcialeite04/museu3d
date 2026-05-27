import { THREE } from '../core/three.js';

/** Materiais do mapa — preenchidos por initWorldMaterials() após o renderer existir */
export const materials = {
  asphalt: null,
  sidewalk: null,
  brickA: null,
  brickB: null,
  facadeA: null,
  facadeB: null,
  roof: null,
  metal: null,
  concrete: null,
  barrier: null,
  carDark: null,
  neon: null,
  windowLit: null,
};

let _maxAnisotropy = 1;

function canvasTex(w, h, drawFn) {
  const cvs = document.createElement('canvas');
  cvs.width = w;
  cvs.height = h;
  drawFn(cvs.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = _maxAnisotropy;
  return tex;
}

function makeAsphaltTexture(size) {
  return canvasTex(size, size, (ctx, s) => {
    const bg = ctx.createRadialGradient(s * 0.5, s * 0.5, 0, s * 0.5, s * 0.5, s * 0.72);
    bg.addColorStop(0, '#3a4048');
    bg.addColorStop(0.55, '#32383f');
    bg.addColorStop(1, '#2a3038');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 7000; i++) {
      const g = 48 + Math.random() * 28;
      ctx.fillStyle = `rgba(${g},${g},${g + 6},${0.03 + Math.random() * 0.07})`;
      const r = 0.6 + Math.random() * 1.8;
      ctx.beginPath();
      ctx.arc(Math.random() * s, Math.random() * s, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.setLineDash([28, 22]);
    ctx.beginPath();
    ctx.moveTo(s / 2, 0);
    ctx.lineTo(s / 2, s);
    ctx.stroke();
    ctx.setLineDash([14, 18]);
    ctx.strokeStyle = 'rgba(220,200,80,0.5)';
    ctx.beginPath();
    ctx.moveTo(s / 2 - 8, 0);
    ctx.lineTo(s / 2 - 8, s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s / 2 + 8, 0);
    ctx.lineTo(s / 2 + 8, s);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, s - 8, s - 8);
  });
}

function makeSidewalkTexture(size) {
  return canvasTex(size, size, (ctx, s) => {
    ctx.fillStyle = '#6a7078';
    ctx.fillRect(0, 0, s, s);
    const tile = s / 8;
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 8; x++) {
      for (let y = 0; y <= 8; y++) {
        ctx.strokeRect(x * tile + 1, y * tile + 1, tile - 2, tile - 2);
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let i = 0; i < 600; i++) ctx.fillRect(Math.random() * s, Math.random() * s, 1, 1);
  });
}

function makeBrickTexture(size, base, mortar) {
  return canvasTex(size, size, (ctx, s) => {
    ctx.fillStyle = mortar;
    ctx.fillRect(0, 0, s, s);
    const bw = s / 6;
    const bh = s / 12;
    for (let row = 0; row < 12; row++) {
      const off = (row & 1) ? bw / 2 : 0;
      for (let col = -1; col < 7; col++) {
        const shade = base + Math.floor(Math.random() * 18 - 9);
        ctx.fillStyle = `rgb(${shade},${shade - 8},${shade - 14})`;
        ctx.fillRect(col * bw + off + 2, row * bh + 2, bw - 4, bh - 4);
      }
    }
  });
}

function makeFacadeTexture(size, wallHex, litChance) {
  return canvasTex(size, size, (ctx, s) => {
    const base = new THREE.Color(wallHex);
    ctx.fillStyle = '#' + base.getHexString();
    ctx.fillRect(0, 0, s, s);
    const cols = 6;
    const rows = 10;
    const cw = s / cols;
    const ch = s / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = Math.random() < litChance;
        ctx.fillStyle = lit ? 'rgba(255,220,140,0.85)' : 'rgba(20,28,40,0.9)';
        ctx.fillRect(c * cw + 5, r * ch + 6, cw - 10, ch - 12);
        if (lit) {
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(c * cw + 8, r * ch + 8, cw - 16, 4);
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(c * cw + 4, r * ch + 5, cw - 8, ch - 10);
      }
    }
  });
}

function makeMetalTexture(size) {
  return canvasTex(size, size, (ctx, s) => {
    const g = ctx.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, '#8a95a5');
    g.addColorStop(0.5, '#b8c0cc');
    g.addColorStop(1, '#6a7585');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * s / 6);
      ctx.lineTo(s, i * s / 6);
      ctx.stroke();
    }
  });
}

/**
 * Deve ser chamado depois de initScene() — o renderer precisa existir para anisotropy.
 */
export function initWorldMaterials(webglRenderer) {
  if (!webglRenderer) {
    throw new Error('initWorldMaterials: renderer não inicializado');
  }
  _maxAnisotropy = webglRenderer.capabilities.getMaxAnisotropy();

  const texAsphalt = makeAsphaltTexture(512);
  texAsphalt.repeat.set(14, 14);
  const texSidewalk = makeSidewalkTexture(256);
  texSidewalk.repeat.set(8, 8);
  const texBrickA = makeBrickTexture(256, 95, '#4a4e54');
  texBrickA.repeat.set(2, 4);
  const texBrickB = makeBrickTexture(256, 72, '#3a3e44');
  texBrickB.repeat.set(2, 4);
  const texFacadeA = makeFacadeTexture(256, 0x5a6478, 0.42);
  texFacadeA.repeat.set(1, 3);
  const texFacadeB = makeFacadeTexture(256, 0x4a5568, 0.28);
  texFacadeB.repeat.set(1, 3);
  const texMetal = makeMetalTexture(128);
  texMetal.repeat.set(1, 1);
  const texRoof = makeBrickTexture(128, 55, '#2a2e34');
  texRoof.repeat.set(3, 2);

  const std = (opts) => new THREE.MeshStandardMaterial({
    roughness: 0.72,
    metalness: 0.08,
    ...opts,
  });

  materials.asphalt = std({ map: texAsphalt, color: 0xb8bcc4, roughness: 0.82, metalness: 0.06 });
  materials.sidewalk = std({ map: texSidewalk, color: 0xc4cad2, roughness: 0.78, metalness: 0.04 });
  materials.brickA = std({ map: texBrickA, color: 0x9a8a7a, roughness: 0.88 });
  materials.brickB = std({ map: texBrickB, color: 0x7a8a9a, roughness: 0.86 });
  materials.facadeA = std({ map: texFacadeA, color: 0x8a94a8, roughness: 0.55 });
  materials.facadeB = std({ map: texFacadeB, color: 0x7a8498, roughness: 0.55 });
  materials.roof = std({ map: texRoof, color: 0x4a5058, roughness: 0.62, metalness: 0.35 });
  materials.metal = std({ map: texMetal, color: 0xaab0bc, roughness: 0.35, metalness: 0.75 });
  materials.concrete = std({ color: 0x7a8088, roughness: 0.9 });
  materials.barrier = std({ color: 0xd4a020, roughness: 0.5, metalness: 0.2 });
  materials.carDark = std({ color: 0x1a1e24, roughness: 0.4, metalness: 0.6 });
  materials.neon = std({
    color: 0xff6633,
    emissive: 0xff4422,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  });
  materials.windowLit = std({
    color: 0xffe8a0,
    emissive: 0xffd080,
    emissiveIntensity: 0.35,
    roughness: 0.2,
  });
}
