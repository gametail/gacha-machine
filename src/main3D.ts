import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import {
  applyUIEffects,
  hideInteractableUI,
  setAndPlayVideo,
  updateDisplay,
} from "./ui.ts";
import { rollEntry } from "./gamble.js";
import { getState, setState } from "./state.ts";
import { AnimationCollection, LightConfig } from "./types.ts";

export async function initialize3D() {
  const stats = setupStats(false);
  setState("stats", stats);

  const renderer = setupRenderer();
  setState("renderer", renderer);

  const { scene, camera } = setupScene();
  setState("scene", scene);
  setState("camera", camera);

  const { bodyMaterial, capsuleMaterial, glassMaterial } =
    setupMaterials(scene);
  setState("capsuleMaterial", capsuleMaterial);

  const { lightsConfig } = getState();
  const lightRefs = setupLights(lightsConfig, scene);
  setState("lightRefs", lightRefs);

  setupResizeEventlistener(camera, renderer);

  //Load all scene Objects + Animations
  setState("animSequencePlaying", false);
  const animationCollection = await loadSceneObjects(
    scene,
    capsuleMaterial,
    bodyMaterial,
    glassMaterial
  );

  if (animationCollection) {
    setState("animationCollection", animationCollection);
  }

  //SceneHelpers
  setupSceneHelpers(scene, false);
  setupLightHelpers(lightRefs, scene, false, 0.4);

  //Controls
  // const controls = new OrbitControls(camera, renderer.domElement);

  const gui = new GUI();
  gui.hide();

  return {
    scene,
    camera,
    renderer,
    stats,
    bodyMaterial,
    capsuleMaterial,
    glassMaterial,
    lightRefs,
    animationCollection,
  };
}

function setupStats(show: boolean) {
  const stats = new Stats();
  stats.showPanel(0);

  if (show) {
    document.body.appendChild(stats.dom);
  }
  return stats;
}

// function lightsFolderForGUI() {
//   const paramsLights = {
//     showLightGizmo: showLightHelpers,
//     colorA: 0x9093ff,
//     intensityA: 15,
//     colorB: 0xffaa87,
//     intensityB: 30,
//     colorC: 0xbee8ff,
//     intensityC: 10,
//     colorD: 0xbee8ff,
//     intensityD: 10,
//   };

//   const folderLights = gui.addFolder("Lights");
//   folderLights.add(paramsLights, "showLightGizmo").onChange((newValue) => {
//     const lightHelperA = scene.getObjectByName(
//       "LightHelperA"
//     ) as THREE.PointLightHelper;
//     const lightHelperB = scene.getObjectByName(
//       "LightHelperB"
//     ) as THREE.PointLightHelper;
//     const lightHelperC = scene.getObjectByName(
//       "LightHelperC"
//     ) as THREE.PointLightHelper;
//     const lightHelperD = scene.getObjectByName(
//       "LightHelperD"
//     ) as THREE.PointLightHelper;
//     if (!(lightHelperA && lightHelperB && lightHelperC && lightHelperD)) return;

//     lightHelperA.visible = newValue;
//     lightHelperB.visible = newValue;
//     lightHelperC.visible = newValue;
//     lightHelperD.visible = newValue;
//   });
//   folderLights.addColor(paramsLights, "colorA").onChange((newColor) => {
//     const light = scene.getObjectByName("lightA") as THREE.PointLight;

//     if (light) {
//       light.color.set(newColor);
//     }
//   });
//   folderLights
//     .add(paramsLights, "intensityA", 0, 100)
//     .onChange((newIntensity) => {
//       const light = scene.getObjectByName("lightA") as THREE.PointLight;
//       if (light) {
//         light.intensity = newIntensity;
//       }
//     });
//   folderLights.addColor(paramsLights, "colorB").onChange((newColor) => {
//     const light = scene.getObjectByName("lightB") as THREE.PointLight;
//     if (light) {
//       light.color.set(newColor);
//     }
//   });
//   folderLights
//     .add(paramsLights, "intensityB", 0, 100)
//     .onChange((newIntensity) => {
//       const light = scene.getObjectByName("lightB") as THREE.PointLight;
//       if (light) {
//         light.intensity = newIntensity;
//       }
//     });
//   folderLights.addColor(paramsLights, "colorC").onChange((newColor) => {
//     const light = scene.getObjectByName("lightC") as THREE.PointLight;
//     if (light) {
//       light.color.set(newColor);
//     }
//   });
//   folderLights
//     .add(paramsLights, "intensityC", 0, 100)
//     .onChange((newIntensity) => {
//       const light = scene.getObjectByName("lightC") as THREE.PointLight;
//       if (light) {
//         light.intensity = newIntensity;
//       }
//     });
//   folderLights.addColor(paramsLights, "colorD").onChange((newColor) => {
//     const light = scene.getObjectByName("lightD") as THREE.PointLight;
//     if (light) {
//       light.color.set(newColor);
//     }
//   });
//   folderLights
//     .add(paramsLights, "intensityD", 0, 100)
//     .onChange((newIntensity) => {
//       const light = scene.getObjectByName("lightD") as THREE.PointLight;
//       if (light) {
//         light.intensity = newIntensity;
//       }
//     });
// }

function setupSceneHelpers(scene: THREE.Scene, showSceneHelpers: boolean) {
  const axesHelper = new THREE.AxesHelper(5);
  axesHelper.visible = showSceneHelpers;
  const gridHelper = new THREE.GridHelper(10, 10);
  gridHelper.visible = showSceneHelpers;

  scene.add(axesHelper);
  scene.add(gridHelper);
}

// function sceneHelpersFolderGUI() {
//   const paramsScene = {
//     showSceneHelpers,
//   };
//   const folderScene = gui.addFolder("Scene");
//   gui.close();
//   folderScene.add(paramsScene, "showSceneHelpers").onChange((newValue) => {
//     axesHelper.visible = newValue;
//     gridHelper.visible = newValue;
//   });
// }

function setupRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMappingExposure = 1;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  return renderer;
}

function setupScene() {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    15,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, -1.48, 16);
  camera.rotateX(THREE.MathUtils.degToRad(3));
  // controls.update();

  //Evironment Map
  const textureLoader = new THREE.TextureLoader();
  const textureEquirec = textureLoader.load(
    `${import.meta.env.BASE_URL}assets/LowPoly/textures/GachaRoom.jpeg`
  );
  textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  textureEquirec.colorSpace = THREE.SRGBColorSpace;
  scene.environment = textureEquirec;
  scene.background = textureEquirec;

  return { scene, camera };
}

function setupMaterials(scene: THREE.Scene) {
  const envMap = scene.environment;
  //Materials
  const roughness = 0;
  const metalness = 0;
  const envMapIntensity = 1;

  const capsuleMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness,
    roughness,
    envMap,
    envMapIntensity,
  });

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0.86, 0.36, 0),
    metalness: 0,
    roughness: 0,
    envMap,
    envMapIntensity,
    side: THREE.DoubleSide,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    roughness: 0,
    clearcoat: 1,
    transparent: true,
    transmission: 1,
    opacity: 1,
    reflectivity: 0.2,
    envMap,
    envMapIntensity: 0.4,
    side: THREE.DoubleSide,
  });
  return { capsuleMaterial, bodyMaterial, glassMaterial };
}

async function loadSceneObjects(
  scene: THREE.Scene,
  capsuleMaterial: THREE.MeshStandardMaterial,
  bodyMaterial: THREE.MeshStandardMaterial,
  glassMaterial: THREE.MeshPhysicalMaterial
) {
  const loader = new GLTFLoader();

  const { metalness, roughness, envMap } = capsuleMaterial;

  let dropBall: THREE.Object3D | undefined = undefined,
    coin: THREE.Object3D | undefined = undefined,
    knob: THREE.Object3D | undefined = undefined,
    gltfMachine: GLTF | undefined = undefined,
    singleCapsule: THREE.Object3D | undefined = undefined,
    gltfSingleCapsule: GLTF | undefined = undefined;

  //Load Main Scene
  let gltf = await loader.loadAsync(
    `${import.meta.env.BASE_URL}assets/LowPoly/Gacha.gltf`
  );

  const gachaMachineScene = gltf.scene;
  gltfMachine = gltf;
  scene.add(gachaMachineScene);

  coin = gachaMachineScene.getObjectByName("CoinPickup001");
  knob = gachaMachineScene.getObjectByName("turningKnob001");
  dropBall = gachaMachineScene.getObjectByName("DropBall001");

  (dropBall as THREE.Mesh).material = capsuleMaterial;

  const ballsMat = (
    gachaMachineScene.getObjectByName("BallsLowPoly001") as THREE.Mesh
  ).material as THREE.MeshStandardMaterial;
  ballsMat.metalness = metalness;
  ballsMat.roughness = roughness;
  ballsMat.envMap = envMap;

  const machineBallsMat = (
    gachaMachineScene.getObjectByName("MachineBallsLowPoly001") as THREE.Mesh
  ).material as THREE.MeshStandardMaterial;
  machineBallsMat.metalness = metalness;
  machineBallsMat.roughness = roughness;
  machineBallsMat.envMap = envMap;

  const room = gachaMachineScene.getObjectByName("Room001") as THREE.Mesh;
  (room.material as THREE.MeshBasicMaterial).side = THREE.FrontSide;

  const machineBody = gachaMachineScene.getObjectByName(
    "gachaBody001"
  ) as THREE.Mesh;

  machineBody.material = bodyMaterial;

  const machineInsert = gachaMachineScene.getObjectByName(
    "gachaCoinInsert001"
  ) as THREE.Mesh;
  machineInsert.material = bodyMaterial;

  (gachaMachineScene.getObjectByName("gachaGlass001") as THREE.Mesh).material =
    glassMaterial;
  (gachaMachineScene.getObjectByName("Window001") as THREE.Mesh).material =
    glassMaterial;

  //Load Single Capsule
  gltf = await loader.loadAsync(
    `${import.meta.env.BASE_URL}assets/SingleCapsule/SingleCapsule.gltf`
  );
  gltf.scene.traverse(function (object) {
    object.frustumCulled = false;
  });
  singleCapsule = gltf.scene;
  gltfSingleCapsule = gltf;

  scene.add(singleCapsule);

  // singleCapsule.position.set(0, -1.18, 11); Far
  singleCapsule.position.set(0, -1.374, 14);

  (singleCapsule.getObjectByName("SingleCapsule") as THREE.Mesh).material =
    capsuleMaterial;

  if (
    dropBall &&
    coin &&
    knob &&
    gltfMachine &&
    singleCapsule &&
    gltfSingleCapsule
  ) {
    return setupAnimations(
      dropBall,
      coin,
      knob,
      gltfMachine,
      singleCapsule,
      gltfSingleCapsule
    );
  }
}

function setupAnimations(
  dropBall: THREE.Object3D,
  coin: THREE.Object3D,
  knob: THREE.Object3D,
  gltfMachine: GLTF,
  singleCapsule: THREE.Object3D,
  gltfSingleCapsule: GLTF
) {
  let mixerCoin: THREE.AnimationMixer,
    mixerDrop: THREE.AnimationMixer,
    mixerKnob: THREE.AnimationMixer,
    actionCoin: THREE.AnimationAction,
    actionKnob: THREE.AnimationAction,
    actionDrop: THREE.AnimationAction;

  let mixerSingleCapsule: THREE.AnimationMixer,
    actionSlideIn: THREE.AnimationAction,
    actionIdleClose: THREE.AnimationAction,
    actionOpen: THREE.AnimationAction,
    actionIdleOpened: THREE.AnimationAction,
    actionSlideOut: THREE.AnimationAction;

  //Animation
  //Dropped ball

  mixerDrop = new THREE.AnimationMixer(dropBall);
  actionDrop = mixerDrop.clipAction(gltfMachine.animations[1]);
  actionDrop.setLoop(THREE.LoopOnce, 1);

  mixerDrop.addEventListener("finished", () => {
    actionSlideIn?.reset();
    actionSlideIn?.play();
  });

  //Coin insert

  mixerCoin = new THREE.AnimationMixer(coin);
  actionCoin = mixerCoin.clipAction(gltfMachine.animations[2]);
  actionCoin.setLoop(THREE.LoopOnce, 1);

  mixerCoin.addEventListener("finished", () => {
    actionKnob?.reset();
    actionKnob?.play();
  });

  //Turning knob

  mixerKnob = new THREE.AnimationMixer(knob);
  actionKnob = mixerKnob.clipAction(gltfMachine.animations[0]);
  actionKnob.setLoop(THREE.LoopOnce, 1);

  mixerKnob.addEventListener("finished", () => {
    actionDrop?.reset();
    actionDrop?.play();
  });

  //Animation Single Capsule
  mixerSingleCapsule = new THREE.AnimationMixer(singleCapsule);
  actionIdleClose = mixerSingleCapsule.clipAction(
    gltfSingleCapsule.animations[0]
  );
  actionIdleClose.setLoop(THREE.LoopOnce, 1);
  actionIdleOpened = mixerSingleCapsule.clipAction(
    gltfSingleCapsule.animations[1]
  );
  actionIdleOpened.setLoop(THREE.LoopOnce, 1);
  actionOpen = mixerSingleCapsule.clipAction(gltfSingleCapsule.animations[2]);
  actionOpen.setLoop(THREE.LoopOnce, 1);
  actionSlideIn = mixerSingleCapsule.clipAction(
    gltfSingleCapsule.animations[3]
  );
  actionSlideIn.setLoop(THREE.LoopOnce, 1);
  actionSlideOut = mixerSingleCapsule.clipAction(
    gltfSingleCapsule.animations[4]
  );
  actionSlideOut.setLoop(THREE.LoopOnce, 1);

  mixerSingleCapsule.addEventListener("finished", (event) => {
    const lastActionName = event.action.getClip().name;
    if (lastActionName === "SlideIn") {
      actionOpen.reset();
      actionOpen.play();
      updateDisplay();
    }
    if (lastActionName === "Open") {
      actionSlideOut.reset();
      actionSlideOut.play();
    }
    if (lastActionName === "SlideOut") {
      setState("animSequencePlaying", false);
      applyUIEffects();
    }
  });

  const animationCollection: AnimationCollection = {
    mixers: {
      coin: mixerCoin,
      ballDrop: mixerDrop,
      knob: mixerKnob,
      singleCapsule: mixerSingleCapsule,
    },
    actions: {
      coin: actionCoin,
    },
  };

  return animationCollection;
}

// function capsuleFolderGUI(singleCapsule: THREE.Object3D) {
//   const paramsCapsule = {
//     positionX: singleCapsule.position.x,
//     positionY: singleCapsule.position.y,
//     positionZ: singleCapsule.position.z,
//   };
//   const folderCapsule = gui.addFolder("Capsule");
//   folderCapsule
//     .add(paramsCapsule, "positionX", -20, 40)
//     .onChange((newValue) => singleCapsule.position.setX(newValue));
//   folderCapsule
//     .add(paramsCapsule, "positionY", -20, 40)
//     .onChange((newValue) => singleCapsule.position.setY(newValue));
//   folderCapsule
//     .add(paramsCapsule, "positionZ", -20, 40)
//     .onChange((newValue) => singleCapsule.position.setZ(newValue));
// }

function setRandomCapsuleColor() {
  const rarities = ["common", "rare", "epic", "legendary"];
  const rarity = rarities[Math.round(Math.random() * (rarities.length - 1))];
  const { capsuleMaterial } = getState();

  if (!capsuleMaterial) throw new Error("Capsule material in state is null");

  //set video for potato mode
  setAndPlayVideo(rarity);

  switch (rarity) {
    case "common":
      capsuleMaterial.color.setHex(0xffffff);
      break;
    case "rare":
      capsuleMaterial.color.setHex(0x0084ff);
      break;
    case "epic":
      capsuleMaterial.color.setHex(0xa300ff);

      break;
    case "legendary":
      capsuleMaterial.color.setHex(0xffa600);

      break;
    default:
      console.log("wrong key material rarity switch");
      capsuleMaterial.color.setHex(0x000000);
      break;
  }
}

function setupLights(lightsConfig: LightConfig[], scene: THREE.Scene) {
  const lightRefs: THREE.PointLight[] = [];
  lightsConfig.forEach((lightConfig) => {
    const light = new THREE.PointLight(
      lightConfig.color,
      lightConfig.intensity
    );
    light.name = lightConfig.name;
    const { x, y, z } = lightConfig.position;
    light.position.set(x, y, z);
    scene.add(light);
    lightRefs.push(light);
  });

  return lightRefs;
}

function setupLightHelpers(
  lights: THREE.PointLight[],
  scene: THREE.Scene,
  showLightHelpers: boolean,
  lightHelperGizmoSize: number
) {
  lights.forEach((light) => {
    const helper = new THREE.PointLightHelper(
      light,
      lightHelperGizmoSize,
      light.color
    );
    helper.name = light.name + "Helper";
    helper.visible = showLightHelpers;
    scene.add(helper);
  });
}

// function folderCameraGUI(camera: THREE.PerspectiveCamera) {
//   const paramsCamera = {
//     positionX: camera.position.x,
//     positionY: camera.position.y,
//     positionZ: camera.position.z,
//     near: camera.near,
//     far: camera.far,
//   };

//   const folderCamera = gui.addFolder("Camera");
//   folderCamera.add(paramsCamera, "positionX", -20, 40).onChange((newValue) => {
//     camera.position.setX(newValue);
//     // controls.update();
//   });
//   folderCamera.add(paramsCamera, "positionY", -20, 40).onChange((newValue) => {
//     camera.position.setY(newValue);
//     // controls.update();
//   });
//   folderCamera.add(paramsCamera, "positionZ", -20, 40).onChange((newValue) => {
//     camera.position.setZ(newValue);
//     // controls.update();
//   });
//   folderCamera.add(paramsCamera, "near", 0.001, 40).onChange((newValue) => {
//     camera.near = newValue;
//     camera.updateProjectionMatrix();
//   });
//   folderCamera.add(paramsCamera, "far", 41, 5000).onChange((newValue) => {
//     camera.far = newValue;
//     camera.updateProjectionMatrix();
//   });
// }

export function playAnimationSequence(UICallback?: () => any) {
  const { animSequencePlaying, animationCollection, chanceConfig } = getState();

  if (!animSequencePlaying) {
    hideInteractableUI();
    const rolledEntry = rollEntry(chanceConfig);
    setState("rolledEntry", rolledEntry);

    setRandomCapsuleColor();

    UICallback?.();

    setState("animSequencePlaying", true);

    animationCollection?.actions.coin.reset();
    animationCollection?.actions.coin.play();
  }
}

function setupResizeEventlistener(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.Renderer
) {
  //Rerender when window size changes
  window.addEventListener("resize", onWindowChange, false);
  function onWindowChange() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export function animate() {
  requestAnimationFrame(() => animate());
  const {
    lightsConfig,
    lightRefs,
    stats,
    renderer,
    camera,
    scene,
    clock,
    animationCollection,
    potatoMode: potato,
  } = getState();
  if (!renderer) throw new Error("Renderer state is null");
  if (!scene) throw new Error("Scene state is null");
  if (!camera) throw new Error("Camera state is null");

  stats?.begin();

  const delta = clock.getDelta();

  //Update Animations
  if (animationCollection) {
    const { mixers } = animationCollection;
    const { coin, knob, ballDrop, singleCapsule } = mixers;

    singleCapsule.update(delta);
    ballDrop.update(delta);
    knob.update(delta);
    coin.update(delta);
  }

  // Calculate the pulsing intensity using a sine wave
  const time = Date.now() * 0.001; // Convert time to seconds

  // Update each light's intensity
  const filteredConfig = lightsConfig.filter(
    (config) => config.pulseParams !== undefined
  );
  filteredConfig.forEach((config) => {
    const { pulseParams: params } = config;
    if (!params) return;

    const light = lightRefs.find((light) => light.name === config.name);
    if (!light) return;

    const newIntensity =
      params.minIntensity +
      (params.maxIntensity - params.minIntensity) *
        0.5 *
        (1 + Math.sin(time * params.speed + params.phase));

    light.intensity = newIntensity;
  });

  if (potato) {
    renderer.clear();
  } else {
    // controls.update();
    renderer.render(scene, camera);
  }

  stats?.end();
}
