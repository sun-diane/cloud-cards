import { useState, useEffect, useCallback, useRef } from "react";
import { useGame } from "@/context/GameContext";
import type { CardData } from "@/data/types";
import CardFront from "@/components/CardFront";
import CardBack from "@/components/CardBack";
import AdModal from "@/components/AdModal";
import { cn } from "@/lib/utils";
import { createShareBrandingHtml } from "@/components/ShareBranding";
import { toPng } from "html-to-image";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m ${sec.toString().padStart(2, "0")}s`;
}

type Phase = "idle" | "pack-art" | "backs" | "revealing" | "done";

export default function OpenPacksPage() {
  const { state, packsAvailable, nextRefillMs, openPack, grantAdPack } = useGame();
  const [phase, setPhase] = useState<Phase>("idle");
  const [pulled, setPulled] = useState<CardData[]>([]);
  const [newlyDiscovered, setNewlyDiscovered] = useState<boolean[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [copying, setCopying] = useState(false);
  const pullRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => {
    if (packsAvailable <= 0) return;
    // Capture counts BEFORE openPack updates state
    const countsBefore = { ...state.countsByCardId };
    const cards = openPack();
    if (cards.length === 0) return;

    const seenThisPull = new Set<string>();
    const discovered = cards.map((card) => {
      const isNewCard = (countsBefore[card.id] || 0) === 0 && !seenThisPull.has(card.id);
      seenThisPull.add(card.id);
      return isNewCard;
    });

    setPulled(cards);
    setNewlyDiscovered(discovered);
    setRevealedCount(0);
    setPhase("pack-art");
  }, [packsAvailable, openPack, state.countsByCardId]);

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

  const handleSharePull = async () => {
    if (!pullRef.current) return;
    setCopying(true);
    try {
      // Build a wrapper div with branding + cloned cards
      const wrapper = document.createElement("div");
      wrapper.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;width:900px;background:#f5f6f8;padding:0;";

      // Add branding
      const brandingHtml = createShareBrandingHtml("pull");
      wrapper.insertAdjacentHTML("beforeend", brandingHtml);

      // Clone the cards area
      const clone = pullRef.current.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("img").forEach((img) => { img.loading = "eager"; });
      clone.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:24px;padding:24px;";
      wrapper.appendChild(clone);

      document.body.appendChild(wrapper);
      // Small delay to let images settle
      await new Promise((r) => setTimeout(r, 100));
      const dataUrl = await toPng(wrapper, { backgroundColor: "#f5f6f8", pixelRatio: 2 });
      document.body.removeChild(wrapper);

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Pack pull copied to clipboard!");
    } catch {
      toast.error("Failed to copy — try right-clicking to save instead.");
    } finally {
      setCopying(false);
    }
  };

  const topRow = pulled.slice(0, 3);
  const bottomRow = pulled.slice(3);

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
                src="/ui/pack-art.png"
                alt="Open Pack"
                className="w-72"
              />
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <img
                src="/ui/pack-art.png"
                alt="Pack"
                className="w-72 opacity-50 grayscale"
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
            src="/ui/pack-art.png"
            alt="Opening..."
            className="w-80"
          />
        </div>
      )}

      {/* Card reveals - 3+2 layout */}
      {(phase === "backs" || phase === "revealing" || phase === "done") && (
        <div ref={pullRef} className="flex flex-col items-center gap-6 p-6">
          
          {/* Top row - 3 cards */}
          <div className="flex flex-wrap justify-center gap-6">
            {topRow.map((card, i) => {
              const isRevealed = i < revealedCount;
              return (
                <div key={i} className="relative pt-4">
                  {isRevealed && newlyDiscovered[i] && (
                    <span
                      className="absolute -top-0 left-1/2 z-20 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-bold tracking-wide uppercase"
                      style={{ animation: "new-badge-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards, new-badge-glow 2s ease-in-out 0.5s infinite" }}
                    >
                      New
                    </span>
                  )}
                  <div className="flip-card w-[260px] h-[310px]">
                    <div className={cn("flip-card-inner relative w-full h-full", isRevealed && "flipped")}>
                      <div className="flip-card-back absolute inset-0">
                        <CardBack />
                      </div>
                      <div className="flip-card-front absolute inset-0">
                        <CardFront card={card} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Bottom row - 2 cards */}
          <div className="flex flex-wrap justify-center gap-6">
            {bottomRow.map((card, i) => {
              const idx = i + 3;
              const isRevealed = idx < revealedCount;
              return (
                <div key={idx} className="relative pt-4">
                  {isRevealed && newlyDiscovered[idx] && (
                    <span
                      className="absolute -top-0 left-1/2 z-20 rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-bold tracking-wide uppercase"
                      style={{ animation: "new-badge-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards, new-badge-glow 2s ease-in-out 0.5s infinite" }}
                    >
                      New
                    </span>
                  )}
                  <div className="flip-card w-[260px] h-[310px]">
                    <div className={cn("flip-card-inner relative w-full h-full", isRevealed && "flipped")}>
                      <div className="flip-card-back absolute inset-0">
                        <CardBack />
                      </div>
                      <div className="flip-card-front absolute inset-0">
                        <CardFront card={card} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {phase === "done" && (
      <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handleSharePull}
            disabled={copying}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-bold text-base hover:bg-accent/85 transition-colors disabled:opacity-50"
          >
            <Share2 className="w-5 h-5" />
            {copying ? "Copying..." : "Share Pull"}
          </button>
          <button
            onClick={() => { setPhase("idle"); setPulled([]); setNewlyDiscovered([]); setRevealedCount(0); }}
            className="px-6 py-3 rounded-xl font-bold text-base border-2 border-border text-foreground hover:bg-muted transition-colors"
          >
            {packsAvailable > 0 ? "Open Another Pack" : "Back"}
          </button>
        </div>
      )}

      {showAd && <AdModal onClose={() => setShowAd(false)} onComplete={handleAdComplete} />}
    </div>
  );
}
