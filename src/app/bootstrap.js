import { THREE, assertThreeLoaded } from '../core/three.js';
import { initScene, renderer, camera, onResize, countVisibleMeshes } from '../core/scene.js';
import { initWorldMaterials } from '../world/textures.js';
import { buildUrbanCity } from '../world/city.js';
import { player } from '../state/game.js';
import { updatePlayerBox } from '../player/collision.js';
import { setupInput } from '../player/input.js';
import { initGalleryNav, setupGalleryScroll } from '../player/gallery-nav.js';
import { setupProjectPopup } from '../ui/project-popup.js';
import { initViewmodels } from '../combat/viewmodels.js';
import { initTracers, initImpacts } from '../combat/effects.js';
import { _cameraEuler } from '../core/scratch.js';

/**
 * Ordem de inicialização (evita usar renderer/scene antes de existirem).
 */
export async function bootstrapGame(canvas) {
  assertThreeLoaded();

  initScene(canvas);
  initWorldMaterials(renderer);
  await buildUrbanCity();
  initViewmodels();
  initTracers();
  initImpacts();
  setupInput(canvas);
  setupGalleryScroll(() => true);
  initGalleryNav();
  setupProjectPopup();

  window.addEventListener('resize', onResize);

  camera.position.set(player.pos.x, player.pos.y + player.eye, player.pos.z);
  _cameraEuler.set(player.pitch, player.yaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(_cameraEuler);
  updatePlayerBox();

  console.log(
    '[TacticalFPS] Three r' + THREE.REVISION +
    ' | meshes:', countVisibleMeshes(),
  );

}
