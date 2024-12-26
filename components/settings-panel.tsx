"use client";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { useRack } from "../context/rack-context";
import { DownloadIcon, FileJson, RotateCcw, ImageIcon } from "lucide-react";
import Image from "next/image";

interface EquipmentData {
  id: string;
  label: string;
  manufacturer: string;
  model: string;
  size: string;
  color: string;
  logoUrl?: string;
  imageUrl?: string;
  avatarUrl?: string;
  link?: string;
  tags?: string[];
}

interface RackState {
  slotCount: number;
  items: {
    id: string;
    label: string;
    size: number;
    imageUrl?: string;
    isBlank?: boolean;
    link?: string;
  }[];
}

export default function SettingsPanel() {
  const { slotCount, updateSlotCount, addItem, items, updateItems } = useRack();
  const [inputValue, setInputValue] = useState<string>(slotCount.toString());
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const usedSlots = items.reduce(
    (acc, item) => acc + (item.isBlank ? 0 : item.size),
    0
  );

  const handleSave = () => {
    const state: RackState = {
      slotCount,
      items: items.map((item) => ({
        id: item.id,
        label: item.label,
        size: item.size,
        imageUrl: item.imageUrl,
        isBlank: item.isBlank,
        link: item.link,
      })),
    };

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

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state: RackState = JSON.parse(e.target?.result as string);
        updateSlotCount(state.slotCount);
        setInputValue(state.slotCount.toString());
        updateItems(state.items);
      } catch (error) {
        console.error("Invalid file format:", error);
        alert(
          "Invalid file format. Please select a valid rack plan JSON file."
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch("/api/equipment");
        if (!response.ok) throw new Error("Failed to fetch equipment");
        const data = await response.json();
        setEquipment(data.equipment);
        setAllTags(data.tags);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= 50) {
      updateSlotCount(newValue);
    } else {
      setInputValue(slotCount.toString());
    }
  };

  const handleInsert = (equipmentItem: EquipmentData) => {
    addItem({
      id: `${equipmentItem.id}-${Date.now()}`,
      label: equipmentItem.label,
      size: parseInt(equipmentItem.size),
      imageUrl: equipmentItem.imageUrl,
      link: equipmentItem.link,
    });
  };

  const canFitEquipment = (size: number) => {
    const blankSlots = items.filter((item) => item.isBlank);
    return blankSlots.length >= size;
  };

  const handleReset = () => {
    const blankSlots = Array.from({ length: slotCount }, (_, i) => ({
      id: `blank-${Date.now()}-${i}`,
      size: 1,
      isBlank: true,
      label: "1U",
    }));
    updateItems(blankSlots);
  };

  const filteredEquipment = (equipment || []).filter((item) => {
    if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) {
      return false;
    }

    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const searchableFields = [
      item.label,
      item.manufacturer,
      item.model,
      ...(item.tags || []),
    ];

    return searchableFields.some((field) =>
      field?.toLowerCase().includes(query)
    );
  });

  const handleSaveImage = async () => {
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
        const slotHeight =
          (BASE_HEIGHT * (item.isBlank ? 1 : item.size)) / SCALE;

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

  return (
    <div className="flex flex-col gap-3 sticky top-6">
      <div className="grid grid-cols-4 gap-3">
        <div className="relative w-full">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <FileJson className="w-4 h-4" />
            Load
          </Button>
          <input
            type="file"
            id="file-upload"
            accept=".json"
            onChange={handleLoad}
            className="hidden"
          />
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSave}
          disabled={items.every((item) => item.isBlank)}
        >
          <DownloadIcon className="w-4 h-4" />
          Save
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSaveImage}
          disabled={items.every((item) => item.isBlank)}
        >
          <ImageIcon className="w-4 h-4" />
          Image
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleReset}
          disabled={items.every((item) => item.isBlank)}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      <Card className="flex flex-col p-2 pl-3 gap-4">
        <div className="flex flex-col gap-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-row w-full items-center justify-between"
          >
            <div className="flex flex-col gap-0">
              <span className="text-sm text-foreground">Rack Size</span>
              <span className="text-xs text-muted-foreground">
                {usedSlots}U of {slotCount}U Used
              </span>
            </div>
            <div className="flex items-stretch gap-2">
              <Input
                type="number"
                min={1}
                max={50}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-12 h-9 p-1.5 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button variant="outline" size="sm" type="submit">
                Update
              </Button>
            </div>
          </form>
        </div>
      </Card>
      <Card className="flex flex-col">
        <div className="relative border-b">
          <Input
            className="pe-11 border-none rounded-lg"
            placeholder="Search equipment..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[12px] font-medium text-muted-foreground opacity-100">
              <span className="text-[10px] relative top-[2px]">⌘</span>K
            </kbd>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 border-b">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                className={`cursor-pointer hover:opacity-80 ${
                  selectedTag === tag ? "" : "bg-muted hover:bg-muted"
                }`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center w-full p-6">
            <Image
              src="/loading-ring.svg"
              alt="Loading"
              width={24}
              height={24}
            />
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="px-3 py-2">
              {filteredEquipment.map((item) => {
                const size = parseInt(item.size);
                const canFit = canFitEquipment(size);

                return (
                  <div
                    key={item.id}
                    className="flex flex-row gap-2 items-center justify-between py-2"
                  >
                    <div className="flex flex-row items-center gap-3">
                      <Image
                        src={item.avatarUrl || item.logoUrl || "/rp-avatar.svg"}
                        alt={`${item.label} logo`}
                        width={32}
                        height={32}
                        className="object-contain rounded-full"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.size}U
                          {item.tags?.length
                            ? ` - ${item.tags.join(", ")}`
                            : ""}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInsert(item)}
                      disabled={!canFit}
                    >
                      {canFit ? "Insert" : "No Space"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
