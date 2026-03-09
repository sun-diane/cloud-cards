interface ShareBrandingProps {
  type: "collection" | "pull";
}

export default function ShareBranding({ type }: ShareBrandingProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between w-full px-2 py-3">
      <div className="flex items-center gap-2">
        <img src="/favicon.png" alt="" className="w-6 h-6" />
        <span className="font-extrabold text-base tracking-tight">
          <span style={{ color: "#FF9900" }}>Cloud</span>{" "}
          <span style={{ color: "#232F3E" }}>Cards</span>
        </span>
        <span style={{ color: "#6b7280" }} className="text-xs ml-1">
          — {type === "pull" ? "Pack Pull" : "Collection"}
        </span>
      </div>
      <div className="flex flex-col items-end text-xs" style={{ color: "#6b7280" }}>
        <span>{dateStr} · {timeStr}</span>
        <span>cloud-cards-collector.lovable.app</span>
      </div>
    </div>
  );
}
