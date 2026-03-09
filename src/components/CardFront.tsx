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

const rarityGradientColor: Record<string, { mid: string; edge: string }> = {
  Common: { mid: "hsl(220 10% 88%)", edge: "hsl(220 10% 80%)" },
  Uncommon: { mid: "hsl(142 30% 85%)", edge: "hsl(142 35% 75%)" },
  Rare: { mid: "hsl(217 50% 88%)", edge: "hsl(217 60% 78%)" },
  "Ultra Rare": { mid: "hsl(270 40% 85%)", edge: "hsl(330 50% 80%)" },
  Legendary: { mid: "hsl(30 70% 88%)", edge: "hsl(30 80% 78%)" },
};

const rarityLabel: Record<string, string> = {
  Common: "chip-rarity chip-rarity-common",
  Uncommon: "chip-rarity chip-rarity-uncommon",
  Rare: "chip-rarity chip-rarity-rare",
  "Ultra Rare": "chip-rarity chip-rarity-ultra",
  Legendary: "chip-rarity chip-rarity-legendary",
};

interface CardFrontProps {
  card: CardData;
  count?: number;
  large?: boolean;
  owned?: boolean;
  onClick?: () => void;
}

export default function CardFront({ card, count, large, owned = true, onClick }: CardFrontProps) {
  const [imgError, setImgError] = useState(false);
  const artSrc = imgError ? getPlaceholder(card) : getArtSrc(card);
  const isLegendary = card.rarity === "Legendary";
  const isUltraRare = card.rarity === "Ultra Rare";

  const handleImgError = () => {
    setImgError(true);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col bg-card rounded-xl overflow-hidden card-shadow cursor-pointer transition-transform hover:scale-[1.02]",
        rarityBorder[card.rarity] || "card-border-common",
        isLegendary && owned && "holo-shimmer",
        isUltraRare && owned && "ultra-shimmer",
        large ? "w-[340px] h-[380px]" : "w-[260px] h-[310px]"
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
        "relative overflow-hidden flex items-center justify-center",
        card.artType === "favicon" ? "" : "bg-muted",
        large ? "h-[200px]" : "h-[140px]",
        isUltraRare || isLegendary
          ? "mx-0 my-0 rounded-none"
          : "mx-3 my-2 rounded-lg"
      )}
        style={card.artType === "favicon" ? {
          backgroundImage: isUltraRare
            ? 'linear-gradient(135deg, hsl(270 60% 55%) 0%, hsl(330 80% 65%) 100%)'
            : `radial-gradient(circle at center, hsl(0 0% 100%) 0%, ${rarityGradientColor[card.rarity] || rarityGradientColor.Common}33 60%, ${rarityGradientColor[card.rarity] || rarityGradientColor.Common}66 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <img
          src={artSrc}
          alt={card.name}
          onError={handleImgError}
          className={cn(
            "w-full h-full",
            card.artType === "favicon"
              ? "object-contain p-[10%]"
              : "object-cover"
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
    </div>
  );
}
