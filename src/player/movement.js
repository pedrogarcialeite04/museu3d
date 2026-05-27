import { MOVE, PLAYER } from '../config/constants.js';
import {
  _fwd, _right, _wishDir, _horiz,
} from '../core/scratch.js';
import { input, player } from '../state/game.js';
import {
  updatePlayerBox, probeGrounded, moveHorizontal, moveAxisY, snapDownToFloor,
  overlappingCollider,
} from './collision.js';
import { readInput, stopPlayerHorizontal } from './input.js';
import { GALLERY, galleryNavTick } from './gallery-nav.js';

export function applyFriction(velocity, friction, stopSpeed, dt) {
  const speed = velocity.length();
  if (speed < 1e-4) {
    velocity.set(0, 0, 0);
    return;
  }
  const control = speed < stopSpeed ? stopSpeed : speed;
  const drop = control * friction * dt;
  let newSpeed = speed - drop;
  if (newSpeed < 0) newSpeed = 0;
  velocity.multiplyScalar(newSpeed / speed);
}

export function accelerate(velocity, wishDir, wishSpeed, accel, dt) {
  const currentSpeed = velocity.dot(wishDir);
  const addSpeed = wishSpeed - currentSpeed;
  if (addSpeed <= 0) return;
  let accelSpeed = accel * wishSpeed * dt;
  if (accelSpeed > addSpeed) accelSpeed = addSpeed;
  velocity.addScaledVector(wishDir, accelSpeed);
}

export function airAccelerate(velocity, wishDir, wishSpeed, maxAirWish, accel, dt) {
  const capped = wishSpeed > maxAirWish ? maxAirWish : wishSpeed;
  const currentSpeed = velocity.dot(wishDir);
  const addSpeed = capped - currentSpeed;
  if (addSpeed <= 0) return;
  let accelSpeed = accel * wishSpeed * dt;
  if (accelSpeed > addSpeed) accelSpeed = addSpeed;
  velocity.addScaledVector(wishDir, accelSpeed);
}

function counterStrafe() {
  const velOnRight = player.vel.x * _right.x + player.vel.z * _right.z;
  const velOnFwd = player.vel.x * _fwd.x + player.vel.z * _fwd.z;

  if (
    input.opposingX ||
    (input.moveX > 0 && velOnRight < 0) ||
    (input.moveX < 0 && velOnRight > 0)
  ) {
    player.vel.x -= _right.x * velOnRight;
    player.vel.z -= _right.z * velOnRight;
  }
  if (
    input.opposingZ ||
    (input.moveZ > 0 && velOnFwd < 0) ||
    (input.moveZ < 0 && velOnFwd > 0)
  ) {
    player.vel.x -= _fwd.x * velOnFwd;
    player.vel.z -= _fwd.z * velOnFwd;
  }
}

export function playerTick(dt) {
  if (player.dead) return;
  if (GALLERY.enabled) {
    galleryNavTick(dt);
    return;
  }
  readInput();

  player.grounded = probeGrounded();

  const cy = Math.cos(player.yaw);
  const sy = Math.sin(player.yaw);
  _fwd.set(-sy, 0, -cy);
  _right.set(cy, 0, -sy);

  _wishDir.set(0, 0, 0)
    .addScaledVector(_fwd, input.moveZ)
    .addScaledVector(_right, input.moveX);
  let wishMag = _wishDir.length();
  if (wishMag > 1e-4) {
    _wishDir.multiplyScalar(1 / wishMag);
    if (wishMag > 1) wishMag = 1;
  } else {
    wishMag = 0;
  }

  const hasMoveIntent = wishMag > 0.02;
  if (player.grounded && !hasMoveIntent) {
    stopPlayerHorizontal();
  }

  player.crouching = input.crouchHeld && player.grounded;
  const desiredHeight = player.crouching ? PLAYER.heightCrouching : PLAYER.heightStanding;
  if (desiredHeight > player.height) {
    player.height = desiredHeight;
    updatePlayerBox();
    if (overlappingCollider()) {
      player.height = PLAYER.heightCrouching;
      player.crouching = true;
      updatePlayerBox();
    }
  } else {
    player.height = desiredHeight;
    updatePlayerBox();
  }
  player.eye = player.crouching ? PLAYER.eyeCrouching : PLAYER.eyeStanding;

  const maxSpeed = player.crouching
    ? MOVE.crouchSpeed
    : input.walkHeld
      ? MOVE.walkSpeed
      : MOVE.maxSpeed;
  const wishSpeed = wishMag * maxSpeed;

  if (player.grounded) {
    if (player.vel.y < 0) player.vel.y = 0;
    if (MOVE.perfectCounterStrafe) counterStrafe();

    if (wishMag > 1e-4) {
      const velOnRight = player.vel.x * _right.x + player.vel.z * _right.z;
      const velOnFwd = player.vel.x * _fwd.x + player.vel.z * _fwd.z;
      if (Math.abs(input.moveX) < 1e-4) {
        player.vel.x -= _right.x * velOnRight;
        player.vel.z -= _right.z * velOnRight;
      }
      if (Math.abs(input.moveZ) < 1e-4) {
        player.vel.x -= _fwd.x * velOnFwd;
        player.vel.z -= _fwd.z * velOnFwd;
      }
    }

    _horiz.set(player.vel.x, 0, player.vel.z);
    applyFriction(_horiz, MOVE.friction, MOVE.stopSpeed, dt);
    if (wishSpeed > 1e-4) {
      accelerate(_horiz, _wishDir, wishSpeed, MOVE.acceleration, dt);
    }
    player.vel.x = _horiz.x;
    player.vel.z = _horiz.z;
  } else {
    if (wishSpeed > 1e-4) {
      _horiz.set(player.vel.x, 0, player.vel.z);
      airAccelerate(_horiz, _wishDir, wishSpeed, MOVE.maxAirWishSpeed, MOVE.airAcceleration, dt);
      player.vel.x = _horiz.x;
      player.vel.z = _horiz.z;
    }
    player.vel.y -= MOVE.gravity * dt;
  }

  const dx = player.vel.x * dt;
  const dy = player.vel.y * dt;
  const dz = player.vel.z * dt;
  const longest = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
  const maxStep = PLAYER.radius * 0.5;
  const subs = longest > maxStep ? Math.ceil(longest / maxStep) : 1;
  const sdx = dx / subs;
  const sdy = dy / subs;
  const sdz = dz / subs;
  for (let i = 0; i < subs; i++) {
    moveHorizontal(sdx, sdz);
    moveAxisY(sdy);
  }

  if (player.wasGrounded && !player.grounded && player.vel.y <= 0) {
    snapDownToFloor(PLAYER.stepHeight);
  }

  const wantsJump = player.jumpQueued || (MOVE.autoBhop && input.jumpHeld);
  if (wantsJump && player.grounded) {
    player.vel.y = MOVE.jumpImpulse;
    player.grounded = false;
    player.jumpQueued = false;
  }

  if (player.grounded && !hasMoveIntent) {
    stopPlayerHorizontal();
  }

  player.wasGrounded = player.grounded;
}
