import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { loadCards } from "@/data/cardLoader";
import { loadState, saveState, resetState as resetStorage, applyRefill } from "@/data/state";
import { CARDS_PER_PACK, MAX_PACKS, PACK_REFILL_MS } from "@/data/constants";
import type { CardData, AppState, ExportData } from "@/data/types";

interface GameContextType {
  cards: CardData[];
  state: AppState;
  packsAvailable: number;
  nextRefillMs: number;
  openPack: () => CardData[];
  grantAdPack: () => void;
  resetCollection: () => void;
  importCollection: (data: ExportData, merge: boolean) => void;
  exportCollection: () => ExportData;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const cards = useRef(loadCards()).current;
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadState();
    // For testing: give 1 of every card if collection is empty
    if (Object.keys(loaded.countsByCardId).length === 0) {
      const allCards = loadCards();
      const testCounts: Record<string, number> = {};
      for (const card of allCards) {
        testCounts[card.id] = 1;
      }
      return { ...loaded, countsByCardId: testCounts };
    }
    return loaded;
  });
  const [nextRefillMs, setNextRefillMs] = useState(0);

  // Refill timer
  useEffect(() => {
    const tick = () => {
      const updated = applyRefill(state);
      if (updated !== state) setState(updated);
      const elapsed = Date.now() - updated.lastRefillEpochMs;
      const remaining = Math.max(0, PACK_REFILL_MS - (elapsed % PACK_REFILL_MS));
      setNextRefillMs(updated.packsAvailable >= MAX_PACKS ? 0 : remaining);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state]);

  const persist = useCallback((s: AppState) => {
    setState(s);
    saveState(s);
  }, []);

  const openPack = useCallback((): CardData[] => {
    if (state.packsAvailable <= 0) return [];
    const pulled: CardData[] = [];
    for (let i = 0; i < CARDS_PER_PACK; i++) {
      pulled.push(cards[Math.floor(Math.random() * cards.length)]);
    }
    const newCounts = { ...state.countsByCardId };
    for (const c of pulled) {
      newCounts[c.id] = (newCounts[c.id] || 0) + 1;
    }
    persist({
      ...state,
      packsAvailable: state.packsAvailable - 1,
      countsByCardId: newCounts,
      lastOpenedPack: pulled.map((c) => c.id),
    });
    return pulled;
  }, [state, cards, persist]);

  const grantAdPack = useCallback(() => {
    if (state.packsAvailable >= MAX_PACKS) return;
    persist({ ...state, packsAvailable: state.packsAvailable + 1 });
  }, [state, persist]);

  const resetCollection = useCallback(() => {
    const s = resetStorage();
    setState(s);
  }, []);

  const importCollection = useCallback(
    (data: ExportData, merge: boolean) => {
      const newCounts = merge
        ? { ...state.countsByCardId }
        : {};
      for (const [id, count] of Object.entries(data.countsByCardId)) {
        newCounts[id] = merge ? (newCounts[id] || 0) + count : count;
      }
      persist({
        ...state,
        countsByCardId: newCounts,
        ...(data.packsState && !merge ? { packsAvailable: data.packsState.packsAvailable, lastRefillEpochMs: data.packsState.lastRefillEpochMs } : {}),
      });
    },
    [state, persist]
  );

  const exportCollection = useCallback((): ExportData => ({
    appVersion: "1.0.0",
    exportedAt: new Date().toISOString(),
    countsByCardId: state.countsByCardId,
    packsState: {
      packsAvailable: state.packsAvailable,
      lastRefillEpochMs: state.lastRefillEpochMs,
    },
  }), [state]);

  return (
    <GameContext.Provider
      value={{
        cards,
        state,
        packsAvailable: state.packsAvailable,
        nextRefillMs,
        openPack,
        grantAdPack,
        resetCollection,
        importCollection,
        exportCollection,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
