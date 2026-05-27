import { FIXED_DT, MAX_SUBSTEPS, WEAPON, MOVE } from './config/constants.js';
import {
  _cameraEuler, _weaponPos, _weaponRot,
} from './core/scratch.js';
import { renderer, scene, camera } from './core/scene.js';
import { bootstrapGame } from './app/bootstrap.js';
import { player, weapon, rifleVM, decayVmSwitchT, getVmSwitchT } from './state/game.js';
import { playerTick } from './player/movement.js';
import { updateTracers, updateImpacts } from './combat/effects.js';
import { updateWeapon, getActiveVM } from './combat/weapons.js';
import { updateHUD, updateStatsHUD } from './ui/hud.js';

let accumulator = 0;
let lastT = performance.now() / 1000;
let fpsAccT = 0;
let fpsAccN = 0;
let fpsShown = 0;
let statHudCooldown = 0;
let rafId = 0;

function tick(dt) {
  playerTick(dt);
  updateWeapon(dt);
  updateTracers(dt);
  updateImpacts(dt);
}

function frame(nowMs) {
  try {
    const now = nowMs * 0.001;
    let frameDt = now - lastT;
    lastT = now;
    if (frameDt > 0.25) frameDt = 0.25;

    accumulator += frameDt;
    let steps = 0;
    while (accumulator >= FIXED_DT && steps < MAX_SUBSTEPS) {
      tick(FIXED_DT);
      accumulator -= FIXED_DT;
      steps++;
    }
    if (steps >= MAX_SUBSTEPS) accumulator = 0;

    camera.position.set(player.pos.x, player.pos.y + player.eye, player.pos.z);
    _cameraEuler.set(
      player.pitch + weapon.recoilPitch,
      player.yaw + weapon.recoilYaw,
      0,
      'YXZ',
    );
    camera.quaternion.setFromEuler(_cameraEuler);

    const adsT = weapon.adsBlend;
    const adsEase = adsT * adsT * (3 - 2 * adsT);
    camera.fov = WEAPON.fovHip + (WEAPON.fovAds - WEAPON.fovHip) * adsEase;
    camera.updateProjectionMatrix();

    const vm = getActiveVM();
    const horiz = Math.hypot(player.vel.x, player.vel.z);
    const bobScale = 1 - adsEase * 0.85;
    const bobAmt = (player.grounded ? horiz / MOVE.maxSpeed : 0) * 0.55 * bobScale;
    const bobX = Math.sin(weapon.bobPhase) * 0.012 * bobAmt;
    const bobY = Math.abs(Math.sin(weapon.bobPhase * 0.5)) * 0.011 * bobAmt;
    const vmSwitchT = getVmSwitchT();
    const switchDrop = vmSwitchT > 0 ? Math.sin(vmSwitchT * Math.PI * 5) * 0.06 * vmSwitchT : 0;

    _weaponPos.lerpVectors(vm.hipPos, vm.adsPos, adsEase);
    _weaponRot.x = vm.hipRot.x + (vm.adsRot.x - vm.hipRot.x) * adsEase;
    _weaponRot.y = vm.hipRot.y + (vm.adsRot.y - vm.hipRot.y) * adsEase;
    _weaponRot.z = vm.hipRot.z + (vm.adsRot.z - vm.hipRot.z) * adsEase;

    vm.group.position.set(
      _weaponPos.x + bobX,
      _weaponPos.y - bobY - switchDrop,
      _weaponPos.z + weapon.recoilKick * 0.08 * (1 - adsEase * 0.5),
    );

    _cameraEuler.set(
      _weaponRot.x - weapon.recoilKick * 0.55 * (1 - adsEase * 0.4),
      _weaponRot.y,
      _weaponRot.z,
      'YXZ',
    );
    vm.group.quaternion.setFromEuler(_cameraEuler);

    const hideWeapon = Math.min(1, adsEase * 1.12);
    const vmScale = (1 - hideWeapon) * (vmSwitchT > 0 ? 0.92 + 0.08 * (1 - vmSwitchT / 0.2) : 1);
    vm.group.scale.setScalar(vmScale);
    rifleVM.group.visible = vmScale > 0.03;

    weapon.muzzleLocal.lerpVectors(rifleVM.hipMuzzle, rifleVM.adsMuzzle, adsEase);

    decayVmSwitchT(frameDt);
    renderer.render(scene, camera);

    updateHUD(frameDt);
    statHudCooldown -= frameDt;
    fpsAccT += frameDt;
    fpsAccN++;
    if (fpsAccT >= 0.15) {
      fpsShown = fpsAccN / fpsAccT;
      fpsAccT = 0;
      fpsAccN = 0;
    }
    if (statHudCooldown <= 0) {
      statHudCooldown = 0.1;
      updateStatsHUD(horiz, fpsShown);
    }
  } catch (frameErr) {
    showBootError(frameErr);
    return;
  }
  rafId = requestAnimationFrame(frame);
}

function showBootError(err) {
  console.error('[TacticalFPS]', err);
  if (rafId) cancelAnimationFrame(rafId);
  const errDiv = document.createElement('div');
  errDiv.id = 'bootErrorOverlay';
  errDiv.style.cssText =
    'position:fixed;inset:0;background:rgba(80,0,0,.92);color:#fff;padding:40px;' +
    'font-family:monospace;z-index:99999;overflow:auto;pointer-events:auto';
  errDiv.innerHTML =
    '<h2 style="color:#ff4444">Erro ao iniciar o jogo</h2>' +
    '<pre style="white-space:pre-wrap;margin-top:12px">' +
    (err && err.stack ? err.stack : String(err)) +
    '</pre>';
  document.body.appendChild(errDiv);
}

function installGlobalErrorHandlers() {
  window.addEventListener('error', (ev) => {
    if (ev.message) showBootError(ev.error || new Error(ev.message));
  });
  window.addEventListener('unhandledrejection', (ev) => {
    showBootError(ev.reason instanceof Error ? ev.reason : new Error(String(ev.reason)));
  });
}

function start() {
  installGlobalErrorHandlers();
  const canvas = document.getElementById('canvas');
  if (!canvas) {
    showBootError(new Error('Elemento #canvas não encontrado'));
    return;
  }
  try {
    bootstrapGame(canvas).then(() => {
      requestAnimationFrame(frame);
    });
  } catch (bootErr) {
    showBootError(bootErr);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
