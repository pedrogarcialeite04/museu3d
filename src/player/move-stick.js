const MOVE_STICK = {
  radius: 56,
  deadzone: 0.14,
  active: false,
  pointerId: null,
  x: 0,
  z: 0,
};

let zoneEl = null;
let knobEl = null;

function applyDeadzone(x, z) {
  const mag = Math.hypot(x, z);
  if (mag < MOVE_STICK.deadzone) return { x: 0, z: 0 };
  const t = (mag - MOVE_STICK.deadzone) / (1 - MOVE_STICK.deadzone);
  return { x: (x / mag) * t, z: (z / mag) * t };
}

export function resetMoveStick() {
  MOVE_STICK.active = false;
  MOVE_STICK.pointerId = null;
  MOVE_STICK.x = 0;
  MOVE_STICK.z = 0;
  if (knobEl) knobEl.style.transform = 'translate(-50%, -50%)';
  if (zoneEl) zoneEl.classList.remove('active');
}

export function getMoveStickVector() {
  return { x: MOVE_STICK.x, z: MOVE_STICK.z, active: MOVE_STICK.active };
}

function updateFromPointer(clientX, clientY) {
  if (!zoneEl) return;
  const rect = zoneEl.getBoundingClientRect();
  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.5;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  const max = MOVE_STICK.radius;
  if (dist > max) {
    const s = max / dist;
    dx *= s;
    dy *= s;
  }
  if (knobEl) {
    knobEl.style.transform =
      `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }
  const dz = applyDeadzone(dx / max, -dy / max);
  MOVE_STICK.x = dz.x;
  MOVE_STICK.z = dz.z;
}

export function setupMoveStick() {
  zoneEl = document.getElementById('moveStick');
  knobEl = document.getElementById('moveStickKnob');
  if (!zoneEl || !knobEl) return;

  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    MOVE_STICK.active = true;
    MOVE_STICK.pointerId = e.pointerId;
    zoneEl.setPointerCapture(e.pointerId);
    zoneEl.classList.add('active');
    updateFromPointer(e.clientX, e.clientY);
  };

  const onMove = (e) => {
    if (!MOVE_STICK.active || e.pointerId !== MOVE_STICK.pointerId) return;
    e.preventDefault();
    updateFromPointer(e.clientX, e.clientY);
  };

  const onUp = (e) => {
    if (MOVE_STICK.pointerId != null && e.pointerId !== MOVE_STICK.pointerId) return;
    resetMoveStick();
    try { zoneEl.releasePointerCapture(e.pointerId); } catch (_) { /* ok */ }
  };

  zoneEl.addEventListener('pointerdown', onDown);
  zoneEl.addEventListener('pointermove', onMove);
  zoneEl.addEventListener('pointerup', onUp);
  zoneEl.addEventListener('pointercancel', onUp);
  zoneEl.addEventListener('lostpointercapture', onUp);
}
