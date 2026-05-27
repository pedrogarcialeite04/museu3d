import { THREE } from './three.js';

import { WORLD_LAYER } from '../config/constants.js';



export let renderer;

export let scene;

export let camera;



export function initScene(canvas) {

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.setSize(window.innerWidth, window.innerHeight, false);

  renderer.shadowMap.enabled = true;

  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure = 1.14;

  renderer.setClearColor(0x6a7a94, 1);

  renderer.autoClear = true;



  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x6a7a94);

  scene.fog = new THREE.Fog(0x9aa8bc, 1200, 5400);



  camera = new THREE.PerspectiveCamera(

    90, window.innerWidth / window.innerHeight, 0.06, 8000,

  );

  camera.layers.set(WORLD_LAYER);

  scene.add(camera);



  const hemi = new THREE.HemisphereLight(0xffd8b0, 0x4a5a6e, 0.58);

  scene.add(hemi);



  const ambient = new THREE.AmbientLight(0xffece0, 0.4);

  scene.add(ambient);



  const sun = new THREE.DirectionalLight(0xffc080, 1.05);

  sun.position.set(680, 420, -920);

  sun.castShadow = false;

  scene.add(sun);



  const fill = new THREE.DirectionalLight(0xa8c0e0, 0.38);

  fill.position.set(-520, 280, 640);

  scene.add(fill);



  const rim = new THREE.DirectionalLight(0xff9870, 0.26);

  rim.position.set(-200, 180, 900);

  scene.add(rim);



  hemi.layers.enableAll();

  ambient.layers.enableAll();

  sun.layers.enableAll();

  fill.layers.enableAll();

  rim.layers.enableAll();



  addSkyDome();

}



function addSkyDome() {

  const skyGeo = new THREE.SphereGeometry(6000, 48, 24);

  const skyPos = skyGeo.attributes.position;

  const skyCol = new Float32Array(skyPos.count * 3);

  const cTop = new THREE.Color(0x4a5a78);

  const cMid = new THREE.Color(0x8a9ab8);

  const cBot = new THREE.Color(0xe8b898);

  for (let i = 0; i < skyPos.count; i++) {

    const y = skyPos.getY(i);

    const t = Math.max(0, Math.min(1, (y + 6000) / 12000));

    const c = cBot.clone().lerp(t > 0.5 ? cMid : cTop, t > 0.5 ? (t - 0.5) * 2 : t * 2);

    skyCol[i * 3] = c.r;

    skyCol[i * 3 + 1] = c.g;

    skyCol[i * 3 + 2] = c.b;

  }

  skyGeo.setAttribute('color', new THREE.BufferAttribute(skyCol, 3));

  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({

    vertexColors: true,

    side: THREE.BackSide,

    depthWrite: false,

    fog: false,

  }));

  sky.frustumCulled = false;

  sky.layers.set(WORLD_LAYER);

  scene.add(sky);

}



export function tagWorldLayer(root) {

  root.traverse((obj) => {

    if (obj.isMesh || obj.isLine) {

      obj.layers.set(WORLD_LAYER);

      obj.frustumCulled = false;

    }

  });

}



export function onResize() {

  renderer.setSize(window.innerWidth, window.innerHeight, false);

  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

}



export function countVisibleMeshes() {

  let n = 0;

  scene.traverse((o) => {

    if (o.isMesh && o.layers.test(camera.layers)) n++;

  });

  return n;

}


