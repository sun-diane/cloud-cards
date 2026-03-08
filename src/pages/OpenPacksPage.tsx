import { useState, useEffect, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import type { CardData } from "@/data/types";
import CardFront from "@/components/CardFront";
import CardBack from "@/components/CardBack";
import AdModal from "@/components/AdModal";
import { cn } from "@/lib/utils";

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m ${sec.toString().padStart(2, "0")}s`;
}

type Phase = "idle" | "pack-art" | "backs" | "revealing" | "done";

export default function OpenPacksPage() {
  const { packsAvailable, nextRefillMs, openPack, grantAdPack } = useGame();
  const [phase, setPhase] = useState<Phase>("idle");
  const [pulled, setPulled] = useState<CardData[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showAd, setShowAd] = useState(false);

  const handleOpen = useCallback(() => {
    if (packsAvailable <= 0) return;
    const cards = openPack();
    if (cards.length === 0) return;
    setPulled(cards);
    setRevealedCount(0);
    setPhase("pack-art");
  }, [packsAvailable, openPack]);

  // Pack art -> backs transition
  useEffect(() => {
    if (phase === "pack-art") {
      const t = setTimeout(() => setPhase("backs"), 1200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Backs -> revealing transition
  useEffect(() => {
    if (phase === "backs") {
      const t = setTimeout(() => setPhase("revealing"), 600);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Staggered reveals
  useEffect(() => {
    if (phase === "revealing" && revealedCount < pulled.length) {
      const t = setTimeout(() => setRevealedCount((c) => c + 1), 350);
      return () => clearTimeout(t);
    }
    if (phase === "revealing" && revealedCount >= pulled.length) {
      setPhase("done");
    }
  }, [phase, revealedCount, pulled.length]);

  const handleAdComplete = () => {
    setShowAd(false);
    grantAdPack();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold mb-2">Open Packs</h1>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Packs: </span>
            <span className="font-bold text-lg">{packsAvailable}</span>
            <span className="text-muted-foreground"> / 6</span>
          </div>
          {nextRefillMs > 0 && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>Next pack in <span className="font-mono font-medium text-foreground">{formatTime(nextRefillMs)}</span></span>
              {packsAvailable === 0 && (
                <button
                  onClick={() => setShowAd(true)}
                  className="bg-accent text-accent-foreground px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-accent/90 transition-colors"
                >
                  🎬 Watch ad
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action area */}
      {phase === "idle" && (
        <div className="flex flex-col items-center gap-6">
          {packsAvailable > 0 ? (
            <button
              onClick={handleOpen}
              className="group relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <img
                src="/ui/pack-art.webp"
                alt="Open Pack"
                className="w-56 rounded-xl card-shadow"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/10 rounded-xl transition-colors">
                <span className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Pack
                </span>
              </div>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <img
                src="/ui/pack-art.webp"
                alt="Pack"
                className="w-56 rounded-xl card-shadow opacity-50 grayscale"
              />
              <p className="text-muted-foreground text-sm">No packs available</p>
            </div>
          )}
        </div>
      )}

      {/* Pack art flash */}
      {phase === "pack-art" && (
        <div className="flex justify-center animate-pulse">
          <img
            src="/ui/pack-art.webp"
            alt="Opening..."
            className="w-64 rounded-xl card-shadow"
          />
        </div>
      )}

      {/* Card reveals */}
      {(phase === "backs" || phase === "revealing" || phase === "done") && (
        <div className="flex flex-wrap justify-center gap-4">
          {pulled.map((card, i) => {
            const isRevealed = i < revealedCount;
            return (
              <div key={i} className="flip-card">
                <div className={cn("flip-card-inner relative", isRevealed && "flipped")}>
                  {/* Back face */}
                  <div className="flip-card-back">
                    <CardBack />
                  </div>
                  {/* Front face */}
                  <div className="flip-card-front absolute inset-0">
                    <CardFront card={card} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {phase === "done" && (
        <div className="text-center mt-8">
          <button
            onClick={() => { setPhase("idle"); setPulled([]); setRevealedCount(0); }}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
          >
            {packsAvailable > 0 ? "Open Another Pack" : "Back"}
          </button>
        </div>
      )}

      {showAd && <AdModal onClose={() => setShowAd(false)} onComplete={handleAdComplete} />}
    </div>
  );
}
