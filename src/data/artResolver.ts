import type { CardData } from "./types";

const IMAGE_EXTENSIONS = ["png", "webp", "jpg", "jpeg", "svg"] as const;
const FAVICON_EXTENSIONS = ["svg", "png", "webp", "jpg", "jpeg"] as const;

function getExtensions(card: CardData) {
  return card.artType === "favicon" ? FAVICON_EXTENSIONS : IMAGE_EXTENSIONS;
}

export function getArtSrc(card: CardData): string {
  return getArtSrcForAttempt(card, 0);
}

export function getArtAttemptCount(card: CardData): number {
  return getExtensions(card).length;
}

export function getArtSrcForAttempt(card: CardData, attempt: number): string {
  const ext = getExtensions(card)[attempt] ?? getExtensions(card)[0];
  return `${import.meta.env.BASE_URL}icons/${card.artKey}.${ext}`;
}

export function getPlaceholder(card: CardData): string {
  const base = import.meta.env.BASE_URL;
  if (card.artType === "image") {
    return `${base}ui/placeholder-art.jpg`;
  }
  return `${base}ui/placeholder-favicon.svg`;
}

