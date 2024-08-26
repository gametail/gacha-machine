import { playAnimationSequence } from "./main3D";
import { getState, setState } from "./state";
import { ChanceConfig, Entry, Rarity } from "./types";
import * as noUiSlider from "nouislider";

let potatoVideoURL = "../assets/potato/idle.webm";

function getElements() {
  return {
    displayContainer: document.querySelector(".display") as HTMLDivElement,
    displayName: document.getElementById("name") as HTMLHeadingElement,
    displayRarity: document.getElementById("rarity") as HTMLHeadingElement,
    ui: document.querySelector(".UI") as HTMLDivElement,
    potatoBtn: document.querySelector(".potato") as HTMLButtonElement,
    potatoVideo: document.querySelector(".lowSpecVideo") as HTMLVideoElement,
    entriesContainer: document.getElementById(
      "entriesContainer"
    ) as HTMLUListElement,
    secondaryButtons: document.getElementById(
      "buttonContainer"
    ) as HTMLButtonElement,
    pickButton: document.getElementById("pickBtn") as HTMLButtonElement,
    rollButton: document.getElementById("rollBtn") as HTMLButtonElement,
    mainContainer: document.getElementById("mainContainer") as HTMLDivElement,
    addEntryButton: document.getElementById(
      "addEntryButton"
    ) as HTMLButtonElement,
    clearEntryButton: document.getElementById(
      "clearEntryButton"
    ) as HTMLButtonElement,
    mainInput: document.getElementById("mainInput") as HTMLInputElement,
    raritySelect: document.getElementById("raritySelect") as HTMLSelectElement,
    settingsButton: document.querySelector(".settings") as HTMLButtonElement,
    settingsDialog: document.getElementById(
      "settingsDialog"
    ) as HTMLDialogElement,
    dialogCloseButton: document.getElementById(
      "dialogClose"
    ) as HTMLButtonElement,
    lastPickedButton: document.getElementById(
      "lastPicked"
    ) as HTMLButtonElement,
    revertButton: document.getElementById(
      "revertLastPicked"
    ) as HTMLButtonElement,
    slider: document.getElementById("slider") as noUiSlider.target,
    commonConfig: document.getElementById("commonConfig") as HTMLSpanElement,
    rareConfig: document.getElementById("rareConfig") as HTMLSpanElement,
    epicConfig: document.getElementById("epicConfig") as HTMLSpanElement,
    legendaryConfig: document.getElementById(
      "legendaryConfig"
    ) as HTMLSpanElement,
  };
}

export function addUIEventListeners() {
  const {
    displayContainer,
    potatoBtn,
    rollButton,
    mainInput,
    clearEntryButton,
    addEntryButton,
    entriesContainer,
    settingsButton,
    settingsDialog,
    dialogCloseButton,
    pickButton,
    lastPickedButton,
    revertButton,
  } = getElements();

  potatoBtn.addEventListener("click", () => {
    const { potatoMode: potato } = getState();
    const newPotato = !potato;
    setState("potatoMode", newPotato);
    localStorage.setItem("potato", newPotato.toString());
    potatoBtn.classList.toggle("active");
    potatoBtn.innerText = newPotato ? "2D" : "3D";

    updatePotatoButton();
    handlePotatoMode(newPotato);
  });

  rollButton.addEventListener("click", () => {
    const { entries } = getState();
    if (entries.length !== 0) {
      playAnimationSequence(() => {
        displayContainer?.classList.remove("animate");
      });
    }
  });

  mainInput.addEventListener("keyup", (ev) => {
    if (ev.key === "Enter") {
      addEntry();
    }
  });

  clearEntryButton.addEventListener("click", () => {
    setState("entries", []);
    const lis = entriesContainer?.querySelectorAll("li:not(:first-child)");
    lis?.forEach((li) => li.remove());
  });

  addEntryButton.addEventListener("click", addEntry);

  settingsButton.addEventListener("click", () => {
    if (!settingsDialog.open) {
      settingsDialog.showModal();
    }
  });

  dialogCloseButton.addEventListener("click", () => {
    if (settingsDialog.open) {
      settingsDialog.close();
    }
  });

  pickButton.addEventListener("click", () => {
    const { rolledEntry, lastPickedEntryHistory, entries } = getState();
    if (!rolledEntry) throw new Error("Rolled entry is null cant pick");
    pickButton.removeAttribute("style");

    displayContainer.classList.remove("animate");
    lastPickedButton.classList.remove("common", "rare", "epic", "legendary");
    lastPickedButton.classList.add(rolledEntry.rarity);
    lastPickedButton.innerText = rolledEntry.name;

    const filteredEntries = entries.filter(
      (entry) => entry.id !== rolledEntry.id
    );
    setState("entries", filteredEntries);

    for (let i = 0; i < entriesContainer.children.length; i++) {
      if (entriesContainer.children[i].id === rolledEntry.id) {
        entriesContainer.removeChild(entriesContainer.children[i]);
        break;
      }
    }

    lastPickedEntryHistory.push(rolledEntry);
    if (lastPickedEntryHistory.length !== 0) {
      revertButton.style.display = "flex";
    }
    setState("rolledEntry", null);
  });

  lastPickedButton.addEventListener("click", () => {
    const { lastPickedEntryHistory } = getState();
    const lastIndex = lastPickedEntryHistory.length - 1;
    if (lastPickedEntryHistory.length !== 0) {
      navigator.clipboard.writeText(lastPickedEntryHistory[lastIndex].name);
    }
  });

  revertButton.addEventListener("click", () => {
    const { lastPickedEntryHistory, entries } = getState();
    const lastPick = lastPickedEntryHistory.pop();
    if (lastPick) {
      entries.push(lastPick);
      localStorage.setItem("entries", JSON.stringify(entries));
      createHtml(lastPick);
      lastPickedButton.classList.remove("common", "rare", "epic", "legendary");
      if (lastPickedEntryHistory.length !== 0) {
        const newLast =
          lastPickedEntryHistory[lastPickedEntryHistory.length - 1];
        lastPickedButton.classList.add(newLast.rarity);
        lastPickedButton.innerText = newLast.name;
      } else {
        lastPickedButton.innerText = "-";
        revertButton.removeAttribute("style");
      }
    }
  });
}

export function setupSlider() {
  const { commonConfig, rareConfig, epicConfig, legendaryConfig, slider } =
    getElements();
  const { chanceConfig } = getState();
  const { common, rare, epic } = chanceConfig;
  const v1 = common;
  const v2 = common + rare;
  const v3 = common + rare + epic;
  const initialHandlePositions = [v1, v2, v3];

  noUiSlider.create(slider, {
    start: initialHandlePositions, // Initial handle positions
    connect: [true, true, true, true], // Connect segments between handles
    step: 0.001, // Precision of slider values
    range: {
      min: 0,
      max: 1,
    },
    format: {
      to: function (value) {
        return value.toFixed(3);
      },
      from: function (value) {
        return parseFloat(value);
      },
    },
  });
  var connect = slider.querySelectorAll(".noUi-connect");
  var ids = ["c-1-color", "c-2-color", "c-3-color", "c-4-color"];

  for (var i = 0; i < connect.length; i++) {
    connect[i].id = ids[i];
  }

  slider.noUiSlider?.on("update", (values) => {
    const [v1, v2, v3] = values.map((value) => parseFloat(value as string));

    const commonChance = v1;
    const rareChance = v2 - v1;
    const epicChance = v3 - v2;
    const legendaryChance = 1 - v3;

    commonConfig.innerText = formatToPercentage(commonChance);
    rareConfig.innerText = formatToPercentage(rareChance);
    epicConfig.innerText = formatToPercentage(epicChance);
    legendaryConfig.innerText = formatToPercentage(legendaryChance);

    const configObject: ChanceConfig = {
      common: commonChance,
      rare: rareChance,
      epic: epicChance,
      legendary: legendaryChance,
    };
    setState("chanceConfig", configObject);
  });
}
function formatToPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function updatePotatoButton() {
  const { potatoBtn } = getElements();
  const { potatoMode: potato } = getState();

  if (potatoBtn) {
    potatoBtn.innerText = potato ? "2D" : "3D";
    potato
      ? potatoBtn.classList.remove("active")
      : potatoBtn.classList.add("active");
  }
}

export function handlePotatoMode(isOn: boolean) {
  const { potatoVideo } = getElements();
  const { animSequencePlaying } = getState();

  if (potatoVideo) {
    if (!animSequencePlaying && isOn) {
      potatoVideo.currentTime = 0;
      potatoVideo.pause();
    }
    potatoVideo.style.display = isOn ? "block" : "none";
  }
}

export function updateDisplay() {
  const { displayContainer, displayName, displayRarity } = getElements();
  const { rolledEntry } = getState();

  if (!rolledEntry || !displayContainer || !displayName || !displayRarity)
    return;

  displayContainer.classList.remove("common", "rare", "epic", "legendary");
  displayContainer.classList.add("display", "animate", rolledEntry.rarity);

  displayName.innerText = rolledEntry.name;
  displayRarity.innerText = rolledEntry.rarity.toUpperCase();
}

export function applyUIEffects() {
  const { secondaryButtons, mainContainer, pickButton, potatoVideo } =
    getElements();
  if (secondaryButtons) secondaryButtons.style.transform = "translateY(0em)";
  if (mainContainer) mainContainer.style.transform = "translateX(0em)";
  if (pickButton) {
    pickButton.style.display = "block";
    pickButton.style.transform = "scale(1)";
  }
  if (potatoVideo) potatoVideo.currentTime = 0;
}

export function hideInteractableUI() {
  const { secondaryButtons, mainContainer } = getElements();
  if (secondaryButtons) secondaryButtons.style.transform = "translateY(10em)";
  if (mainContainer) mainContainer.style.transform = "translateX(-32rem)";
}

export function setAndPlayVideo(rarity: string) {
  const { potatoVideo } = getElements();
  if (potatoVideo) {
    potatoVideoURL = `../assets/potato/${rarity}.webm`;
    potatoVideo.setAttribute("src", potatoVideoURL);
    potatoVideo.play();
  }
}

export function toggleUI() {
  const { ui } = getElements();
  if (ui) {
    ui.classList.toggle("hide");
  }
}

function addEntry() {
  const { mainInput, raritySelect } = getElements();
  const inputValue = mainInput?.value;

  if (!inputValue?.trim().length) {
    alert("empty input");
    return;
  }

  const rarity = raritySelect?.value as Rarity;

  // Split input by commas, trim whitespace, and filter out any empty strings
  const names = inputValue
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  if (names.length === 0) {
    return;
  }

  const { entries } = getState();

  const newEntries = names.map((name, index) => ({
    name,
    rarity,
    id: (entries.length + index).toString(),
  }));
  entries.push(...newEntries);
  localStorage.setItem("entries", JSON.stringify(entries));

  newEntries.forEach(createHtml);

  if (mainInput) mainInput.value = "";
}

function createHtml(entry: Entry) {
  const { entriesContainer } = getElements();
  if (!entriesContainer) return;

  const { id, rarity, name } = entry;

  const li = document.createElement("li");

  li.classList.add("entry", "look3d", rarity.toString());
  li.id = id;

  const p = document.createElement("p");
  p.innerText = name;
  p.classList.add("text");

  li.appendChild(p);
  li.addEventListener("click", () => {
    const { entries } = getState();

    setState(
      "entries",
      entries.filter((entry) => entry.id !== id)
    );

    entriesContainer.removeChild(li);
  });

  entriesContainer.appendChild(li);
}

export function restoreEntries() {
  const { entries } = getState();

  if (entries.length !== 0) {
    entries.forEach((entry) => {
      createHtml(entry);
    });
  }
}
