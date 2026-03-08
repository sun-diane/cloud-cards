import type { CardData } from "./types";

const faviconExts = ["png", "jpg", "jpeg", "webp", "svg"];
const imageExts = ["jpg", "jpeg", "png", "webp", "svg"];

// Try multiple glob roots so resolution works regardless of Vite key format.
const iconFiles = {
  ...import.meta.glob("/public/icons/*.*"),
  ...import.meta.glob("/icons/*.*"),
  ...import.meta.glob("../../public/icons/*.*"),
};
const artFiles = {
  ...import.meta.glob("/public/art/*.*"),
  ...import.meta.glob("/art/*.*"),
  ...import.meta.glob("../../public/art/*.*"),
};

function toPublicPath(key: string, folder: "icons" | "art"): string {
  if (key.startsWith("/public/")) return key.replace(/^\/public/, "");
  if (key.startsWith(`/${folder}/`)) return key;
  const marker = `/${folder}/`;
  const idx = key.lastIndexOf(marker);
  if (idx >= 0) return key.slice(idx);
  return key;
}

function buildExtensionMap(globResult: Record<string, unknown>, folder: "icons" | "art"): Record<string, string> {
  const map: Record<string, string> = {};

  for (const key of Object.keys(globResult)) {
    const filename = key.split("/").pop() || "";
    const dotIdx = filename.lastIndexOf(".");
    if (dotIdx === -1) continue;

    const stem = filename.substring(0, dotIdx);
    map[stem] = toPublicPath(key, folder);
  }

  return map;
}

const iconMap = buildExtensionMap(iconFiles, "icons");
const artMap = buildExtensionMap(artFiles, "art");

function getExts(card: CardData): string[] {
  return card.artType === "image" ? imageExts : faviconExts;
}

function getFolders(card: CardData): string[] {
  return card.artType === "image" ? ["art", "icons"] : ["icons", "art"];
}

function getCandidates(card: CardData): string[] {
  const folders = getFolders(card);
  const exts = getExts(card);
  return folders.flatMap((folder) => exts.map((ext) => `/${folder}/${card.artKey}.${ext}`));
}

function getResolvedPath(card: CardData): string | null {
  const primary = card.artType === "image" ? artMap : iconMap;
  const fallback = card.artType === "image" ? iconMap : artMap;
  return primary[card.artKey] || fallback[card.artKey] || null;
}

export function getArtAttemptCount(card: CardData): number {
  const resolved = getResolvedPath(card);
  return resolved ? 1 : getCandidates(card).length;
}

export function getArtSrcForAttempt(card: CardData, attempt: number): string {
  const resolved = getResolvedPath(card);
  if (resolved) return resolved;

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
