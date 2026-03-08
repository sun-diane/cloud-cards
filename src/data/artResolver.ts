import type { CardData } from "./types";

const faviconExts = ["png", "jpg", "jpeg", "webp", "svg"];
const imageExts = ["jpg", "jpeg", "png", "webp"];

function getExts(card: CardData): string[] {
  return card.artType === "image" ? imageExts : faviconExts;
}

export function getArtAttemptCount(card: CardData): number {
  return getExts(card).length;
}

export function getArtSrcForAttempt(card: CardData, attempt: number): string {
  const exts = getExts(card);
  const safeAttempt = Math.min(Math.max(attempt, 0), exts.length - 1);
  const ext = exts[safeAttempt];
  const folder = card.artType === "image" ? "art" : "icons";
  return `/${folder}/${card.artKey}.${ext}`;
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
