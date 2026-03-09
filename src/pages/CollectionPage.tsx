import { useState, useMemo, useRef } from "react";
import { useGame } from "@/context/GameContext";
import CardFront from "@/components/CardFront";
import CardBack from "@/components/CardBack";
import type { CardData } from "@/data/types";
import { cn } from "@/lib/utils";
import { Search, Download, Upload, RotateCcw, X, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import Papa from "papaparse";

const RARITIES = ["Common", "Uncommon", "Rare", "Ultra Rare", "Legendary"];

export default function CollectionPage() {
  const { cards, state, exportCollection, importCollection, resetCollection } = useGame();
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [sharing, setSharing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);

  const classes = useMemo(() => [...new Set(cards.map((c) => c.class))].sort(), [cards]);

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (rarityFilter && c.rarity !== rarityFilter) return false;
      if (classFilter && c.class !== classFilter) return false;
      return true;
    });
  }, [cards, search, rarityFilter, classFilter]);

  const totalOwned = useMemo(() => {
    return cards.filter((c) => (state.countsByCardId[c.id] || 0) > 0).length;
  }, [cards, state.countsByCardId]);

  const handleExport = () => {
    const data = exportCollection();
    const rows = Object.entries(data.countsByCardId).map(([cardId, count]) => ({ cardId, count }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cloud-cards-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (merge: boolean) => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        const countsByCardId: Record<string, number> = {};
        for (const row of result.data as Record<string, string>[]) {
          if (row.cardId && row.count) {
            countsByCardId[row.cardId] = Number(row.count) || 0;
          }
        }
        importCollection({ appVersion: "1.0.0", exportedAt: "", countsByCardId, packsState: { packsAvailable: state.packsAvailable, lastRefillEpochMs: state.lastRefillEpochMs } }, merge);
      } catch { alert("Invalid CSV file"); }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleShareCollection = async () => {
    if (!collectionRef.current || sharing) return;
    setSharing(true);
    try {
      // Clone the grid off-screen so the visible UI doesn't shift
      const clone = collectionRef.current.cloneNode(true) as HTMLElement;
      // Force all images to load eagerly in the clone (lazy ones won't render off-screen)
      clone.querySelectorAll("img").forEach((img) => {
        img.loading = "eager";
      });
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.gridTemplateColumns = "repeat(4, 1fr)";
      clone.style.width = "1200px";
      clone.style.zIndex = "-1";
      document.body.appendChild(clone);
      const dataUrl = await toPng(clone, { backgroundColor: "#ffffff" });
      document.body.removeChild(clone);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("Collection copied to clipboard!");
    } catch {
      toast.error("Failed to copy collection image.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Collection</h1>
          <p className="text-sm text-muted-foreground">{totalOwned} / {cards.length} cards collected</p>
        </div>
        <button onClick={handleShareCollection} disabled={sharing} className="flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50">
          <Share2 className="w-4 h-4" /> {sharing ? "Capturing…" : "Share Collection"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary text-sm border-none outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={rarityFilter || ""}
          onChange={(e) => setRarityFilter(e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-secondary text-sm"
        >
          <option value="">All Rarities</option>
          {RARITIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={classFilter || ""}
          onChange={(e) => setClassFilter(e.target.value || null)}
          className="px-3 py-2 rounded-lg bg-secondary text-sm"
        >
          <option value="">All Classes</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div ref={collectionRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-items-center p-2">
        {filtered.map((card) => {
          const count = state.countsByCardId[card.id] || 0;
          const owned = count > 0;
          return (
            <div
              key={card.id}
              className="flex flex-col items-center transition-all"
              onClick={() => setSelectedCard(card)}
            >
              {owned ? (
                <CardFront card={card} owned />
              ) : (
                <CardBack className="grayscale opacity-50 cursor-pointer" />
              )}
              <span className={cn(
                "mt-2 text-sm font-bold rounded-full px-3 py-0.5",
                owned ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
              )}>
                {owned ? `×${count}` : "???"}
              </span>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-20">No cards match your filters.</p>
      )}

      {/* Manage Collection */}
      <div className="mt-12 border-t border-border pt-6 flex flex-col items-center text-center">
        <h2 className="text-lg font-bold mb-4">Manage Collection</h2>
        <div className="flex gap-2 flex-wrap justify-center">
          <button onClick={handleExport} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
            <Download className="w-4 h-4" /> Export
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={() => handleImport(false)} />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={() => { if (confirm("Reset all progress?")) resetCollection(); }} className="flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-2 rounded-lg text-sm font-medium hover:bg-destructive/90">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Detail modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm" onClick={() => setSelectedCard(null)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedCard(null)} className="absolute -top-3 -right-3 z-10 bg-card rounded-full p-1 card-shadow">
              <X className="w-5 h-5" />
            </button>
            <CardFront
              card={selectedCard}
              count={state.countsByCardId[selectedCard.id] || 0}
              large
            />
          </div>
        </div>
      )}
    </div>
  );
}