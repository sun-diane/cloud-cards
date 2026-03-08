export interface CardData {
  id: string;
  baseId: string;
  name: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Ultra Rare" | "Legendary";
  hp: number;
  attack: number;
  class: string;
  flavor: string;
  artKey: string;
  artType: "favicon" | "image";
}

export interface AppState {
  packsAvailable: number;
  lastRefillEpochMs: number;
  countsByCardId: Record<string, number>;
  lastOpenedPack?: string[];
  adDayKey?: string;
  adPacksClaimedToday?: number;
}

export interface ExportData {
  appVersion: string;
  exportedAt: string;
  countsByCardId: Record<string, number>;
  packsState: {
    packsAvailable: number;
    lastRefillEpochMs: number;
  };
}
