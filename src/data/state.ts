import { STORAGE_KEY, MAX_PACKS, PACK_REFILL_MS } from "./constants";
import type { AppState } from "./types";

function defaultState(): AppState {
  return {
    packsAvailable: MAX_PACKS,
    lastRefillEpochMs: Date.now(),
    countsByCardId: {},
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return applyRefill(parsed);
    }
  } catch { /* ignore */ }
  return defaultState();
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function applyRefill(state: AppState): AppState {
  const now = Date.now();
  const elapsed = now - state.lastRefillEpochMs;
  const newPacks = Math.floor(elapsed / PACK_REFILL_MS);
  if (newPacks > 0 && state.packsAvailable < MAX_PACKS) {
    const updated = {
      ...state,
      packsAvailable: Math.min(MAX_PACKS, state.packsAvailable + newPacks),
      lastRefillEpochMs: state.lastRefillEpochMs + newPacks * PACK_REFILL_MS,
    };
    saveState(updated);
    return updated;
  }
  return state;
}

export function resetState(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  const s = defaultState();
  saveState(s);
  return s;
}
