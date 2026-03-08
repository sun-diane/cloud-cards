import type { CardData } from "./types";

// Build-time glob: Vite resolves all files in these folders at compile time.
const iconFiles = import.meta.glob("/public/icons/*.*", { eager: false, query: "?url", import: "default" });
const artFiles = import.meta.glob("/public/art/*.*", { eager: false, query: "?url", import: "default" });

// Build a lookup: artKey → resolved public path
// Glob keys look like "/public/icons/amazon-ec2-C.svg"
function buildExtensionMap(globResult: Record<string, unknown>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const key of Object.keys(globResult)) {
    // Extract filename without extension as the artKey
    const filename = key.split("/").pop() || "";
    const dotIdx = filename.lastIndexOf(".");
    if (dotIdx === -1) continue;
    const stem = filename.substring(0, dotIdx);
    const ext = filename.substring(dotIdx); // includes the dot
    // Store as public-relative path (strip "/public" prefix)
    map[stem] = key.replace(/^\/public/, "") ;
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

// Legacy compat — no longer needed for guessing, but kept for any callers
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
