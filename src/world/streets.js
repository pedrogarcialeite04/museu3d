import { THREE } from '../core/three.js';

import { CITY, WORLD_LAYER } from '../config/constants.js';

import { scene } from '../core/scene.js';

import { colliders } from '../state/game.js';

import { materials as mat } from './textures.js';



export const ROAD = {

  gutterW: 3,

  bikeW: 13,

  edgeLineW: 0.55,

  centerYellowW: 0.5,

  centerGap: 1.1,

  markY: 0.118,

  deckY: 0.055,

  deckH: 0.1,

};



const matCurbFace = () => mat.metal;

const matCurbTop = () => mat.concrete;

const matGutter = () => mat.asphalt;

const matWhite = () => mat.windowLit;

const matYellow = () => mat.neon;

const matBike = () => mat.facadeB;

const matCross = () => mat.windowLit;

const matDrain = () => mat.metal;



function addBox(x, y, z, sx, sy, sz, material, collide = false) {

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);

  mesh.position.set(x, y, z);

  mesh.frustumCulled = false;

  mesh.layers.set(WORLD_LAYER);

  mesh.castShadow = false;

  mesh.receiveShadow = false;

  scene.add(mesh);

  if (collide) {

    colliders.push(new THREE.Box3(

      new THREE.Vector3(x - sx / 2, y - sy / 2, z - sz / 2),

      new THREE.Vector3(x + sx / 2, y + sy / 2, z + sz / 2),

    ));

  }

  return mesh;

}



function addMark(cx, cy, cz, sx, sy, sz, material) {

  addBox(cx, cy, cz, sx, sy, sz, material, false);

}



function addRoadMarkings(x, z, len, axis) {

  const y = ROAD.markY;

  const mH = 0.042;

  const sw = CITY.streetW;

  const inner = sw / 2 - CITY.curbW - ROAD.gutterW - ROAD.bikeW - 2;

  const edgeOff = inner - ROAD.edgeLineW / 2;

  const lenUse = len * 0.96;

  const white = matWhite();

  const yellow = matYellow();



  function strip(off, w, material) {

    if (axis === 'ew') addMark(x, y, z + off, lenUse, mH, w, material);

    else addMark(x + off, y, z, w, mH, lenUse, material);

  }



  strip(-(ROAD.centerGap / 2 + ROAD.centerYellowW / 2), ROAD.centerYellowW, yellow);

  strip(ROAD.centerGap / 2 + ROAD.centerYellowW / 2, ROAD.centerYellowW, yellow);

  strip(-edgeOff, ROAD.edgeLineW, white);

  strip(edgeOff, ROAD.edgeLineW, white);

}



function addCurbSide(x, z, len, axis, side) {

  const curb = CITY.curbW;

  const sw = 26;

  const off = side * (CITY.streetW / 2 + curb / 2);

  const lenUse = len * 0.995;

  if (axis === 'ew') {

    addBox(x, ROAD.deckY + 0.2, z + off, lenUse, 0.36, curb, matCurbFace(), false);

    addBox(x, 0.24, z + side * (CITY.streetW / 2 + curb + sw / 2), lenUse, 0.36, sw, mat.sidewalk, false);

  } else {

    addBox(x + off, ROAD.deckY + 0.2, z, curb, 0.36, lenUse, matCurbFace(), false);

    addBox(x + side * (CITY.streetW / 2 + curb + sw / 2), 0.24, z, sw, 0.36, lenUse, mat.sidewalk, false);

  }

}



export function addStreetSegment(x, z, sx, sz, axis = sx > sz ? 'ew' : 'ns') {

  const len = axis === 'ew' ? sx : sz;

  addBox(x, ROAD.deckY, z, sx, ROAD.deckH, sz, mat.asphalt, true);

  const gutter = ROAD.gutterW;

  const offG = CITY.streetW / 2 - gutter / 2 - 0.5;

  if (axis === 'ew') {

    addBox(x, ROAD.deckY + 0.02, z - offG, len * 0.98, 0.06, gutter, matGutter(), false);

    addBox(x, ROAD.deckY + 0.02, z + offG, len * 0.98, 0.06, gutter, matGutter(), false);

  } else {

    addBox(x - offG, ROAD.deckY + 0.02, z, gutter, 0.06, len * 0.98, matGutter(), false);

    addBox(x + offG, ROAD.deckY + 0.02, z, gutter, 0.06, len * 0.98, matGutter(), false);

  }

  addRoadMarkings(x, z, len, axis);

  addCurbSide(x, z, len, axis, -1);

  addCurbSide(x, z, len, axis, 1);

}



export function addIntersection(x, z) {

  const size = CITY.streetW + 10;

  addBox(x, ROAD.deckY, z, size, ROAD.deckH, size, mat.asphalt, true);

}

