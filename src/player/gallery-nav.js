import { PLAYER, CITY } from '../config/constants.js';
import { player } from '../state/game.js';
import { resetMoveStick } from './move-stick.js';
import { input } from '../state/game.js';
import { updatePlayerBox } from './collision.js';
import { addNamePlateAtFace } from '../world/project-building.js';

export const PROJECT_BUILDINGS = [
  { name: 'Cheques', image: 'img/cheques.png', x: -750, z: -620, w: 200, d: 170, floors: 6 },
  { name: 'Devero', image: 'img/devero.jpeg', x: -250, z: -620, w: 190, d: 180, floors: 5 },
  { name: 'Foco', image: 'img/foco.png', x: 250, z: -620, w: 210, d: 175, floors: 7 },
  { name: 'PGFlow', image: 'img/pgflow.png', x: 750, z: -620, w: 200, d: 180, floors: 6 },
  { name: 'Posto', image: 'img/posto.png', x: -750, z: -120, w: 185, d: 165, floors: 5 },
  { name: 'Robô', image: 'img/robo.jpg', x: -250, z: -120, w: 195, d: 170, floors: 6 },
  { name: 'TheGadu', image: 'img/thegadu.png', x: 250, z: -120, w: 205, d: 180, floors: 7 },
  { name: 'Theze', image: 'img/theze.png', x: 750, z: -120, w: 200, d: 175, floors: 8 },
  { name: 'Topografia', image: 'img/topografia.png', x: -750, z: 380, w: 200, d: 170, floors: 6 },
  { name: 'Valquíria', image: 'img/valquiria.png', x: -250, z: 380, w: 190, d: 175, floors: 5 },
  { name: 'Venda', image: 'img/venda.png', x: 250, z: 380, w: 195, d: 165, floors: 5 },
  {
    name: 'Pedroca',
    image: 'img/Gemini_Generated_Image_rluay3rluay3rlua-removebg-preview.png',
    x: 750,
    z: 380,
    w: 200,
    d: 170,
    floors: 6,
  },
];

const VIEW_DIST = 162;
const VIEW_DIST_MIN = 92;
const FACADE_INSET = 10;
const BUILD_PAD = 10;
const PLAYER_PAD = 14;

export const GALLERY = {
  enabled: true,
  stations: [],
  index: -1,
  transitioning: false,
  t: 0,
  duration: 1.35,
  scrollCooldown: 0,
  scrollGap: 0.42,
  from: { x: 0, y: 0.22, z: 0, yaw: 0, pitch: 0 },
  to: { x: 0, y: 0.22, z: 0, yaw: 0, pitch: 0 },
};

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

function buildingFootprint(def, pad = BUILD_PAD) {
  const hw = def.w * 0.5 + pad;
  const hd = def.d * 0.5 + pad;
  return {
    minX: def.x - hw,
    maxX: def.x + hw,
    minZ: def.z - hd,
    maxZ: def.z + hd,
  };
}

function playerFootprint(px, pz) {
  const r = PLAYER.radius + PLAYER_PAD;
  return {
    minX: px - r,
    maxX: px + r,
    minZ: pz - r,
    maxZ: pz + r,
  };
}

function fpOverlap2d(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

function sideCandidate(def, face, dist) {
  const { x: cx, z: cz, w, d } = def;
  const inset = FACADE_INSET;
  switch (face) {
    case 'south':
      return { face, px: cx, pz: cz + d * 0.5 + inset + dist, lookX: cx, lookZ: cz };
    case 'north':
      return { face, px: cx, pz: cz - d * 0.5 - inset - dist, lookX: cx, lookZ: cz };
    case 'east':
      return { face, px: cx + w * 0.5 + inset + dist, pz: cz, lookX: cx, lookZ: cz };
    case 'west':
      return { face, px: cx - w * 0.5 - inset - dist, pz: cz, lookX: cx, lookZ: cz };
    default:
      return null;
  }
}

function isPositionClear(px, pz, selfFp, otherFps) {
  const pf = playerFootprint(px, pz);
  if (fpOverlap2d(pf, selfFp)) return false;
  for (let i = 0; i < otherFps.length; i++) {
    if (fpOverlap2d(pf, otherFps[i])) return false;
  }
  return true;
}

function pickGalleryView(def, allDefs) {
  const selfFp = buildingFootprint(def);
  const otherFps = [];
  for (let i = 0; i < allDefs.length; i++) {
    if (allDefs[i] === def) continue;
    otherFps.push(buildingFootprint(allDefs[i]));
  }

  const spawnDX = PLAYER.spawn.x - def.x;
  const spawnDZ = PLAYER.spawn.z - def.z;
  const faces = ['south', 'north', 'east', 'west'];
  let best = null;
  let bestScore = -Infinity;

  for (let f = 0; f < faces.length; f++) {
    const face = faces[f];
    for (let dist = VIEW_DIST; dist >= VIEW_DIST_MIN; dist -= 18) {
      const c = sideCandidate(def, face, dist);
      if (!c || !isPositionClear(c.px, c.pz, selfFp, otherFps)) continue;

      const vX = c.px - def.x;
      const vZ = c.pz - def.z;
      const align = spawnDX * vX + spawnDZ * vZ;
      const score = align + dist * 0.15;
      if (score > bestScore) {
        bestScore = score;
        best = { ...c, dist };
      }
      break;
    }
  }

  if (!best) {
    best = sideCandidate(def, 'south', VIEW_DIST_MIN);
  }
  return best;
}

function computeGalleryStation(def, allDefs) {
  const view = pickGalleryView(def, allDefs);
  const h = def.floors * CITY.floorH;
  const py = PLAYER.spawn.y;
  const eyeY = py + PLAYER.eyeStanding;
  const signY = h + 38;
  const facadeMidY = h * 0.42;
  const dx = view.lookX - view.px;
  const dz = view.lookZ - view.pz;
  const horiz = Math.hypot(dx, dz) || 1;
  const yaw = Math.atan2(-dx, -dz);
  const pitchSign = Math.atan2(signY - eyeY, horiz);
  const pitchFacade = Math.atan2(facadeMidY - eyeY, horiz);
  let pitch = pitchSign * 0.55 + pitchFacade * 0.45;
  if (pitch < 0.06) pitch = 0.06;
  if (pitch > 0.3) pitch = 0.3;
  return {
    name: def.name,
    x: view.px,
    y: py,
    z: view.pz,
    yaw,
    pitch,
    face: view.face,
  };
}

export function buildGalleryStations() {
  const defs = PROJECT_BUILDINGS.slice().sort((a, b) => {
    if (b.z !== a.z) return b.z - a.z;
    return a.x - b.x;
  });
  GALLERY.stations.length = 0;
  for (let i = 0; i < defs.length; i++) {
    GALLERY.stations.push(computeGalleryStation(defs[i], PROJECT_BUILDINGS));
  }
}

function getGalleryStation(idx) {
  if (idx < 0 || idx >= GALLERY.stations.length) return null;
  return GALLERY.stations[idx];
}

export function getGalleryLabel() {
  if (GALLERY.transitioning) return 'Indo…';
  if (GALLERY.index < 0) return 'Lobby';
  const st = getGalleryStation(GALLERY.index);
  return st ? st.name : 'Lobby';
}

export function snapGalleryPose(idx) {
  if (idx < 0) {
    player.pos.copy(PLAYER.spawn);
    player.yaw = Math.PI;
    player.pitch = 0;
  } else {
    const st = getGalleryStation(idx);
    if (!st) return;
    player.pos.set(st.x, st.y, st.z);
    player.yaw = st.yaw;
    player.pitch = st.pitch;
  }
  player.vel.set(0, 0, 0);
  player.grounded = true;
  GALLERY.index = idx;
}

function beginGalleryTransition(targetIdx) {
  const st = targetIdx < 0 ? null : getGalleryStation(targetIdx);
  GALLERY.from.x = player.pos.x;
  GALLERY.from.y = player.pos.y;
  GALLERY.from.z = player.pos.z;
  GALLERY.from.yaw = player.yaw;
  GALLERY.from.pitch = player.pitch;

  if (st) {
    GALLERY.to.x = st.x;
    GALLERY.to.y = st.y;
    GALLERY.to.z = st.z;
    GALLERY.to.yaw = st.yaw;
    GALLERY.to.pitch = st.pitch;
  } else {
    GALLERY.to.x = PLAYER.spawn.x;
    GALLERY.to.y = PLAYER.spawn.y;
    GALLERY.to.z = PLAYER.spawn.z;
    GALLERY.to.yaw = Math.PI;
    GALLERY.to.pitch = 0;
  }

  GALLERY.index = targetIdx;
  GALLERY.transitioning = true;
  GALLERY.t = 0;
  GALLERY.scrollCooldown = GALLERY.scrollGap;
  player.vel.set(0, 0, 0);
}

export function galleryNavigate(dir) {
  if (GALLERY.transitioning || GALLERY.scrollCooldown > 0) return;
  const next = GALLERY.index + dir;
  if (next < -1 || next >= GALLERY.stations.length) return;
  beginGalleryTransition(next);
}

export function navigateToProjectByName(name) {
  if (GALLERY.transitioning) return false;
  const idx = GALLERY.stations.findIndex((st) => st.name === name);
  if (idx < 0) return false;
  if (idx === GALLERY.index) return true;
  beginGalleryTransition(idx);
  return true;
}

export function spawnGalleryNamePlates() {
  for (let i = 0; i < GALLERY.stations.length; i++) {
    const st = GALLERY.stations[i];
    const def = PROJECT_BUILDINGS.find((b) => b.name === st.name);
    if (def && st.face) addNamePlateAtFace(def, st.face);
  }
}

export function initGalleryNav() {
  buildGalleryStations();
  spawnGalleryNamePlates();
  document.body.classList.add('gallery-mode');
  snapGalleryPose(-1);
}

export function galleryNavTick(dt) {
  resetMoveStick();
  input.moveX = 0;
  input.moveZ = 0;
  input.opposingX = false;
  input.opposingZ = false;

  if (GALLERY.scrollCooldown > 0) GALLERY.scrollCooldown -= dt;

  if (GALLERY.transitioning) {
    GALLERY.t += dt / GALLERY.duration;
    const u = easeInOutCubic(Math.min(1, GALLERY.t));
    const f = GALLERY.from;
    const t = GALLERY.to;
    player.pos.x = f.x + (t.x - f.x) * u;
    player.pos.y = f.y + (t.y - f.y) * u;
    player.pos.z = f.z + (t.z - f.z) * u;
    player.yaw = lerpAngle(f.yaw, t.yaw, u);
    player.pitch = f.pitch + (t.pitch - f.pitch) * u;
    player.vel.set(0, 0, 0);
    if (u >= 1) {
      GALLERY.transitioning = false;
      player.pos.set(t.x, t.y, t.z);
      player.yaw = t.yaw;
      player.pitch = t.pitch;
    }
  } else {
    player.vel.set(0, 0, 0);
    const st = getGalleryStation(GALLERY.index);
    if (st) {
      player.pos.set(st.x, st.y, st.z);
    } else if (GALLERY.index < 0) {
      player.pos.copy(PLAYER.spawn);
    }
  }

  player.grounded = true;
  player.wasGrounded = true;
  player.crouching = false;
  player.height = PLAYER.heightStanding;
  player.eye = PLAYER.eyeStanding;
  updatePlayerBox();
}

let scrollBound = false;

export function setupGalleryScroll(getWorldReady) {
  if (scrollBound) return;
  scrollBound = true;
  window.addEventListener('wheel', (e) => {
    if (!getWorldReady() || !GALLERY.enabled) return;
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1;
    galleryNavigate(dir);
  }, { passive: false });
}
