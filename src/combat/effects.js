import { THREE } from '../core/three.js';
import { scene, tagWorldLayer } from '../core/scene.js';

const TRACER_POOL = 24;
export const tracers = [];

const IMPACT_POOL = 24;
export const impacts = [];

const impactGeo = new THREE.SphereGeometry(1.6, 8, 8);

export function initTracers() {
  for (let i = 0; i < TRACER_POOL; i++) {
    const positions = new Float32Array(6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0xfff0a0,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const line = new THREE.Line(geo, mat);
    line.frustumCulled = false;
    scene.add(line);
    tracers.push({ line, mat, positions, geo, life: 0, max: 0.10 });
  }
  for (let i = 0; i < tracers.length; i++) tagWorldLayer(tracers[i].line);
}

export function initImpacts() {
  for (let i = 0; i < IMPACT_POOL; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(impactGeo, mat);
    mesh.visible = false;
    scene.add(mesh);
    impacts.push({ mesh, mat, life: 0, max: 0.5 });
  }
  for (let i = 0; i < impacts.length; i++) tagWorldLayer(impacts[i].mesh);
}

export function spawnTracer(fromX, fromY, fromZ, toX, toY, toZ) {
  for (let i = 0; i < tracers.length; i++) {
    const t = tracers[i];
    if (t.life > 0) continue;
    t.positions[0] = fromX;
    t.positions[1] = fromY;
    t.positions[2] = fromZ;
    t.positions[3] = toX;
    t.positions[4] = toY;
    t.positions[5] = toZ;
    t.geo.attributes.position.needsUpdate = true;
    t.life = t.max;
    t.mat.opacity = 1;
    return;
  }
}

export function updateTracers(dt) {
  for (let i = 0; i < tracers.length; i++) {
    const t = tracers[i];
    if (t.life <= 0) continue;
    t.life -= dt;
    if (t.life <= 0) t.mat.opacity = 0;
    else t.mat.opacity = t.life / t.max;
  }
}

export function spawnImpact(x, y, z, isEnemy) {
  for (let i = 0; i < impacts.length; i++) {
    const im = impacts[i];
    if (im.life > 0) continue;
    im.mesh.position.set(x, y, z);
    im.mesh.scale.setScalar(1);
    im.mesh.visible = true;
    im.life = im.max;
    im.mat.color.setHex(isEnemy ? 0xff3344 : 0xffcc66);
    im.mat.opacity = 1;
    return;
  }
}

export function updateImpacts(dt) {
  for (let i = 0; i < impacts.length; i++) {
    const im = impacts[i];
    if (im.life <= 0) continue;
    im.life -= dt;
    if (im.life <= 0) {
      im.mesh.visible = false;
      continue;
    }
    const u = im.life / im.max;
    im.mat.opacity = u;
    im.mesh.scale.setScalar(1 + (1 - u) * 3);
  }
}
