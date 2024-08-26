import {
  Clock,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

import Stats from "three/examples/jsm/libs/stats.module.js";
import { AnimationCollection, ChanceConfig, Entry, LightConfig } from "./types";

interface State {
  scene: Scene | null;
  camera: PerspectiveCamera | null;
  renderer: WebGLRenderer | null;
  stats: Stats | null;
  clock: Clock;
  potatoMode: boolean;
  animSequencePlaying: boolean;
  capsuleMaterial: MeshStandardMaterial | null;
  animationCollection: AnimationCollection | null;
  lightsConfig: LightConfig[];
  lightRefs: PointLight[];
  chanceConfig: ChanceConfig;
  entries: Entry[];
  rolledEntry: Entry | null;
  lastPickedEntryHistory: Entry[];
}

const state: State = {
  scene: null,
  camera: null,
  renderer: null,
  stats: null,
  clock: new Clock(),
  potatoMode: (() => {
    const stored = localStorage.getItem("potato");
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem("potato", "false");
    return false;
  })(),
  animSequencePlaying: false,
  capsuleMaterial: null,
  animationCollection: null,
  lightsConfig: [
    {
      color: 0x9093ff,
      intensity: 15,
      name: "lightA",
      position: new Vector3(-1.388, -0.171, 3.107),
      pulseParams: {
        speed: 1.5,
        minIntensity: 1,
        maxIntensity: 20,
        phase: 0,
      },
    },
    {
      color: 0xffaa87,
      intensity: 30,
      name: "lightB",
      position: new Vector3(1.8147, -0.026, 1.4784),
      pulseParams: {
        speed: 1,
        minIntensity: 10,
        maxIntensity: 30,
        phase: Math.PI / 2,
      },
    },
    {
      color: 0xbee8ff,
      intensity: 10,
      name: "lightC",
      position: new Vector3(1.6441, 1.2394, -2.411),
      pulseParams: {
        speed: 1.5,
        minIntensity: 5,
        maxIntensity: 10,
        phase: Math.PI,
      },
    },
    {
      color: 0xffffff,
      intensity: 20,
      name: "lightD",
      position: new Vector3(1.5, -0.5, 16),
    },
  ],
  lightRefs: [],
  chanceConfig: JSON.parse(
    localStorage.getItem("chanceConfig") ??
      JSON.stringify({
        common: 0.4,
        rare: 0.3,
        epic: 0.2,
        legendary: 0.1,
      })
  ),
  entries: JSON.parse(localStorage.getItem("entries") ?? JSON.stringify([])),
  rolledEntry: null,
  lastPickedEntryHistory: [],
};

function getState(): State {
  return state;
}
function setState<K extends keyof State>(key: K, value: State[K]): void {
  //   console.log(state);
  if (key === "entries") {
    localStorage.setItem("entries", JSON.stringify(value));
  }
  if (key === "chanceConfig") {
    localStorage.setItem("chanceConfig", JSON.stringify(value));
  }
  state[key] = value;
}

export { getState, setState };
