import { THREE } from '../core/three.js';

export const JOKER_COLORS = {
  suitPurple: 0x4A0E69,
  waistcoatGreen: 0x3C8C2F,
  tieOrange: 0xF0A20F,
  shirtWhite: 0xE8E8E8,
  faceWhite: 0xFFFFFF,
  smileRed: 0xC62828,
  eyeBlack: 0x1A1A1A,
  hairGreen: 0x3C8C2F,
};

const _jM4 = new THREE.Matrix4();
const _jV3 = new THREE.Vector3();
const _jQ = new THREE.Quaternion();
const _jE = new THREE.Euler();
const _jC = new THREE.Color();

function jokerTransformGeo(geometry, px, py, pz, rx, ry, rz, sx, sy, sz) {
  _jE.set(rx, ry, rz);
  _jQ.setFromEuler(_jE);
  _jV3.set(sx, sy, sz);
  _jM4.compose(new THREE.Vector3(px, py, pz), _jQ, _jV3);
  const clone = geometry.clone();
  clone.applyMatrix4(_jM4);
  return clone;
}

function jokerAddParts(parent, partList, hex) {
  const mat = new THREE.MeshLambertMaterial({ color: hex });
  const group = new THREE.Group();
  for (let i = 0; i < partList.length; i++) {
    const p = partList[i];
    const mesh = new THREE.Mesh(p.geo, mat);
    mesh.position.set(p.x, p.y, p.z);
    mesh.rotation.set(p.rx || 0, p.ry || 0, p.rz || 0);
    mesh.scale.set(p.sx || 1, p.sy || 1, p.sz || 1);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  parent.add(group);
  return group;
}

export function buildJokerCharacter(parentGroup, animOffset) {
  const root = new THREE.Group();
  parentGroup.add(root);
  const rig = new THREE.Group();
  root.add(rig);

  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 12);
  const sphGeo = new THREE.SphereGeometry(1, 16, 12);

  jokerAddParts(rig, [
    { geo: cylGeo, x: -5, y: 11, z: 0, sx: 5, sy: 22, sz: 5 },
    { geo: cylGeo, x: 5, y: 11, z: 0, sx: 5, sy: 22, sz: 5 },
    { geo: boxGeo, x: 0, y: 36, z: 0, sx: 28, sy: 34, sz: 16 },
    { geo: boxGeo, x: 0, y: 30, z: -4, sx: 24, sy: 28, sz: 18 },
    { geo: boxGeo, x: -9, y: 24, z: -6, sx: 8, sy: 38, sz: 3, rz: 0.08 },
    { geo: boxGeo, x: 9, y: 24, z: -6, sx: 8, sy: 38, sz: 3, rz: -0.08 },
    { geo: boxGeo, x: -6, y: 10, z: -8, sx: 7, sy: 26, sz: 2.5, rz: 0.22 },
    { geo: boxGeo, x: 6, y: 10, z: -8, sx: 7, sy: 26, sz: 2.5, rz: -0.22 },
    { geo: boxGeo, x: -7, y: 44, z: 6, sx: 3, sy: 16, sz: 1, ry: 0.25 },
    { geo: boxGeo, x: 7, y: 44, z: 6, sx: 3, sy: 16, sz: 1, ry: -0.25 },
    { geo: sphGeo, x: -14, y: 52, z: 0, sx: 7, sy: 5, sz: 6 },
    { geo: sphGeo, x: 14, y: 52, z: 0, sx: 7, sy: 5, sz: 6 },
  ], JOKER_COLORS.suitPurple);

  const waistcoat = new THREE.Mesh(
    jokerTransformGeo(boxGeo, 0, 40, 7, 0, 0, 0, 18, 26, 5),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.waistcoatGreen }),
  );
  waistcoat.castShadow = true;
  rig.add(waistcoat);

  const shirt = new THREE.Mesh(
    jokerTransformGeo(boxGeo, 0, 42, 8, 0, 0, 0, 14, 22, 3),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.shirtWhite }),
  );
  shirt.castShadow = true;
  rig.add(shirt);

  const tie = new THREE.Mesh(
    jokerTransformGeo(boxGeo, 0, 44, 9.5, 0.08, 0, 0, 3.5, 18, 1.8),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.tieOrange }),
  );
  tie.castShadow = true;
  rig.add(tie);

  const armGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
  const armL = new THREE.Mesh(
    jokerTransformGeo(armGeo, -15, 42, 0, 0, 0, 0.18, 4.2, 28, 4.2),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.suitPurple }),
  );
  const armR = new THREE.Mesh(
    jokerTransformGeo(armGeo, 15, 42, 0, 0, 0, -0.18, 4.2, 28, 4.2),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.suitPurple }),
  );
  const cuffL = new THREE.Mesh(
    jokerTransformGeo(boxGeo, -15, 30, 1, 0, 0, 0, 5, 4, 5),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.shirtWhite }),
  );
  const cuffR = new THREE.Mesh(
    jokerTransformGeo(boxGeo, 15, 30, 1, 0, 0, 0, 5, 4, 5),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.shirtWhite }),
  );
  armL.castShadow = armR.castShadow = true;
  rig.add(armL, armR, cuffL, cuffR);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 70, 0);
  rig.add(headGroup);

  const head = new THREE.Mesh(
    jokerTransformGeo(sphGeo, 0, 0, 0, 0, 0, 0, 12.5, 11.5, 11.8),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.faceWhite }),
  );
  head.castShadow = true;
  headGroup.add(head);

  const hairlineCap = new THREE.Mesh(
    jokerTransformGeo(sphGeo, 0, 5.5, -1, -0.35, 0, 0, 12, 6, 11),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.faceWhite }),
  );
  headGroup.add(hairlineCap);

  const cheekGeo = new THREE.SphereGeometry(1, 10, 8);
  const cheekL = new THREE.Mesh(
    jokerTransformGeo(cheekGeo, -6.5, -1, 6, 0, 0, 0.3, 4.2, 2.8, 3.6),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.faceWhite }),
  );
  const cheekR = new THREE.Mesh(
    jokerTransformGeo(cheekGeo, 6.5, -1, 6, 0, 0, -0.3, 4.2, 2.8, 3.6),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.faceWhite }),
  );
  headGroup.add(cheekL, cheekR);

  const eyeMat = new THREE.MeshLambertMaterial({
    color: JOKER_COLORS.eyeBlack,
    emissive: new THREE.Color(JOKER_COLORS.eyeBlack),
  });
  const eyeSocketGeo = new THREE.SphereGeometry(1, 12, 10);
  const eyeL = new THREE.Mesh(
    jokerTransformGeo(eyeSocketGeo, -4.8, 2.5, 7.5, 0, 0, 0.15, 4.2, 2.6, 2.2),
    eyeMat,
  );
  const eyeR = new THREE.Mesh(
    jokerTransformGeo(eyeSocketGeo, 4.8, 2.5, 7.5, 0, 0, -0.15, 4.2, 2.6, 2.2),
    eyeMat,
  );
  const smearGeo = new THREE.BoxGeometry(1, 1, 1);
  const smearL = new THREE.Mesh(
    jokerTransformGeo(smearGeo, -5.5, 1, 7, 0, 0, 0.4, 2.5, 1.2, 1.5),
    eyeMat,
  );
  const smearR = new THREE.Mesh(
    jokerTransformGeo(smearGeo, 5.5, 1, 7, 0, 0, -0.4, 2.5, 1.2, 1.5),
    eyeMat,
  );
  headGroup.add(eyeL, eyeR, smearL, smearR);

  const smileMat = new THREE.MeshLambertMaterial({
    color: JOKER_COLORS.smileRed,
    emissive: new THREE.Color(JOKER_COLORS.smileRed),
  });
  const smileArc = new THREE.Mesh(
    new THREE.TorusGeometry(7.5, 1.1, 10, 36, Math.PI * 0.82),
    smileMat,
  );
  smileArc.rotation.x = Math.PI * 0.5;
  smileArc.rotation.z = Math.PI;
  smileArc.position.set(0, -3.5, 8.2);
  headGroup.add(smileArc);

  const cornerGeo = new THREE.BoxGeometry(1, 1, 1);
  const cornerL = new THREE.Mesh(cornerGeo, smileMat);
  cornerL.position.set(-7.8, -2.2, 7.8);
  cornerL.rotation.set(0.2, 0.35, -0.55);
  cornerL.scale.set(3.2, 1.4, 1.8);
  const cornerR = new THREE.Mesh(cornerGeo, smileMat);
  cornerR.position.set(7.8, -2.2, 7.8);
  cornerR.rotation.set(0.2, -0.35, 0.55);
  cornerR.scale.set(3.2, 1.4, 1.8);
  headGroup.add(cornerL, cornerR);

  const lipLine = new THREE.Mesh(
    jokerTransformGeo(boxGeo, 0, -4.8, 8.5, 0.15, 0, 0, 10, 0.8, 1.2),
    smileMat,
  );
  headGroup.add(lipLine);

  const hairMat = new THREE.MeshLambertMaterial({ color: JOKER_COLORS.hairGreen });
  const hairClumps = [];
  const hairSeed = (animOffset || 0) * 9973.0;
  for (let i = 0; i < 22; i++) {
    const t = i / 22;
    const angle = t * Math.PI * 2 + hairSeed * 0.01;
    const rad = 8 + (i % 5) * 1.2;
    const hx = Math.cos(angle) * rad * 0.55;
    const hz = Math.sin(angle) * rad * 0.45 - 2;
    const hy = 7 + (i % 4) * 1.8 + Math.sin(i * 2.7 + hairSeed) * 1.5;
    const clump = new THREE.Mesh(
      jokerTransformGeo(
        boxGeo, hx, hy, hz,
        Math.sin(i * 1.3) * 0.5, angle * 0.2, Math.cos(i * 0.9) * 0.4,
        1.8 + (i % 3) * 0.6, 3.5 + (i % 4), 1.4 + (i % 2),
      ),
      hairMat,
    );
    clump.castShadow = true;
    headGroup.add(clump);
    hairClumps.push(clump);
  }

  const gloveL = new THREE.Mesh(
    jokerTransformGeo(sphGeo, -15, 16, 2, 0, 0, 0, 4.5, 4.5, 4.5),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.faceWhite }),
  );
  const gloveR = new THREE.Mesh(
    jokerTransformGeo(sphGeo, 15, 16, 2, 0, 0, 0, 4.5, 4.5, 4.5),
    new THREE.MeshLambertMaterial({ color: JOKER_COLORS.faceWhite }),
  );
  gloveL.castShadow = gloveR.castShadow = true;
  rig.add(gloveL, gloveR);

  return {
    root,
    rig,
    headGroup,
    parts: {
      armL, armR, hairClumps,
    },
    emissiveMats: { smileMat, eyeMat },
    animOffset: animOffset || 0,
    animTime: 0,
  };
}

export function updateJokerCharacter(joker, time, dt, state, hurtBoost) {
  joker.animTime += dt;
  const t = time + joker.animOffset;
  const s = state || 'idle';
  const hurt = hurtBoost || 0;

  if (s !== 'dead') {
    joker.root.rotation.x = 0.14 + Math.sin(t * 1.65) * 0.07 + Math.sin(t * 3.37) * 0.035;
    joker.root.rotation.z = Math.sin(t * 2.21) * 0.09 + Math.sin(t * 5.83) * 0.045;
    joker.rig.rotation.x = Math.sin(t * 1.47) * 0.04;
    joker.root.position.y = Math.abs(Math.sin(t * 4.05)) * 1.8 + Math.sin(t * 7.11) * 0.6;

    joker.headGroup.rotation.z = Math.sin(t * 6.17) * 0.07 + Math.sin(t * 11.3) * 0.03;
    joker.headGroup.rotation.y = Math.sin(t * 2.87) * 0.09;
    joker.headGroup.rotation.x = -0.05 + Math.sin(t * 4.44) * 0.04;

    const armWave = Math.sin(t * 3.2);
    joker.parts.armL.rotation.x = -0.35 + armWave * 0.55;
    joker.parts.armR.rotation.x = -0.15 - armWave * 0.75;
    joker.parts.armL.rotation.z = 0.25 + Math.sin(t * 5.1) * 0.2;
    joker.parts.armR.rotation.z = -0.35 - Math.sin(t * 4.6) * 0.25;

    if (s === 'chase') {
      joker.root.rotation.x += 0.08;
      joker.parts.armL.rotation.x -= 0.4;
    } else if (s === 'attack') {
      joker.root.rotation.x += 0.12;
      joker.parts.armL.rotation.x = -1.3;
      joker.parts.armR.rotation.x = -0.9;
    }

    const clumps = joker.parts.hairClumps;
    for (let i = 0; i < clumps.length; i++) {
      clumps[i].rotation.z = Math.sin(t * (8 + i * 0.7) + i) * 0.12;
    }
  }

  const smilePulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 4.5)) + hurt * 1.4;
  const eyePulse = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 7.3 + 1.2)) + hurt * 0.8;
  const eyeFlicker = Math.sin(t * 19.7) > 0.85 ? 0.15 : 1.0;

  _jC.setHex(JOKER_COLORS.smileRed);
  _jC.multiplyScalar(0.35 + smilePulse * 1.1);
  joker.emissiveMats.smileMat.emissive.copy(_jC);

  _jC.setHex(JOKER_COLORS.eyeBlack);
  _jC.multiplyScalar((0.15 + eyePulse * 0.85) * eyeFlicker);
  joker.emissiveMats.eyeMat.emissive.setRGB(
    _jC.r * 0.4 + eyePulse * 0.08,
    _jC.g * 0.1,
    _jC.b * 0.4 + eyePulse * 0.15,
  );
}
