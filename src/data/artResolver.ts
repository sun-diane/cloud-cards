import type { CardData } from "./types";

const faviconExts = ["png", "jpg", "jpeg", "webp", "svg"];
const imageExts = ["jpg", "jpeg", "png", "webp"];

function getExts(card: CardData): string[] {
  return card.artType === "image" ? imageExts : faviconExts;
}

function getFolders(card: CardData): string[] {
  // Be permissive so cards still render if assets are moved between folders.
  return card.artType === "image" ? ["art", "icons"] : ["icons", "art"];
}

function getCandidates(card: CardData): string[] {
  const folders = getFolders(card);
  const exts = getExts(card);
  return folders.flatMap((folder) => exts.map((ext) => `/${folder}/${card.artKey}.${ext}`));
}

export function getArtAttemptCount(card: CardData): number {
  return getCandidates(card).length;
}

export function getArtSrcForAttempt(card: CardData, attempt: number): string {
  const candidates = getCandidates(card);
  const safeAttempt = Math.min(Math.max(attempt, 0), candidates.length - 1);
  return candidates[safeAttempt];
}

export function getArtSrc(card: CardData): string {
  return getArtSrcForAttempt(card, 0);
}

export function getPlaceholder(card: CardData): string {
  if (card.artType === "image") {
    return "/ui/placeholder-art.jpg";
  }
  return "/ui/placeholder-favicon.svg";
}
