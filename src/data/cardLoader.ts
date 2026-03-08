import Papa from "papaparse";
import csvFile from "./cards.csv?raw";
import type { CardData } from "./types";

let cachedCards: CardData[] | null = null;

export function loadCards(): CardData[] {
  if (cachedCards) return cachedCards;

  const result = Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
  });

  const required = ["id", "baseId", "name", "rarity", "hp", "attack", "class", "flavor", "artKey", "artType"];
  const headers = result.meta.fields || [];
  for (const col of required) {
    if (!headers.includes(col)) {
      throw new Error(`Missing required CSV column: ${col}`);
    }
  }

  cachedCards = (result.data as Record<string, string>[]).map((row) => ({
    id: row.id,
    baseId: row.baseId,
    name: row.name,
    rarity: row.rarity as CardData["rarity"],
    hp: Number(row.hp) || 0,
    attack: Number(row.attack) || 0,
    class: row.class,
    flavor: row.flavor,
    artKey: row.artKey,
    artType: row.artType as CardData["artType"],
  }));

  return cachedCards;
}
