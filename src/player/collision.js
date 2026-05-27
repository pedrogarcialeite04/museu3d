import { PLAYER } from '../config/constants.js';
import { _playerMin, _playerMax, _playerBox } from '../core/scratch.js';
import { colliders, enemies, player } from '../state/game.js';

export function updatePlayerBox() {
  _playerMin.set(
    player.pos.x - PLAYER.radius,
    player.pos.y,
    player.pos.z - PLAYER.radius,
  );
  _playerMax.set(
    player.pos.x + PLAYER.radius,
    player.pos.y + player.height,
    player.pos.z + PLAYER.radius,
  );
}

export function aabbOverlap(a, b) {
  return (
    a.max.x > b.min.x && a.min.x < b.max.x &&
    a.max.y > b.min.y && a.min.y < b.max.y &&
    a.max.z > b.min.z && a.min.z < b.max.z
  );
}

export function overlappingCollider() {
  for (let i = 0; i < colliders.length; i++) {
    if (aabbOverlap(_playerBox, colliders[i])) return colliders[i];
  }
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e.alive) continue;
    if (aabbOverlap(_playerBox, e.bodyBox)) return e.bodyBox;
  }
  return null;
}

function isFloorCollider(c) {
  const hy = c.max.y - c.min.y;
  const hx = c.max.x - c.min.x;
  const hz = c.max.z - c.min.z;
  return hy >= 0.04 && hy < 2 && c.max.y > 0.1 && c.max.y < 1.2
    && (hx > 40 || hz > 40);
}

export function probeGrounded() {
  if (player.vel.y > 1) return false;
  const feetY = player.pos.y;
  const px = player.pos.x;
  const pz = player.pos.z;
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    if (!isFloorCollider(c)) continue;
    if (feetY > c.max.y + 1.2 || feetY < c.min.y - 2) continue;
    if (px >= c.min.x - PLAYER.radius && px <= c.max.x + PLAYER.radius
      && pz >= c.min.z - PLAYER.radius && pz <= c.max.z + PLAYER.radius) {
      return true;
    }
  }
  return false;
}

function moveAxisY(dy) {
  if (dy === 0) return;
  player.pos.y += dy;
  updatePlayerBox();
  if (overlappingCollider()) {
    const sign = dy > 0 ? 1 : -1;
    let remaining = Math.abs(dy);
    while (overlappingCollider() && remaining > 0) {
      const step = remaining < 0.25 ? remaining : 0.25;
      player.pos.y -= sign * step;
      remaining -= step;
      updatePlayerBox();
    }
    if (dy < 0) player.grounded = true;
    player.vel.y = 0;
  }
}

export function snapDownToFloor(maxDrop) {
  player.pos.y -= maxDrop;
  updatePlayerBox();
  if (overlappingCollider()) {
    let remaining = maxDrop;
    while (overlappingCollider() && remaining > 0) {
      const step = remaining < 0.25 ? remaining : 0.25;
      player.pos.y += step;
      remaining -= step;
      updatePlayerBox();
    }
    player.grounded = true;
    if (player.vel.y < 0) player.vel.y = 0;
    return true;
  }
  player.pos.y += maxDrop;
  updatePlayerBox();
  return false;
}

export function moveHorizontal(dx, dz) {
  if (dx === 0 && dz === 0) return;

  const sX = player.pos.x;
  const sZ = player.pos.z;
  const sVx = player.vel.x;
  const sVz = player.vel.z;

  if (dx !== 0) {
    player.pos.x += dx;
    updatePlayerBox();
    if (overlappingCollider()) {
      player.pos.x = sX;
      player.vel.x = 0;
      updatePlayerBox();
    }
  }
  if (dz !== 0) {
    player.pos.z += dz;
    updatePlayerBox();
    if (overlappingCollider()) {
      player.pos.z = sZ;
      player.vel.z = 0;
      updatePlayerBox();
    }
  }

  const blockedX = dx !== 0 && player.pos.x === sX;
  const blockedZ = dz !== 0 && player.pos.z === sZ;
  if (!(blockedX || blockedZ) || !player.grounded) return;

  const afterX = player.pos.x;
  const afterZ = player.pos.z;
  const afterVx = player.vel.x;
  const afterVz = player.vel.z;
  player.pos.x = sX;
  player.pos.z = sZ;
  player.vel.x = sVx;
  player.vel.z = sVz;

  player.pos.y += PLAYER.stepHeight;
  updatePlayerBox();
  if (overlappingCollider()) {
    player.pos.y -= PLAYER.stepHeight;
    player.pos.x = afterX;
    player.pos.z = afterZ;
    player.vel.x = afterVx;
    player.vel.z = afterVz;
    updatePlayerBox();
    return;
  }

  if (dx !== 0) {
    player.pos.x += dx;
    updatePlayerBox();
    if (overlappingCollider()) {
      player.pos.x = sX;
      player.vel.x = 0;
      updatePlayerBox();
    }
  }
  if (dz !== 0) {
    player.pos.z += dz;
    updatePlayerBox();
    if (overlappingCollider()) {
      player.pos.z = sZ;
      player.vel.z = 0;
      updatePlayerBox();
    }
  }

  const movedNow = player.pos.x !== sX || player.pos.z !== sZ;
  if (!movedNow) {
    player.pos.y -= PLAYER.stepHeight;
    player.pos.x = afterX;
    player.pos.z = afterZ;
    player.vel.x = afterVx;
    player.vel.z = afterVz;
    updatePlayerBox();
    return;
  }
  snapDownToFloor(PLAYER.stepHeight + 1);
}

export function enemyAabbCollides(e) {
  for (let i = 0; i < colliders.length; i++) {
    if (aabbOverlap(e.bodyBox, colliders[i])) return true;
  }
  for (let i = 0; i < enemies.length; i++) {
    const o = enemies[i];
    if (o === e || !o.alive) continue;
    if (aabbOverlap(e.bodyBox, o.bodyBox)) return true;
  }
  return false;
}
