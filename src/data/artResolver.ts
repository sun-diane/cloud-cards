import type { CardData } from "./types";

// Build-time glob: Vite resolves all filenames at compile time.
// We only need the keys (file paths), not the module contents.
const iconFiles = import.meta.glob("/public/icons/*.*", { eager: false });
const artFiles = import.meta.glob("/public/art/*.*", { eager: false });

// Build a lookup: artKey → public-relative path
function buildExtensionMap(globResult: Record<string, unknown>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const key of Object.keys(globResult)) {
    const filename = key.split("/").pop() || "";
    const dotIdx = filename.lastIndexOf(".");
    if (dotIdx === -1) continue;
    const stem = filename.substring(0, dotIdx);
    // Convert "/public/icons/foo.svg" → "/icons/foo.svg"
    map[stem] = key.replace(/^\/public/, "");
  }
  return map;
}

const iconMap = buildExtensionMap(iconFiles);
const artMap = buildExtensionMap(artFiles);

export function getArtSrc(card: CardData): string {
  const primary = card.artType === "image" ? artMap : iconMap;
  const fallback = card.artType === "image" ? iconMap : artMap;
  return primary[card.artKey] || fallback[card.artKey] || getPlaceholder(card);
}

export function getArtAttemptCount(_card: CardData): number {
  return 1;
}

export function getArtSrcForAttempt(card: CardData, _attempt: number): string {
  return getArtSrc(card);
}

export function getPlaceholder(card: CardData): string {
  if (card.artType === "image") {
    return "/ui/placeholder-art.jpg";
  }
  return "/ui/placeholder-favicon.svg";
}
