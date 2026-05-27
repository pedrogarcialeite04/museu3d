import { MOVE, WEAPON, ENEMY } from '../config/constants.js';
import {
  _cameraEuler, _qHelper, _camForward, _camRight, _camUp,
  _rayOrigin, _rayDir, _hitPoint, _muzzleWorld,
} from '../core/scratch.js';
import {
  colliders, enemies, player, input, weapon, rifleVM,
  setActiveSlot, setVmSwitchT,
} from '../state/game.js';
import { raySphereT, rayAabbT } from './raycast.js';
import { spawnTracer, spawnImpact } from './effects.js';
import { damageEnemy } from '../enemies/enemy-system.js';
import { showHitMarker } from '../ui/hud.js';
import { isProjectPopupOpen, showProjectPopup } from '../ui/project-popup.js';

export function getActiveVM() {
  return rifleVM;
}

export function switchWeapon(slot) {
  if (slot !== 'rifle' || player.dead) return;
  setActiveSlot('rifle');
  rifleVM.group.visible = true;
  setVmSwitchT(0.2);
}

function currentSpread() {
  let s;
  if (!player.grounded) s = WEAPON.spreadAir;
  else if (player.crouching) s = WEAPON.spreadCrouch;
  else {
    const horiz = Math.hypot(player.vel.x, player.vel.z);
    const t = Math.min(1, horiz / MOVE.maxSpeed);
    s = WEAPON.spreadIdle + (WEAPON.spreadRun - WEAPON.spreadIdle) * t;
  }
  const adsEase = weapon.adsBlend * weapon.adsBlend;
  return s * (1 - adsEase * (1 - WEAPON.spreadAdsMult));
}

function tryStartReload() {
  if (weapon.reloading) return;
  if (weapon.ammo >= WEAPON.magSize) return;
  if (weapon.reserve <= 0) return;
  weapon.reloading = true;
  weapon.reloadTimer = WEAPON.reloadTime;
}

export function tryFire() {
  if (isProjectPopupOpen()) return;
  if (player.dead) return;
  if (weapon.fireCooldown > 0) return;
  if (weapon.reloading) return;
  if (weapon.ammo <= 0) {
    tryStartReload();
    return;
  }

  weapon.fireCooldown = WEAPON.fireRate;
  weapon.ammo--;

  const spread = currentSpread() + weapon.recoilKick * 0.5;
  const a = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * spread;
  const sx = Math.cos(a) * r;
  const sy = Math.sin(a) * r;

  const yaw = player.yaw + weapon.recoilYaw;
  const pitch = player.pitch + weapon.recoilPitch;
  _cameraEuler.set(pitch, yaw, 0, 'YXZ');
  _qHelper.setFromEuler(_cameraEuler);
  _camForward.set(0, 0, -1).applyQuaternion(_qHelper);
  _camRight.set(1, 0, 0).applyQuaternion(_qHelper);
  _camUp.set(0, 1, 0).applyQuaternion(_qHelper);
  _rayDir.copy(_camForward)
    .addScaledVector(_camRight, sx)
    .addScaledVector(_camUp, sy)
    .normalize();

  _rayOrigin.set(player.pos.x, player.pos.y + player.eye, player.pos.z);

  let nearestT = WEAPON.range;
  let hitEnemy = null;
  let hitZone = null;
  let hitProject = null;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e.alive) continue;
    const tH = raySphereT(
      _rayOrigin.x, _rayOrigin.y, _rayOrigin.z,
      _rayDir.x, _rayDir.y, _rayDir.z,
      e.headPos.x, e.headPos.y, e.headPos.z,
      ENEMY.headRadius,
    );
    if (tH > 0 && tH < nearestT) {
      nearestT = tH;
      hitEnemy = e;
      hitZone = 'head';
    }
    const tB = rayAabbT(
      _rayOrigin.x, _rayOrigin.y, _rayOrigin.z,
      _rayDir.x, _rayDir.y, _rayDir.z,
      e.bodyMin, e.bodyMax,
    );
    if (tB > 0 && tB < nearestT) {
      nearestT = tB;
      hitEnemy = e;
      hitZone = 'body';
    }
  }

  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    const tW = rayAabbT(
      _rayOrigin.x, _rayOrigin.y, _rayOrigin.z,
      _rayDir.x, _rayDir.y, _rayDir.z,
      c.min, c.max,
    );
    if (tW > 0 && tW < nearestT) {
      nearestT = tW;
      hitEnemy = null;
      hitZone = null;
      hitProject = c.projectDef || null;
    }
  }

  _hitPoint.copy(_rayOrigin).addScaledVector(_rayDir, nearestT);
  _muzzleWorld.copy(weapon.muzzleLocal).applyMatrix4(rifleVM.group.matrixWorld);
  spawnTracer(
    _muzzleWorld.x, _muzzleWorld.y, _muzzleWorld.z,
    _hitPoint.x, _hitPoint.y, _hitPoint.z,
  );
  if (nearestT < WEAPON.range) {
    spawnImpact(_hitPoint.x, _hitPoint.y, _hitPoint.z, !!hitEnemy);
  }

  if (hitEnemy) {
    damageEnemy(
      hitEnemy,
      hitZone === 'head' ? WEAPON.damageHead : WEAPON.damageBody,
      hitZone,
    );
    showHitMarker(hitZone === 'head');
  } else if (hitProject) {
    showProjectPopup(hitProject);
  }

  weapon.muzzleFlashT = weapon.muzzleFlashLife;
  weapon.muzzleFlash.material.opacity = 1;
  weapon.muzzleFlash.rotation.z = Math.random() * Math.PI;
  weapon.muzzleLight.intensity = 4.0;

  weapon.recoilPitch += WEAPON.recoilPitch;
  weapon.recoilYaw += (Math.random() - 0.5) * 2 * WEAPON.recoilYawJit;
  weapon.recoilKick += WEAPON.recoilKick;
  if (weapon.recoilKick > 0.18) weapon.recoilKick = 0.18;
}

function updateAds(dt) {
  const target = input.adsHeld && !player.dead && !weapon.reloading ? 1 : 0;
  const step = WEAPON.adsSpeed * dt;
  if (weapon.adsBlend < target) weapon.adsBlend = Math.min(target, weapon.adsBlend + step);
  else if (weapon.adsBlend > target) weapon.adsBlend = Math.max(target, weapon.adsBlend - step);
}

export function updateWeapon(dt) {
  updateAds(dt);

  if (weapon.fireCooldown > 0) weapon.fireCooldown -= dt;
  if (weapon.reloading) {
    weapon.reloadTimer -= dt;
    if (weapon.reloadTimer <= 0) {
      const need = WEAPON.magSize - weapon.ammo;
      const take = Math.min(need, weapon.reserve);
      weapon.ammo += take;
      weapon.reserve -= take;
      weapon.reloading = false;
    }
  }
  if (weapon.muzzleFlashT > 0) {
    weapon.muzzleFlashT -= dt;
    if (weapon.muzzleFlashT <= 0) {
      weapon.muzzleFlash.material.opacity = 0;
      weapon.muzzleLight.intensity = 0;
    } else {
      const u = weapon.muzzleFlashT / weapon.muzzleFlashLife;
      weapon.muzzleFlash.material.opacity = u;
      weapon.muzzleLight.intensity = 3.5 * u;
    }
  }
  if (input.reloadPressed) {
    tryStartReload();
    input.reloadPressed = false;
  }
  if (input.fireHeld) tryFire();

  const k = Math.exp(-WEAPON.recoilDecay * dt);
  weapon.recoilPitch *= k;
  weapon.recoilYaw *= k;
  weapon.recoilKick *= k;

  const horiz = Math.hypot(player.vel.x, player.vel.z);
  if (player.grounded && horiz > 5) {
    weapon.bobPhase += dt * (horiz / MOVE.maxSpeed) * 9.5;
  } else {
    weapon.bobPhase *= 0.94;
  }
}
