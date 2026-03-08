import { getArtSrc, getPlaceholder } from "@/data/artResolver";
import type { CardData } from "@/data/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

const rarityBorder: Record<string, string> = {
  Common: "card-border-common",
  Uncommon: "card-border-uncommon",
  Rare: "card-border-rare",
  "Ultra Rare": "card-border-ultra",
  Legendary: "card-border-legendary",
};

const rarityLabel: Record<string, string> = {
  Common: "bg-muted text-muted-foreground",
  Uncommon: "bg-rarity-uncommon/15 text-rarity-uncommon",
  Rare: "bg-rarity-rare/15 text-rarity-rare",
  "Ultra Rare": "bg-rarity-ultra/15 text-rarity-ultra",
  Legendary: "bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-blue-500/20 text-foreground",
};

interface CardFrontProps {
  card: CardData;
  count?: number;
  large?: boolean;
  onClick?: () => void;
}

export default function CardFront({ card, count, large, onClick }: CardFrontProps) {
  const [imgError, setImgError] = useState(false);
  const artSrc = imgError ? getPlaceholder(card) : getArtSrc(card);
  const isFullBleed = card.artType === "image";
  const isLegendary = card.rarity === "Legendary";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col bg-card rounded-xl overflow-hidden card-shadow cursor-pointer transition-transform hover:scale-[1.02]",
        rarityBorder[card.rarity] || "card-border-common",
        isLegendary && "holo-shimmer",
        large ? "w-[340px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 relative z-10">
        <h3 className={cn("font-bold truncate pr-2", large ? "text-base" : "text-sm")}>
          {card.name}
        </h3>
        <span className={cn("text-xs font-mono px-2 py-0.5 rounded-full shrink-0", rarityLabel[card.rarity])}>
          {card.class}
        </span>
      </div>

      {/* Art area */}
      <div className={cn(
        "relative mx-3 my-2 rounded-lg overflow-hidden bg-muted flex items-center justify-center",
        large ? "h-[200px]" : "h-[140px]",
        isFullBleed && "mx-0 my-0 rounded-none"
      )}>
        <img
          src={artSrc}
          alt={card.name}
          onError={() => setImgError(true)}
          className={cn(
            "object-contain",
            isFullBleed ? "w-full h-full object-cover" : "w-16 h-16"
          )}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 px-4 py-2 relative z-10">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">HP</span>
          <span className="font-bold font-mono text-sm">{card.hp}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">ATK</span>
          <span className="font-bold font-mono text-sm">{card.attack}</span>
        </div>
        <span className={cn("ml-auto text-xs px-2 py-0.5 rounded-full", rarityLabel[card.rarity])}>
          {card.rarity}
        </span>
      </div>

      {/* Flavor */}
      <p className={cn(
        "px-4 pb-3 text-muted-foreground leading-snug relative z-10",
        large ? "text-xs" : "text-[11px]"
      )}>
        {card.flavor}
      </p>

      {/* Count badge */}
      {count !== undefined && (
        <div className={cn(
          "absolute top-2 left-2 z-20 rounded-full px-2 py-0.5 text-xs font-bold",
          count > 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
        )}>
          ×{count}
        </div>
      )}
    </div>
  );
}
