import { useState, useEffect, useRef } from "react";
import { AD_VIDEO_IDS } from "@/data/constants";

interface AdModalProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function AdModal({ onClose, onComplete }: AdModalProps) {
  const videoId = useRef(AD_VIDEO_IDS[Math.floor(Math.random() * AD_VIDEO_IDS.length)]).current;
  const [seconds, setSeconds] = useState(0);
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => {
        const next = s + 1;
        if (next >= 30) setCanClaim(true);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-md">
      <div className="bg-card rounded-2xl p-6 w-full max-w-2xl card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Watch to earn a pack</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
        </div>
        <div className="aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            {canClaim ? "Ready to claim!" : `Watch for ${30 - seconds}s more...`}
          </span>
          <button
            disabled={!canClaim}
            onClick={onComplete}
            className="bg-accent text-accent-foreground px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
          >
            Claim Pack
          </button>
        </div>
      </div>
    </div>
  );
}
