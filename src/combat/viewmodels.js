import { THREE } from '../core/three.js';
import { WORLD_LAYER } from '../config/constants.js';
import { camera } from '../core/scene.js';
import { weapon, rifleVM } from '../state/game.js';

function vmMaterial(color, rough, metal) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal,
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });
}

function vmMesh(parent, geo, mat, x, y, z, rx, ry, rz) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
  m.frustumCulled = false;
  parent.add(m);
  return m;
}

function tagViewmodel(root) {
  root.traverse((obj) => {
    if (obj.isMesh || obj.isLight) {
      obj.layers.set(WORLD_LAYER);
      obj.renderOrder = 10;
      obj.frustumCulled = false;
    }
  });
}

export function buildRifleViewmodel() {
  const g = rifleVM.group;
  const body = vmMaterial(0x2a3038, 0.42, 0.58);
  const dark = vmMaterial(0x12161c, 0.5, 0.62);
  const rail = vmMaterial(0x1e242c, 0.35, 0.72);
  const grip = vmMaterial(0x2e2218, 0.72, 0.08);
  const accent = vmMaterial(0x8a4a28, 0.55, 0.35);

  vmMesh(g, new THREE.BoxGeometry(0.09, 0.11, 0.22), body, 0, 0.01, -0.08);
  vmMesh(g, new THREE.BoxGeometry(0.085, 0.09, 0.18), dark, 0, -0.02, -0.06);
  vmMesh(g, new THREE.BoxGeometry(0.07, 0.055, 0.26), rail, 0, 0.055, -0.26);
  vmMesh(g, new THREE.CylinderGeometry(0.014, 0.016, 0.22, 12), dark, 0, 0.03, -0.38, Math.PI / 2, 0, 0);
  vmMesh(g, new THREE.CylinderGeometry(0.022, 0.018, 0.04, 10), dark, 0, 0.03, -0.44, Math.PI / 2, 0, 0);
  vmMesh(g, new THREE.BoxGeometry(0.008, 0.035, 0.02), dark, 0, 0.075, -0.40);
  vmMesh(g, new THREE.BoxGeometry(0.028, 0.02, 0.03), dark, 0, 0.082, 0.04);
  vmMesh(g, new THREE.BoxGeometry(0.055, 0.13, 0.05), grip, 0, -0.095, 0.06, 0.28, 0, 0);
  vmMesh(g, new THREE.BoxGeometry(0.042, 0.11, 0.055), dark, 0, -0.10, -0.02, -0.12, 0, 0);
  vmMesh(g, new THREE.BoxGeometry(0.048, 0.14, 0.04), dark, 0, -0.12, -0.05, -0.18, 0, 0);
  vmMesh(g, new THREE.BoxGeometry(0.05, 0.065, 0.16), grip, 0, 0.01, 0.14);
  vmMesh(g, new THREE.BoxGeometry(0.038, 0.05, 0.08), accent, 0, 0.04, 0.22);
  vmMesh(g, new THREE.TorusGeometry(0.02, 0.004, 6, 14, Math.PI), dark, 0, -0.055, 0.04, 0, Math.PI / 2, 0);
  vmMesh(g, new THREE.BoxGeometry(0.035, 0.028, 0.05), rail, 0, 0.09, -0.18);
  vmMesh(g, new THREE.BoxGeometry(0.012, 0.018, 0.06), dark, -0.018, 0.09, -0.18);
  vmMesh(g, new THREE.BoxGeometry(0.012, 0.018, 0.06), dark, 0.018, 0.09, -0.18);
  vmMesh(g, new THREE.BoxGeometry(0.024, 0.024, 0.04), vmMaterial(0x1a2030, 0.3, 0.8), 0, 0.105, -0.20);
  vmMesh(g, new THREE.BoxGeometry(0.006, 0.04, 0.008), vmMaterial(0xff4422, 0.4, 0.2), 0, 0.108, -0.22);

  const flashMat = new THREE.MeshBasicMaterial({
    color: 0xffd07a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  weapon.muzzleFlash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), flashMat);
  weapon.muzzleFlash.position.copy(rifleVM.barrelTip);
  weapon.muzzleFlash.position.z -= 0.02;
  g.add(weapon.muzzleFlash);

  weapon.muzzleLight = new THREE.PointLight(0xffaa44, 0, 4, 1.8);
  weapon.muzzleLight.position.copy(rifleVM.barrelTip);
  g.add(weapon.muzzleLight);

  tagViewmodel(g);
  camera.add(g);
}

export function initViewmodels() {
  buildRifleViewmodel();
}
