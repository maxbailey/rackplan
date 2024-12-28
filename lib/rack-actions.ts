import type { RackState } from "@/components/settings/settings-panel";

export const validateRackState = (state: unknown): state is RackState => {
  if (typeof state !== "object" || state === null) return false;

  const candidate = state as Record<string, unknown>;

  if (
    typeof candidate.slotCount !== "number" ||
    !Array.isArray(candidate.items)
  ) {
    return false;
  }

  return candidate.items.every((item): item is RackState["items"][number] => {
    if (typeof item !== "object" || item === null) return false;
    const itemCandidate = item as Record<string, unknown>;
    return (
      typeof itemCandidate.id === "string" &&
      typeof itemCandidate.label === "string" &&
      typeof itemCandidate.size === "number"
    );
  });
};

export const saveRackState = (state: RackState) => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rackplan-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const saveRackImage = async (items: RackState["items"]) => {
  const rackPlanner = document.querySelector(".rack-planner");
  if (!rackPlanner) return;

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Could not get canvas context");

    const SCALE = 2;
    const CANVAS_WIDTH = 800 * SCALE;
    const BASE_HEIGHT = 80 * SCALE;
    const SPACING = 10 * SCALE;
    const BANNER_HEIGHT = 80 * SCALE;

    const totalHeight =
      items.reduce((acc, item) => {
        const slotHeight = BASE_HEIGHT * (item.isBlank ? 1 : item.size);
        return acc + slotHeight + SPACING;
      }, 0) + BANNER_HEIGHT;

    canvas.width = CANVAS_WIDTH;
    canvas.height = totalHeight;

    ctx.scale(SCALE, SCALE);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const loadImage = (url?: string): Promise<HTMLImageElement | null> => {
      if (!url) return Promise.resolve(null);
      return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    const drawLabelOverlay = (
      ctx: CanvasRenderingContext2D,
      text: string,
      y: number
    ) => {
      ctx.font = "16px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const textWidth = ctx.measureText(text).width;
      const padding = 8;
      const horizontalPadding = 12;
      const labelX = 8;
      const labelY = y + 8;
      const backgroundHeight = 32;

      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      const radius = 8;
      const x = labelX - horizontalPadding / 2;
      const width = textWidth + horizontalPadding;
      const height = backgroundHeight;

      ctx.beginPath();
      ctx.moveTo(x + radius, labelY - padding / 2);
      ctx.lineTo(x + width - radius, labelY - padding / 2);
      ctx.quadraticCurveTo(
        x + width,
        labelY - padding / 2,
        x + width,
        labelY - padding / 2 + radius
      );
      ctx.lineTo(x + width, labelY - padding / 2 + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        labelY - padding / 2 + height,
        x + width - radius,
        labelY - padding / 2 + height
      );
      ctx.lineTo(x + radius, labelY - padding / 2 + height);
      ctx.quadraticCurveTo(
        x,
        labelY - padding / 2 + height,
        x,
        labelY - padding / 2 + height - radius
      );
      ctx.lineTo(x, labelY - padding / 2 + radius);
      ctx.quadraticCurveTo(
        x,
        labelY - padding / 2,
        x + radius,
        labelY - padding / 2
      );
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, labelX, labelY + 4);
    };

    let currentY = 0;
    for (const item of items) {
      const slotHeight = (BASE_HEIGHT * (item.isBlank ? 1 : item.size)) / SCALE;

      if (item.isBlank) {
        ctx.fillStyle = "#121212";
        ctx.fillRect(0, currentY, CANVAS_WIDTH / SCALE, slotHeight);
        drawLabelOverlay(ctx, "1U - Empty", currentY);
      } else if (item.imageUrl) {
        const img = await loadImage(item.imageUrl);
        if (img) {
          ctx.drawImage(img, 0, currentY, CANVAS_WIDTH / SCALE, slotHeight);
          drawLabelOverlay(ctx, `${item.size}U - ${item.label}`, currentY);
        } else {
          ctx.fillStyle = "#222222";
          ctx.fillRect(0, currentY, CANVAS_WIDTH / SCALE, slotHeight);
          drawLabelOverlay(ctx, `${item.size}U - ${item.label}`, currentY);
        }
      } else {
        ctx.fillStyle = "#222222";
        ctx.fillRect(0, currentY, CANVAS_WIDTH / SCALE, slotHeight);
        drawLabelOverlay(ctx, `${item.size}U - ${item.label}`, currentY);
      }

      currentY += slotHeight + SPACING / SCALE;
    }

    const bannerImg = await loadImage("/rackplan-banner.svg");
    if (bannerImg) {
      ctx.drawImage(
        bannerImg,
        0,
        currentY,
        CANVAS_WIDTH / SCALE,
        BANNER_HEIGHT / SCALE
      );
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rackplan-${new Date().toISOString().split("T")[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, "image/png");
  } catch (error) {
    console.error("Error saving image:", error);
    alert("Failed to save image. Please try again.");
  }
};
