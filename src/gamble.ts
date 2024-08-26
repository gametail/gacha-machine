import { getState } from "./state";
import { ChanceConfig, Rarity } from "./types";

export function rollEntry(rarityChances: ChanceConfig) {
  const { entries } = getState();
  // console.log("cances config", rarityChances);
  // console.log("available entries", entries);

  const availableRarities = Object.keys(rarityChances).filter((rarity) =>
    entries.some((entry) => entry.rarity === rarity)
  ) as Rarity[];
  // console.log("available rarities", availableRarities);

  const cumulativeChances: { rarity: Rarity; chance: number }[] = [];
  let cumulativeSum = 0;

  availableRarities.forEach((rarity) => {
    cumulativeSum += rarityChances[rarity];
    cumulativeChances.push({ rarity, chance: cumulativeSum });
  });
  // console.log("rarity mapped to cumulative chances", cumulativeChances);
  // console.log("sum of all chances", cumulativeSum);

  const randomRoll = Math.random() * cumulativeSum;
  // console.log("rolled Chance", randomRoll);

  const selectedRarity = cumulativeChances.find(
    ({ chance }) => randomRoll <= chance
  )?.rarity;
  if (!selectedRarity) throw new Error("Roll couldnt find chance");
  // console.log("selected Rarity", selectedRarity);

  const filteredEntries = entries.filter(
    ({ rarity }) => rarity === selectedRarity
  );
  // console.log("filtered Entries", filteredEntries);

  const rolledEntry =
    filteredEntries[Math.floor(Math.random() * filteredEntries.length)];
  // console.log("rolled Entry", rolledEntry);
  return rolledEntry;
}
