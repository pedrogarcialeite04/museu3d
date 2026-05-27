import { THREE } from '../core/three.js';

export const TICK_HZ = 64;
export const FIXED_DT = 1 / TICK_HZ;
export const MAX_SUBSTEPS = 5;

export const MOVE = {
  maxSpeed: 320,
  walkSpeed: 130,
  crouchSpeed: 85,
  acceleration: 9.5,
  airAcceleration: 12,
  friction: 5.5,
  stopSpeed: 100,
  maxAirWishSpeed: 30,
  jumpImpulse: 301.993,
  gravity: 800,
  autoBhop: true,
  perfectCounterStrafe: true,
};

export const PLAYER = {
  radius: 16,
  heightStanding: 72,
  heightCrouching: 54,
  eyeStanding: 64,
  eyeCrouching: 47,
  stepHeight: 18,
  spawn: new THREE.Vector3(0, 0.22, 320),
};

export const WEAPON = {
  fireRate: 0.095,
  damageBody: 32,
  damageHead: 135,
  magSize: 30,
  reserveCap: 90,
  reloadTime: 1.9,
  spreadIdle: 0.0035,
  spreadRun: 0.045,
  spreadAir: 0.16,
  spreadCrouch: 0.0018,
  recoilPitch: 0.022,
  recoilYawJit: 0.010,
  recoilKick: 0.06,
  recoilDecay: 8.0,
  range: 8000,
  fovHip: 90,
  fovAds: 58,
  adsSpeed: 14,
  spreadAdsMult: 0.22,
};

export const ENEMY = {
  hp: 100,
  radius: 16,
  height: 72,
  headRadius: 11,
  moveSpeed: 140,
  attackRange: 60,
  damagePerSec: 25,
  attackCooldown: 0.6,
  sightRange: 2500,
  deathDuration: 2.4,
  respawnDelay: 4.0,
};

export const CITY = { streetW: 110, block: 340, floorH: 32, curbW: 4, swW: 28 };

export const WORLD_LAYER = 0;

export const MOUSE_SENS = 2.0;
export const M_YAW = 0.022 * Math.PI / 180;
export const M_PITCH = 0.022 * Math.PI / 180;
export const PITCH_MAX = Math.PI / 2 - 0.01;
