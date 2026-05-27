import { THREE } from '../core/three.js';
import { PLAYER, WEAPON } from '../config/constants.js';

/** Colisores estáticos do mapa (AABB) */
export const colliders = [];

/** Instâncias de inimigos ativas */
export const enemies = [];

export const player = {
  pos: PLAYER.spawn.clone(),
  vel: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  height: PLAYER.heightStanding,
  eye: PLAYER.eyeStanding,
  grounded: false,
  wasGrounded: false,
  crouching: false,
  jumpQueued: false,
  dead: false,
};

export const keys = Object.create(null);

export const input = {
  moveX: 0,
  moveZ: 0,
  jumpHeld: false,
  crouchHeld: false,
  walkHeld: false,
  opposingX: false,
  opposingZ: false,
  fireHeld: false,
  adsHeld: false,
  reloadPressed: false,
};

export const stats = {
  hp: 100,
  maxHp: 100,
  kills: 0,
  damageFlash: 0,
};

export const weapon = {
  ammo: WEAPON.magSize,
  reserve: WEAPON.reserveCap,
  fireCooldown: 0,
  reloadTimer: 0,
  reloading: false,
  adsBlend: 0,
  recoilPitch: 0,
  recoilYaw: 0,
  recoilKick: 0,
  bobPhase: 0,
  muzzleFlashT: 0,
  muzzleFlashLife: 0.045,
  muzzleFlash: null,
  muzzleLight: null,
  muzzleLocal: new THREE.Vector3(0.22, -0.20, -0.46),
};

export let activeSlot = 'rifle';
export let vmSwitchT = 0;

export const rifleVM = {
  group: new THREE.Group(),
  hipPos: new THREE.Vector3(0.22, -0.20, -0.34),
  hipRot: new THREE.Euler(0.04, -0.05, 0.02),
  adsPos: new THREE.Vector3(0.58, -0.78, -0.12),
  adsRot: new THREE.Euler(0.48, -0.18, 0.06),
  hipMuzzle: new THREE.Vector3(0.22, -0.18, -0.46),
  adsMuzzle: new THREE.Vector3(0.12, -0.42, -0.28),
  barrelTip: new THREE.Vector3(0, 0.03, -0.44),
};

export function setActiveSlot(slot) {
  activeSlot = slot;
}

export function setVmSwitchT(value) {
  vmSwitchT = value;
}

export function getVmSwitchT() {
  return vmSwitchT;
}

export function decayVmSwitchT(dt) {
  if (vmSwitchT > 0) vmSwitchT = Math.max(0, vmSwitchT - dt * 4);
}
