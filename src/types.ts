import {
  AnimationAction,
  AnimationMixer,
  ColorRepresentation,
  Vector3,
} from "three";

export type LightConfig = {
  color: ColorRepresentation;
  intensity: number;
  name: string;
  position: Vector3;
  pulseParams?: {
    speed: number; // Speed of the pulse
    minIntensity: number;
    maxIntensity: number;
    phase: number; // Phase offset
  };
};

export type AnimationCollection = {
  mixers: {
    coin: AnimationMixer;
    ballDrop: AnimationMixer;
    knob: AnimationMixer;
    singleCapsule: AnimationMixer;
  };
  actions: {
    coin: AnimationAction;
  };
};

export type ChanceConfig = {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
};

export type Rarity = "common" | "rare" | "epic" | "legendary";
export type Entry = { name: string; rarity: Rarity; id: string };
