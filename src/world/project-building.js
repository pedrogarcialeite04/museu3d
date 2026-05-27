import { THREE } from '../core/three.js';

import { CITY, WORLD_LAYER } from '../config/constants.js';

import { scene, renderer } from '../core/scene.js';

import { colliders } from '../state/game.js';

import { materials as mat } from './textures.js';



const projectTexLoader = new THREE.TextureLoader();

const textureCache = new Map();



function maxAnisotropy() {

  return renderer?.capabilities?.getMaxAnisotropy?.() ?? 4;

}



function prepTexture(tex) {

  tex.colorSpace = THREE.SRGBColorSpace;

  tex.anisotropy = maxAnisotropy();

  tex.minFilter = THREE.LinearMipmapLinearFilter;

  tex.magFilter = THREE.LinearFilter;

  tex.generateMipmaps = true;

  return tex;

}



export function loadProjectTexture(url) {

  const cached = textureCache.get(url);

  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {

    projectTexLoader.load(

      url,

      (tex) => {

        prepTexture(tex);

        textureCache.set(url, tex);

        resolve(tex);

      },

      undefined,

      reject,

    );

  });

}



function tagMesh(mesh, cast = true, receive = true) {

  mesh.frustumCulled = false;

  mesh.layers.set(WORLD_LAYER);

  mesh.castShadow = cast;

  mesh.receiveShadow = receive;

  return mesh;

}



function addCollider(cx, cy, cz, sx, sy, sz, projectDef = null) {

  const box = new THREE.Box3(

    new THREE.Vector3(cx - sx / 2, cy - sy / 2, cz - sz / 2),

    new THREE.Vector3(cx + sx / 2, cy + sy / 2, cz + sz / 2),

  );

  if (projectDef) box.projectDef = projectDef;

  colliders.push(box);

}



function makeNameSignTexture(name) {

  const cvs = document.createElement('canvas');

  cvs.width = 640;

  cvs.height = 80;

  const ctx = cvs.getContext('2d');

  ctx.fillStyle = 'rgba(8,12,20,0.92)';

  ctx.fillRect(0, 0, cvs.width, cvs.height);

  ctx.strokeStyle = '#ff9b3a';

  ctx.lineWidth = 2;

  ctx.strokeRect(4, 4, cvs.width - 8, cvs.height - 8);

  const grad = ctx.createLinearGradient(0, 0, cvs.width, 0);

  grad.addColorStop(0, 'rgba(255,155,58,0)');

  grad.addColorStop(0.5, 'rgba(255,155,58,0.35)');

  grad.addColorStop(1, 'rgba(255,155,58,0)');

  ctx.fillStyle = grad;

  ctx.fillRect(8, 8, cvs.width - 16, cvs.height - 16);

  ctx.fillStyle = '#f4f6fa';

  ctx.font = '600 32px system-ui, Segoe UI, sans-serif';

  ctx.textAlign = 'center';

  ctx.textBaseline = 'middle';

  ctx.fillText(name.toUpperCase(), cvs.width / 2, cvs.height / 2);

  const tex = new THREE.CanvasTexture(cvs);

  tex.colorSpace = THREE.SRGBColorSpace;

  tex.anisotropy = maxAnisotropy();

  return tex;

}



function makeBrightFacadeMaterial(tex) {

  return new THREE.MeshStandardMaterial({

    map: tex,

    color: 0xffffff,

    roughness: 0.72,

    metalness: 0.04,

    side: THREE.FrontSide,

  });

}



function addProjectFacade(cx, cy, cz, width, height, rotY, facadeMat) {

  const framePad = 6;

  const wall = new THREE.Mesh(

    new THREE.PlaneGeometry(width, height),

    facadeMat,

  );

  wall.position.set(cx, cy, cz);

  wall.rotation.y = rotY;

  tagMesh(wall, false, false);

  scene.add(wall);



  const frameMat = new THREE.MeshStandardMaterial({

    color: 0x141c28,

    roughness: 0.28,

    metalness: 0.82,

  });

  const frame = new THREE.Mesh(

    new THREE.BoxGeometry(width + framePad * 2, height + framePad * 2, 3),

    frameMat,

  );

  frame.position.set(cx, cy, cz);

  frame.rotation.y = rotY;

  const zOff = rotY === 0 ? -2 : rotY === Math.PI ? 2 : 0;

  const xOff = rotY === Math.PI / 2 ? -2 : rotY === -Math.PI / 2 ? 2 : 0;

  frame.position.x += xOff;

  frame.position.z += zOff;

  tagMesh(frame);

  scene.add(frame);

}



function addFloorBands(cx, cz, w, d, h, podiumTop, bandMat) {

  const floors = Math.max(1, Math.floor((h - podiumTop) / CITY.floorH));

  for (let f = 1; f <= floors; f++) {

    const y = podiumTop + f * CITY.floorH - 2;

    const band = new THREE.Mesh(

      new THREE.BoxGeometry(w + 4, 2.5, d + 4),

      bandMat,

    );

    band.position.set(cx, y, cz);

    tagMesh(band, false, false);

    scene.add(band);

  }

}



function addCornerFins(cx, cz, w, d, h, finMat, accentMat) {

  const finW = 3;

  const corners = [

    [cx - w / 2 - finW / 2, cz + d / 2 + finW / 2],

    [cx + w / 2 + finW / 2, cz + d / 2 + finW / 2],

    [cx - w / 2 - finW / 2, cz - d / 2 - finW / 2],

    [cx + w / 2 + finW / 2, cz - d / 2 - finW / 2],

  ];

  for (const [px, pz] of corners) {

    const fin = new THREE.Mesh(new THREE.BoxGeometry(finW, h * 0.92, finW), finMat);

    fin.position.set(px, h / 2, pz);

    tagMesh(fin);

    scene.add(fin);



    const led = new THREE.Mesh(

      new THREE.BoxGeometry(1.2, h * 0.88, 1.2),

      accentMat,

    );

    led.position.set(px, h / 2, pz);

    tagMesh(led, false, false);

    scene.add(led);

  }

}



/** Torre corporativa moderna com fachadas em vidro e painéis de marca. */

export async function addRealisticProjectBuilding(def) {

  const cx = def.x;

  const cz = def.z;

  const w = def.w;

  const d = def.d;

  const h = def.floors * CITY.floorH;

  const podiumH = Math.min(56, h * 0.22);

  const towerH = h - podiumH;



  const collPad = 4;
  const collBaseY = 10;
  const collH = h - collBaseY;
  addCollider(cx, collBaseY + collH / 2, cz, w + collPad * 2, collH, d + collPad * 2, def);



  const stoneMat = new THREE.MeshStandardMaterial({

    color: 0xe2e6ec,

    roughness: 0.42,

    metalness: 0.12,

  });

  const glassMat = new THREE.MeshStandardMaterial({

    color: 0x9eb4cc,

    roughness: 0.08,

    metalness: 0.72,

    transparent: true,

    opacity: 0.38,

  });

  const frameMat = new THREE.MeshStandardMaterial({

    color: 0x1a2432,

    roughness: 0.22,

    metalness: 0.88,

  });

  const roofMat = new THREE.MeshStandardMaterial({

    map: mat.roof?.map || null,

    color: 0x2c3440,

    roughness: 0.45,

    metalness: 0.55,

  });

  const accentMat = new THREE.MeshStandardMaterial({

    color: 0xff9b3a,

    emissive: 0xff9b3a,

    emissiveIntensity: 0.85,

    roughness: 0.35,

    metalness: 0.2,

  });

  const bandMat = new THREE.MeshStandardMaterial({

    color: 0x253040,

    roughness: 0.35,

    metalness: 0.65,

  });



  const podium = new THREE.Mesh(

    new THREE.BoxGeometry(w + 20, podiumH, d + 20),

    stoneMat,

  );

  podium.position.set(cx, podiumH / 2, cz);

  tagMesh(podium);

  scene.add(podium);



  const plinthStep = new THREE.Mesh(

    new THREE.BoxGeometry(w + 32, 8, d + 32),

    new THREE.MeshStandardMaterial({ color: 0xc8ced6, roughness: 0.5, metalness: 0.1 }),

  );

  plinthStep.position.set(cx, 4, cz);

  tagMesh(plinthStep);

  scene.add(plinthStep);



  const glassShell = new THREE.Mesh(

    new THREE.BoxGeometry(w + 6, towerH, d + 6),

    glassMat,

  );

  glassShell.position.set(cx, podiumH + towerH / 2, cz);

  tagMesh(glassShell, false, false);

  scene.add(glassShell);



  const capFrame = new THREE.Mesh(

    new THREE.BoxGeometry(w + 8, 6, d + 8),

    frameMat,

  );

  capFrame.position.set(cx, h + 3, cz);

  tagMesh(capFrame);

  scene.add(capFrame);



  const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(w + 4, 4, d + 4), roofMat);

  roofDeck.position.set(cx, h + 8, cz);

  tagMesh(roofDeck);

  scene.add(roofDeck);



  const penthouse = new THREE.Mesh(

    new THREE.BoxGeometry(w * 0.42, 22, d * 0.38),

    roofMat,

  );

  penthouse.position.set(cx, h + 22, cz);

  tagMesh(penthouse);

  scene.add(penthouse);



  const crownLed = new THREE.Mesh(

    new THREE.BoxGeometry(w + 10, 2, d + 10),

    accentMat,

  );

  crownLed.position.set(cx, h + 14, cz);

  tagMesh(crownLed, false, false);

  scene.add(crownLed);



  addFloorBands(cx, cz, w, d, h, podiumH, bandMat);

  addCornerFins(cx, cz, w, d, h, frameMat, accentMat);



  const canopy = new THREE.Mesh(

    new THREE.BoxGeometry(w * 0.55, 3, 14),

    glassMat,

  );

  canopy.position.set(cx, podiumH + 18, cz + d / 2 + 22);

  tagMesh(canopy, false, false);

  scene.add(canopy);



  let tex;

  try {

    tex = await loadProjectTexture(def.image);

  } catch (err) {

    console.warn('[project-building] Textura:', def.image, err);

    const fallback = new THREE.MeshStandardMaterial({ color: 0x5a6878, roughness: 0.5 });

    const box = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, towerH * 0.75, 4), fallback);

    box.position.set(cx, podiumH + towerH / 2, cz + d / 2 + 8);

    tagMesh(box);

    scene.add(box);

    return;

  }



  const facadeMat = makeBrightFacadeMaterial(tex);

  const inset = 8;

  const midY = podiumH + towerH / 2;

  const fw = w * 0.72;

  const fh = towerH * 0.82;

  const fd = d * 0.72;



  addProjectFacade(cx, midY, cz + d / 2 + inset, fw, fh, 0, facadeMat);

  addProjectFacade(cx, midY, cz - d / 2 - inset, fw, fh, Math.PI, facadeMat);

  addProjectFacade(cx + w / 2 + inset, midY, cz, fd, fh, Math.PI / 2, facadeMat);

  addProjectFacade(cx - w / 2 - inset, midY, cz, fd, fh, -Math.PI / 2, facadeMat);



  const signTex = makeNameSignTexture(def.name);

  const signW = Math.min(w * 0.55, 120);

  const signH = 36;

  const roofSign = new THREE.Mesh(

    new THREE.PlaneGeometry(signW, signH),

    makeNameSignMaterial(signTex),

  );

  roofSign.position.set(cx, h + 42, cz);

  roofSign.rotation.y = Math.PI;

  tagMesh(roofSign, false, false);

  scene.add(roofSign);



  const signPole = new THREE.Mesh(

    new THREE.BoxGeometry(4, 14, 4),

    new THREE.MeshStandardMaterial({ color: 0x2a3440, roughness: 0.35, metalness: 0.7 }),

  );

  signPole.position.set(cx, h + 28, cz);

  tagMesh(signPole);

  scene.add(signPole);

}



function makeNameSignMaterial(signTex) {

  return new THREE.MeshStandardMaterial({

    map: signTex,

    emissive: 0xff9b3a,

    emissiveMap: signTex,

    emissiveIntensity: 0.75,

    roughness: 0.28,

    metalness: 0.15,

    side: THREE.FrontSide,

  });

}



/** Placa na face de visita (scroll) — texto sempre legível de frente. */

export function addNamePlateAtFace(def, face) {

  const signTex = makeNameSignTexture(def.name);

  const signMat = makeNameSignMaterial(signTex);

  const { x: cx, z: cz, w, d } = def;

  const plateW = Math.min(w * 0.48, 96);

  const plateH = 28;

  const y = 26;

  const off = 52;

  let px = cx;

  let py = y;

  let pz = cz;

  let rotY = 0;

  switch (face) {

    case 'north':

      pz = cz - d / 2 - off;

      rotY = Math.PI;

      break;

    case 'east':

      px = cx + w / 2 + off;

      rotY = -Math.PI / 2;

      break;

    case 'west':

      px = cx - w / 2 - off;

      rotY = Math.PI / 2;

      break;

    default:

      pz = cz + d / 2 + off;

      rotY = 0;

      break;

  }

  const plate = new THREE.Mesh(new THREE.PlaneGeometry(plateW, plateH), signMat);

  plate.position.set(px, py, pz);

  plate.rotation.y = rotY;

  tagMesh(plate, false, false);

  scene.add(plate);

  const post = new THREE.Mesh(

    new THREE.BoxGeometry(3, 10, 3),

    new THREE.MeshStandardMaterial({ color: 0x2a3440, roughness: 0.35, metalness: 0.7 }),

  );

  post.position.set(px, py - 8, pz);

  tagMesh(post, false, false);

  scene.add(post);

}

