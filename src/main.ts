import { animate, initialize3D, playAnimationSequence } from "./main3D";
import { getState } from "./state.ts";
import {
  addUIEventListeners,
  handlePotatoMode,
  restoreEntries,
  setupSlider,
  toggleUI,
  updatePotatoButton,
} from "./ui.ts";

const { potatoMode: potato } = getState();

initialize3D();
setupSlider();
addUIEventListeners();
updatePotatoButton();

window.addEventListener("load", async () => {
  handlePotatoMode(potato);
  restoreEntries();
});

document.addEventListener("keydown", (ev) => {
  const { tagName } = ev.target as HTMLElement;

  if (tagName === "INPUT") return;

  if (ev.code === "KeyR") {
    //Open Ball
    const { entries } = getState();
    if (entries.length !== 0) {
      playAnimationSequence();
    }
  }

  if (ev.code === "KeyH") {
    toggleUI();
  }
});

animate();
