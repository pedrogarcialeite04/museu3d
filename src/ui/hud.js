import { MOVE, WEAPON, PLAYER, TICK_HZ } from '../config/constants.js';
import {
  player, stats, weapon, input, rifleVM, setActiveSlot,
} from '../state/game.js';
import { GALLERY, getGalleryLabel } from '../player/gallery-nav.js';

const elSpeed = document.getElementById('vSpeed');
const elGround = document.getElementById('vGround');
const elProject = document.getElementById('vProject');
const elNav = document.getElementById('vNav');
const elState = document.getElementById('vState');
const elKills = document.getElementById('vKills');
const elFps = document.getElementById('vFps');
const elHpFill = document.getElementById('hpFill');
const elHpText = document.getElementById('hpText');
const elSlotRifle = document.getElementById('slotRifle');
const elAmmoM = document.getElementById('ammoMain');
const elAmmoR = document.getElementById('ammoReserve');
const elAmmoRl = document.getElementById('ammoReload');
const elAmmoPanel = document.getElementById('ammoPanel');
const elVign = document.getElementById('vignette');
const elCross = document.getElementById('crosshair');
const elAds = document.getElementById('adsOverlay');
const elHm = document.getElementById('hitmarker');
const elKf = document.getElementById('killFeed');
const elDead = document.getElementById('deadScreen');

document.getElementById('vTick').textContent = TICK_HZ + ' Hz';

let hitMarkerT = 0;

export function showHitMarker(isHead) {
  elHm.classList.add('show');
  if (isHead) elHm.classList.add('headshot');
  else elHm.classList.remove('headshot');
  hitMarkerT = 0.15;
}

export function pushKillFeed(label) {
  const div = document.createElement('div');
  div.className = 'entry' + (label.includes('HEADSHOT') ? ' headshot' : '');
  div.textContent = '✕  ' + label;
  elKf.appendChild(div);
  setTimeout(() => {
    if (div.parentNode) div.parentNode.removeChild(div);
  }, 3000);
}

export function damagePlayer(amount) {
  if (player.dead) return;
  stats.hp -= amount;
  stats.damageFlash = 0.7;
  if (stats.hp <= 0) {
    stats.hp = 0;
    player.dead = true;
    elDead.classList.add('show');
    setTimeout(respawnPlayer, 2200);
  }
}

function respawnPlayer() {
  player.pos.copy(PLAYER.spawn);
  player.vel.set(0, 0, 0);
  player.yaw = Math.PI;
  player.pitch = 0;
  stats.hp = stats.maxHp;
  stats.damageFlash = 0;
  player.dead = false;
  weapon.ammo = WEAPON.magSize;
  weapon.reserve = WEAPON.reserveCap;
  weapon.reloading = false;
  weapon.recoilPitch = 0;
  weapon.recoilYaw = 0;
  weapon.recoilKick = 0;
  weapon.adsBlend = 0;
  setActiveSlot('rifle');
  rifleVM.group.visible = true;
  rifleVM.group.scale.setScalar(1);
  input.adsHeld = false;
  elDead.classList.remove('show');
}

export function updateHUD(frameDt) {
  if (elHpFill && elHpText) {
    const hpPct = Math.max(0, stats.hp) / stats.maxHp * 100;
    elHpFill.style.width = hpPct.toFixed(1) + '%';
    elHpText.textContent = Math.ceil(Math.max(0, stats.hp));
  }

  if (elSlotRifle) elSlotRifle.classList.add('active');
  if (elAmmoPanel) elAmmoPanel.classList.remove('hidden');
  if (elAmmoM) elAmmoM.textContent = weapon.ammo;
  if (elAmmoR) elAmmoR.textContent = '/ ' + weapon.reserve;
  if (elAmmoM) {
    if (weapon.ammo <= 6) elAmmoM.classList.add('low');
    else elAmmoM.classList.remove('low');
  }
  if (elAmmoRl) {
    if (weapon.reloading) elAmmoRl.classList.add('show');
    else elAmmoRl.classList.remove('show');
  }

  if (elVign && stats.damageFlash > 0) {
    stats.damageFlash = Math.max(0, stats.damageFlash - frameDt * 1.6);
    elVign.style.opacity = stats.damageFlash.toFixed(3);
  }

  if (hitMarkerT > 0) {
    hitMarkerT -= frameDt;
    if (hitMarkerT <= 0) {
      elHm.classList.remove('show');
      elHm.classList.remove('headshot');
    }
  }

  const horiz = Math.hypot(player.vel.x, player.vel.z);
  const movingT = Math.min(1, horiz / MOVE.maxSpeed);
  let gap = 4 + movingT * 16;
  if (!player.grounded) gap += 12;
  gap += weapon.recoilKick * 60;
  elCross.style.setProperty('--gap', gap.toFixed(1) + 'px');

  const adsOn = weapon.adsBlend > 0.08;
  elCross.classList.toggle('ads-hidden', adsOn);
  elAds.classList.toggle('active', adsOn);
  elAds.setAttribute('aria-hidden', adsOn ? 'false' : 'true');
}

export function updateStatsHUD(horiz, fpsShown) {
  elGround.textContent = player.grounded ? 'true' : 'false';
  if (GALLERY.enabled && elProject && elNav) {
    const total = GALLERY.stations.length;
    const shown = GALLERY.index < 0 ? 0 : GALLERY.index + 1;
    elProject.textContent = getGalleryLabel();
    elNav.textContent = shown + ' / ' + total;
    elSpeed.textContent = GALLERY.transitioning ? 'indo…' : 'parado';
  } else {
    elSpeed.textContent = horiz.toFixed(1) + ' ups';
    if (elProject) elProject.textContent = '—';
    if (elNav) elNav.textContent = '—';
    if (elState) {
      elState.textContent = player.crouching
        ? 'crouch'
        : input.walkHeld
          ? 'walk'
          : !player.grounded
            ? 'air'
            : 'run';
    }
  }
  elKills.textContent = stats.kills;
  elFps.textContent = fpsShown.toFixed(0);
}
