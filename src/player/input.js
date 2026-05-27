import { M_YAW, M_PITCH, PITCH_MAX, MOUSE_SENS } from '../config/constants.js';

import { keys, input, player } from '../state/game.js';

import { switchWeapon } from '../combat/weapons.js';
import { isProjectPopupOpen } from '../ui/project-popup.js';

import { getMoveStickVector, resetMoveStick, setupMoveStick } from './move-stick.js';



const MOVEMENT_KEY_CODES = [

  'KeyW', 'KeyA', 'KeyS', 'KeyD',

  'Space', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',

];



export function clearMovementKeys() {

  for (let i = 0; i < MOVEMENT_KEY_CODES.length; i++) {

    keys[MOVEMENT_KEY_CODES[i]] = false;

  }

  resetMoveStick();

  input.moveX = 0;

  input.moveZ = 0;

  input.jumpHeld = false;

  input.crouchHeld = false;

  input.walkHeld = false;

  input.opposingX = false;

  input.opposingZ = false;

}



export function stopPlayerHorizontal() {

  player.vel.x = 0;

  player.vel.z = 0;

}



export function readInput() {

  let mx = 0;

  let mz = 0;

  input.opposingX = false;

  input.opposingZ = false;



  const stick = getMoveStickVector();

  const stickMag = Math.hypot(stick.x, stick.z);

  if (stick.active || stickMag > 0.001) {

    mx = stick.x;

    mz = stick.z;

  } else if (document.pointerLockElement) {

    const a = !!keys.KeyA;

    const d = !!keys.KeyD;

    const w = !!keys.KeyW;

    const s = !!keys.KeyS;

    mx = (d ? 1 : 0) - (a ? 1 : 0);

    mz = (w ? 1 : 0) - (s ? 1 : 0);

    input.opposingX = a && d;

    input.opposingZ = w && s;

  }



  input.moveX = mx;

  input.moveZ = mz;

  input.jumpHeld = !!keys.Space;

  input.crouchHeld = !!keys.ControlLeft || !!keys.ControlRight;

  input.walkHeld = !!keys.ShiftLeft || !!keys.ShiftRight;

}



function requestPlayPointer(canvas) {

  const target = canvas || document.body;

  if (!target.requestPointerLock) {

    console.warn('[TacticalFPS] requestPointerLock não suportado neste navegador');

    return;

  }

  target.requestPointerLock().catch((err) => {

    console.warn('[TacticalFPS] Pointer lock recusado:', err);

  });

}



function updateLockOverlay(lockEl) {

  if (!lockEl) return;

  const locked = document.pointerLockElement != null;

  lockEl.style.display = locked ? 'none' : 'flex';

  lockEl.setAttribute('aria-hidden', locked ? 'true' : 'false');

}



export function setupInput(canvas) {

  const lockEl = document.getElementById('lockOverlay');

  if (!lockEl) {

    console.error('[TacticalFPS] #lockOverlay não encontrado no DOM');

  }



  setupMoveStick();



  window.addEventListener('keydown', (e) => {

    if (e.code === 'Escape') {

      clearMovementKeys();

      stopPlayerHorizontal();

      return;

    }

    if (keys[e.code]) return;

    keys[e.code] = true;

    if (!document.pointerLockElement) return;

    if (e.code === 'Space') {

      player.jumpQueued = true;

      e.preventDefault();

    }

    if (e.code === 'KeyR') {

      input.reloadPressed = true;

      e.preventDefault();

    }

    if (e.code === 'Digit1') {

      switchWeapon('rifle');

      e.preventDefault();

    }


  });



  window.addEventListener('keyup', (e) => {

    keys[e.code] = false;

  });



  const onPlayClick = (e) => {

    e.preventDefault();

    e.stopPropagation();

    requestPlayPointer(canvas);

  };



  if (lockEl) {

    lockEl.addEventListener('click', onPlayClick);

    lockEl.addEventListener('mousedown', onPlayClick);

  }

  canvas.addEventListener('click', onPlayClick);



  document.addEventListener('pointerlockchange', () => {

    if (!isProjectPopupOpen()) {

      updateLockOverlay(lockEl);

    }

    if (!document.pointerLockElement) {

      clearMovementKeys();

      stopPlayerHorizontal();

    }

  });

  document.addEventListener('pointerlockerror', () => updateLockOverlay(lockEl));



  updateLockOverlay(lockEl);



  document.addEventListener('mousemove', (e) => {

    if (!document.pointerLockElement) return;

    player.yaw -= e.movementX * M_YAW * MOUSE_SENS;

    player.pitch -= e.movementY * M_PITCH * MOUSE_SENS;

    if (player.pitch > PITCH_MAX) player.pitch = PITCH_MAX;

    if (player.pitch < -PITCH_MAX) player.pitch = -PITCH_MAX;

  });



  canvas.addEventListener('contextmenu', (e) => e.preventDefault());



  window.addEventListener('mousedown', (e) => {

    if (!document.pointerLockElement) return;

    if (e.button === 0) input.fireHeld = true;

    if (e.button === 2) {

      input.adsHeld = true;

      e.preventDefault();

    }

  });



  window.addEventListener('mouseup', (e) => {

    if (e.button === 0) input.fireHeld = false;

    if (e.button === 2) input.adsHeld = false;

  });



  window.addEventListener('blur', () => {

    clearMovementKeys();

    input.fireHeld = false;

    input.adsHeld = false;

    stopPlayerHorizontal();

  });



  document.addEventListener('visibilitychange', () => {

    if (document.hidden) {

      clearMovementKeys();

      input.fireHeld = false;

      input.adsHeld = false;

      stopPlayerHorizontal();

    }

  });

}

