import { CITY } from '../config/constants.js';

import { materials as mat } from './textures.js';

import { addRealisticProjectBuilding } from './project-building.js';

import { addStreetSegment, addIntersection } from './streets.js';

import { scene } from '../core/scene.js';

import { colliders } from '../state/game.js';

import { THREE } from '../core/three.js';

import { WORLD_LAYER } from '../config/constants.js';



import { PROJECT_BUILDINGS } from '../player/gallery-nav.js';



function addBox(x, y, z, sx, sy, sz, material, collide) {

  const geo = new THREE.BoxGeometry(sx, sy, sz);

  const mesh = new THREE.Mesh(geo, material);

  mesh.position.set(x, y, z);

  mesh.frustumCulled = false;

  mesh.layers.set(WORLD_LAYER);

  mesh.castShadow = false;

  mesh.receiveShadow = false;

  scene.add(mesh);

  if (collide !== false) {

    colliders.push(new THREE.Box3(

      new THREE.Vector3(x - sx / 2, y - sy / 2, z - sz / 2),

      new THREE.Vector3(x + sx / 2, y + sy / 2, z + sz / 2),

    ));

  }

  return mesh;

}



function addBoundaryWalls() {

  const half = 1280;

  const h = 360;

  const thick = 90;

  const span = half * 2 + thick;

  const wallMat = mat.brickB;

  addBox(0, h / 2, -half, span, h, thick, wallMat, true);

  addBox(0, h / 2, half, span, h, thick, wallMat, true);

  addBox(-half, h / 2, 0, thick, h, span, wallMat, true);

  addBox(half, h / 2, 0, thick, h, span, wallMat, true);

}



export async function buildUrbanCity() {

  addBox(0, -50, 0, 3600, 100, 3600, mat.concrete, true);



  const ext = 1200;

  for (let i = -2; i <= 2; i++) {

    const off = i * CITY.block;

    addStreetSegment(0, off, ext * 2, CITY.streetW, 'ew');

    addStreetSegment(off, 0, CITY.streetW, ext * 2, 'ns');

  }



  for (let ix = -2; ix <= 2; ix++) {

    for (let iz = -2; iz <= 2; iz++) {

      addIntersection(ix * CITY.block, iz * CITY.block);

    }

  }



  for (let i = 0; i < PROJECT_BUILDINGS.length; i++) {

    await addRealisticProjectBuilding(PROJECT_BUILDINGS[i]);

  }



  addBoundaryWalls();

}

