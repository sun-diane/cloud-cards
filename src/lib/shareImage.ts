import { toPng } from "html-to-image";

type ShareType = "collection" | "pull";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function createBrandedShareBlob(
  element: HTMLElement,
  type: ShareType,
  backgroundColor: string,
): Promise<Blob> {
  const contentUrl = await toPng(element, {
    backgroundColor,
    pixelRatio: 2,
    cacheBust: true,
  });

  const contentImg = await loadImage(contentUrl);
  const logoImg = await loadImage("/favicon.png").catch(() => null);

  const brandingHeight = Math.max(88, Math.min(120, Math.round(contentImg.width * 0.09)));
  const canvas = document.createElement("canvas");
  canvas.width = contentImg.width;
  canvas.height = contentImg.height + brandingHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const padX = Math.round(canvas.width * 0.035);
  const midY = Math.round(brandingHeight / 2);

  if (logoImg) {
    const logoSize = Math.round(brandingHeight * 0.38);
    ctx.drawImage(logoImg, padX, Math.round(midY - logoSize / 2), logoSize, logoSize);
  }

  const titleX = padX + Math.round(brandingHeight * 0.48);
  ctx.font = `800 ${Math.round(brandingHeight * 0.29)}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FF9900";
  ctx.fillText("Cloud", titleX, midY);

  const cloudWidth = ctx.measureText("Cloud").width;
  ctx.fillStyle = "#1F2937";
  ctx.fillText(" Cards", titleX + cloudWidth, midY);

  ctx.font = `500 ${Math.round(brandingHeight * 0.17)}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "#6B7280";
  ctx.fillText(` — ${type === "pull" ? "Pack Pull" : "Collection"}`, titleX + cloudWidth + ctx.measureText(" Cards").width + 8, midY + 1);

  const now = new Date();
  const stamp = `${now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} · ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  const url = "cloud-cards-collector.lovable.app";

  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 ${Math.round(brandingHeight * 0.15)}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = "#6B7280";
  ctx.fillText(stamp, canvas.width - padX, Math.round(brandingHeight * 0.46));
  ctx.font = `500 ${Math.round(brandingHeight * 0.14)}px Inter, system-ui, sans-serif`;
  ctx.fillText(url, canvas.width - padX, Math.round(brandingHeight * 0.70));
  ctx.textAlign = "start";

  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, brandingHeight);
  ctx.lineTo(canvas.width, brandingHeight);
  ctx.stroke();

  ctx.drawImage(contentImg, 0, brandingHeight);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create share image blob"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}
