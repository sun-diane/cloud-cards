export function createShareBrandingHtml(type: "collection" | "pull"): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const label = type === "pull" ? "Pack Pull" : "Collection";

  return `<div style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:16px 20px;font-family:Inter,system-ui,sans-serif;border-bottom:2px solid #e5e7eb;">
    <div style="display:flex;align-items:center;gap:10px;">
      <img src="${import.meta.env.BASE_URL}favicon.png" style="width:32px;height:32px;" />
      <span style="font-weight:800;font-size:22px;letter-spacing:-0.02em;"><span style="color:#FF9900">Cloud</span> <span style="color:#232F3E">Cards</span></span>
      <span style="color:#9ca3af;font-size:14px;font-weight:500;margin-left:4px;">— ${label}</span>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;font-size:13px;color:#6b7280;font-weight:500;">
      <span>${dateStr} · ${timeStr}</span>
      <span style="font-size:12px;">cloud-cards-collector.lovable.app</span>
    </div>
  </div>`;
}
