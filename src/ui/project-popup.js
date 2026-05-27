import { getProjectMeta } from '../config/project-info.js';

let bound = false;
let open = false;
let pendingDef = null;
let parallaxBound = false;

export function isProjectPopupOpen() {
  return open;
}

function id(s) { return document.getElementById(s); }

function renderStack(container, stack) {
  if (!container) return;
  container.innerHTML = '';
  if (!stack?.length) return;
  for (const name of stack) {
    const tag = document.createElement('span');
    tag.className = 'pp-tag';
    tag.textContent = name;
    container.appendChild(tag);
  }
}

function restorePointerLock() {
  const canvas = id('canvas');
  if (!canvas || document.pointerLockElement) return;
  canvas.requestPointerLock?.().catch(() => {});
}

export function hideProjectPopup() {
  const root = id('projectPopup');
  const card = id('ppCard');
  if (!root) return;
  open = false;
  pendingDef = null;
  root.classList.remove('open', 'phase-detail');
  root.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('project-popup-open');
  if (card) card.style.transform = '';
  restorePointerLock();
}

function showDetailPhase(def) {
  const root = id('projectPopup');
  if (!root || !def) return;
  const meta = getProjectMeta(def.name);
  root.classList.add('phase-detail');
  const kicker = id('ppKicker');
  if (kicker) kicker.textContent = 'RESUMO TÉCNICO';
  renderStack(id('ppStack'), meta.stack);
  const desc = id('ppDesc');
  if (desc) desc.textContent = meta.description;
  const go = id('ppGo');
  if (go) go.href = meta.url;
  const hint = id('ppUrlHint');
  if (hint) hint.textContent = meta.url;
}

function bindParallax() {
  if (parallaxBound) return;
  parallaxBound = true;
  const card = id('ppCard');
  const root = id('projectPopup');
  window.addEventListener('mousemove', (e) => {
    if (!open || !card) return;
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    const tiltX = 5 + ny * 2;
    const tiltY = nx * 2.5;
    const depth = root?.classList.contains('phase-detail') ? 56 : 52;
    card.style.transform =
      `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${depth}px) scale(1)`;
  });
}

export function showProjectPopup(def) {
  const root = id('projectPopup');
  if (!root || !def) return;
  pendingDef = def;
  open = true;
  root.classList.remove('phase-detail');
  const title = id('ppTitle');
  const kicker = id('ppKicker');
  if (title) title.textContent = def.name;
  if (kicker) kicker.textContent = 'PROJETO DETECTADO';
  document.body.classList.add('project-popup-open');
  if (document.pointerLockElement) document.exitPointerLock();
  root.classList.add('open');
  root.setAttribute('aria-hidden', 'false');
  bindParallax();
}

export function setupProjectPopup() {
  if (bound) return;
  bound = true;
  const root = id('projectPopup');
  if (!root) return;

  id('ppNo')?.addEventListener('click', hideProjectPopup);
  id('ppClose')?.addEventListener('click', hideProjectPopup);
  id('ppVeil')?.addEventListener('click', hideProjectPopup);

  id('ppYes')?.addEventListener('click', () => {
    if (pendingDef) showDetailPhase(pendingDef);
  });

  const go = id('ppGo');
  go?.addEventListener('click', (e) => {
    e.preventDefault();
    const url = go.getAttribute('href');
    if (url && url !== '#') {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    hideProjectPopup();
  });

  window.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') {
      hideProjectPopup();
      e.preventDefault();
      return;
    }
    if ((e.key === 'Enter' || e.key === 'y' || e.key === 'Y') &&
        !root.classList.contains('phase-detail')) {
      if (pendingDef) showDetailPhase(pendingDef);
      e.preventDefault();
    }
  });
}
