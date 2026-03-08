import type { CardData } from "./types";

const faviconExts = ["png", "svg"];
const imageExts = ["jpg", "jpeg", "png", "webp"];

// We can't do runtime file existence checks in a static build,
// so we just return the first extension and rely on onError fallback in img tags.
export function getArtSrc(card: CardData): string {
  if (card.artType === "image") {
    return `/art/${card.artKey}.${imageExts[0]}`;
  }
  return `/icons/${card.artKey}.${faviconExts[0]}`;
}

export function getPlaceholder(card: CardData): string {
  if (card.artType === "image") {
    return "/ui/placeholder-art.jpg";
  }
  return "/ui/placeholder-favicon.svg";
}
