import { THREE } from '../core/three.js';
import { ENEMY, WORLD_LAYER } from '../config/constants.js';
import { scene, tagWorldLayer } from '../core/scene.js';
import { enemies, player, stats } from '../state/game.js';
import { enemyAabbCollides } from '../player/collision.js';
import { buildJokerCharacter, updateJokerCharacter } from './joker-model.js';
import { showHitMarker, pushKillFeed, damagePlayer } from '../ui/hud.js';

export function createEnemy(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.layers.set(WORLD_LAYER);
  scene.add(group);
  const joker = buildJokerCharacter(group, x * 0.01 + z * 0.007);
  tagWorldLayer(group);

  const enemy = {
    group,
    joker,
    pos: group.position,
    vel: new THREE.Vector3(),
    hp: ENEMY.hp,
    alive: true,
    state: 'idle',
    yaw: 0,
    moveSpeed: ENEMY.moveSpeed,
    headPos: new THREE.Vector3(),
    headRadius: ENEMY.headRadius,
    bodyMin: new THREE.Vector3(),
    bodyMax: new THREE.Vector3(),
    bodyBox: null,
    hurtFlash: 0,
    deathT: 0,
    respawnT: 0,
    spawn: new THREE.Vector3(x, 0, z),
    attackT: 0,
  };
  enemy.bodyBox = { min: enemy.bodyMin, max: enemy.bodyMax };
  updateEnemyHitbox(enemy);
  enemies.push(enemy);
  return enemy;
}

export function updateEnemyHitbox(e) {
  e.headPos.set(e.pos.x, e.pos.y + 70, e.pos.z);
  e.bodyMin.set(e.pos.x - 14, e.pos.y, e.pos.z - 14);
  e.bodyMax.set(e.pos.x + 14, e.pos.y + 62, e.pos.z + 14);
}

export function damageEnemy(e, dmg, zone) {
  if (!e.alive) return;
  e.hp -= dmg;
  e.hurtFlash = 0.18;
  showHitMarker(zone === 'head');
  if (e.hp <= 0) {
    e.alive = false;
    e.deathT = ENEMY.deathDuration;
    e.respawnT = ENEMY.respawnDelay;
    stats.kills++;
    pushKillFeed(zone === 'head' ? 'JOKER HEADSHOT' : 'JOKER DOWN');
  }
}

export function tickEnemy(e, dt) {
  const nowSec = performance.now() * 0.001;

  if (!e.alive) {
    e.deathT -= dt;
    e.respawnT -= dt;
    const fallU = 1 - Math.max(0, e.deathT / ENEMY.deathDuration);
    e.joker.root.rotation.x = -fallU * (Math.PI / 2);
    e.group.position.y = -fallU * 6;
    updateJokerCharacter(e.joker, nowSec, dt, 'dead', 0);
    if (e.respawnT <= 0) {
      e.pos.copy(e.spawn);
      e.group.rotation.set(0, 0, 0);
      e.group.position.y = 0;
      e.joker.root.rotation.set(0, 0, 0);
      e.joker.root.position.y = 0;
      e.hp = ENEMY.hp;
      e.alive = true;
      e.hurtFlash = 0;
      updateEnemyHitbox(e);
    }
    return;
  }

  const dx = player.pos.x - e.pos.x;
  const dz = player.pos.z - e.pos.z;
  const distSq = dx * dx + dz * dz;
  const dist = Math.sqrt(distSq);

  e.yaw = Math.atan2(dx, dz);
  e.group.rotation.y = e.yaw;

  if (e.attackT > 0) e.attackT -= dt;

  if (dist > ENEMY.attackRange && dist < ENEMY.sightRange && !player.dead) {
    e.state = 'chase';
    const ndx = dx / dist;
    const ndz = dz / dist;
    e.vel.x = ndx * e.moveSpeed;
    e.vel.z = ndz * e.moveSpeed;
  } else if (dist <= ENEMY.attackRange && !player.dead) {
    e.state = 'attack';
    e.vel.x *= 0.5;
    e.vel.z *= 0.5;
    damagePlayer(ENEMY.damagePerSec * dt);
    if (e.attackT <= 0) e.attackT = ENEMY.attackCooldown;
  } else {
    e.state = 'idle';
    e.vel.x *= 0.6;
    e.vel.z *= 0.6;
  }

  const idx = e.vel.x * dt;
  const idz = e.vel.z * dt;

  e.pos.x += idx;
  updateEnemyHitbox(e);
  if (enemyAabbCollides(e)) {
    e.pos.x -= idx;
    e.vel.x = 0;
    updateEnemyHitbox(e);
  }

  e.pos.z += idz;
  updateEnemyHitbox(e);
  if (enemyAabbCollides(e)) {
    e.pos.z -= idz;
    e.vel.z = 0;
    updateEnemyHitbox(e);
  }

  if (e.hurtFlash > 0) e.hurtFlash -= dt;
  const hurtU = e.hurtFlash > 0 ? e.hurtFlash / 0.18 : 0;
  updateJokerCharacter(e.joker, nowSec, dt, e.state, hurtU);
}

export function spawnEnemies() {
  /* Inimigos desativados — galeria de projetos */
}
