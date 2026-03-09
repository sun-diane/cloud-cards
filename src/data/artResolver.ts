import type { CardData } from "./types";

/**
 * Build a map of filename-stem → public URL from all files in public/icons/.
 * Vite's import.meta.glob with `{ eager: true, query: '?url', import: 'default' }`
 * returns the resolved public URL string for each matched file.
 */
const allFiles: Record<string, string> = import.meta.glob(
  "/public/icons/*.*",
  { eager: true, query: "?url", import: "default" }
);

// Map: stem (e.g. "amazon-ec2-C") → resolved URL (e.g. "/icons/amazon-ec2-C.svg")
const stemToUrl: Record<string, string> = {};
for (const [key, url] of Object.entries(allFiles)) {
  const filename = key.split("/").pop() || "";
  const dotIdx = filename.lastIndexOf(".");
  if (dotIdx === -1) continue;
  const stem = filename.substring(0, dotIdx);
  stemToUrl[stem] = url as string;
}

export function getArtSrc(card: CardData): string {
  return stemToUrl[card.artKey] || getPlaceholder(card);
}

export function getArtAttemptCount(_card: CardData): number {
  return 1;
}

export function getArtSrcForAttempt(card: CardData, _attempt: number): string {
  return getArtSrc(card);
}

export function getPlaceholder(card: CardData): string {
  const base = import.meta.env.BASE_URL;
  if (card.artType === "image") {
    return `${base}ui/placeholder-art.jpg`;
  }
  return `${base}ui/placeholder-favicon.svg`;
}
