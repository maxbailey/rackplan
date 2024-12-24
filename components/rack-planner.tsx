"use client";

import { useRack } from "../context/rack-context";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface SlotProps {
  position: number;
  equipment?: {
    id: string;
    label: string;
    size: number;
    startPosition: number;
    vectorUrl?: string;
  };
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (size: number) => void;
  dragSize: number;
  removeItem: (id: string) => void;
}

function Slot({
  position,
  equipment,
  onDrop,
  onDragStart,
  dragSize,
  removeItem,
}: SlotProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const slots = document.querySelectorAll(`[data-slot]`);
    slots.forEach((slot) => {
      const slotPosition = parseInt(slot.getAttribute("data-slot") || "0");
      if (slotPosition <= position && slotPosition > position - dragSize) {
        slot.classList.add("bg-neutral-300", "dark:bg-neutral-600");
      } else {
        slot.classList.remove("bg-neutral-300", "dark:bg-neutral-600");
      }
    });
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget?.closest(".rack-planner")) {
      const slots = document.querySelectorAll(`[data-slot]`);
      slots.forEach((slot) => {
        slot.classList.remove("bg-neutral-300", "dark:bg-neutral-600");
      });
    }
  };

  if (equipment && position === equipment.startPosition) {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", equipment.id);
          e.currentTarget.classList.add("opacity-50");
          onDragStart(equipment.size);
        }}
        onDragEnd={(e) => {
          e.currentTarget.classList.remove("opacity-50");
          const slots = document.querySelectorAll(`[data-slot]`);
          slots.forEach((slot) => {
            slot.classList.remove("bg-neutral-300", "dark:bg-neutral-600");
          });
          onDragStart(1);
        }}
        className="group relative flex flex-row items-center gap-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-md p-4 cursor-move transition-opacity"
        style={{
          aspectRatio: `10/${equipment.size}`,
          ...(equipment.vectorUrl && {
            backgroundImage: `url(${equipment.vectorUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }),
        }}
      >
        {equipment.vectorUrl && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
            style={{
              background:
                "linear-gradient(90deg, rgba(23,23,23,1) 0%, rgba(23,23,23,0.6) 50%, rgba(23,23,23,1) 100%)",
            }}
          />
        )}
        <span
          className={`text-sm font-medium relative z-10 transition-opacity ${
            equipment.vectorUrl ? "opacity-0 group-hover:opacity-100" : ""
          }`}
        >
          {equipment.label}
        </span>
        <span
          className={`text-xs text-muted-foreground relative z-10 transition-opacity ${
            equipment.vectorUrl ? "opacity-0 group-hover:opacity-100" : ""
          }`}
        >
          {equipment.size}U
        </span>
        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-2 transition-opacity ${
            equipment.vectorUrl
              ? "opacity-0 group-hover:opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            removeItem(equipment.id);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (
    equipment &&
    position < equipment.startPosition &&
    position > equipment.startPosition - equipment.size
  ) {
    return null;
  }

  return (
    <div
      data-slot={position}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        const slots = document.querySelectorAll(`[data-slot]`);
        slots.forEach((slot) => {
          slot.classList.remove("bg-neutral-300", "dark:bg-neutral-600");
        });
        onDrop(e);
      }}
      className="flex flex-row gap-2 w-full aspect-[10/1] bg-neutral-100 dark:bg-neutral-900 rounded-md transition-colors"
    />
  );
}

export default function RackPlanner() {
  const { slotCount, items, removeItem, addItem } = useRack();
  const [dragSize, setDragSize] = useState(1);

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    newPosition: number
  ) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    const item = items.find((i) => i.id === itemId);

    if (!item) return;

    if (newPosition - item.size + 1 <= 0) return;

    const wouldOverlap = items.some((existingItem) => {
      if (existingItem.id === itemId) return false;

      for (let i = 0; i < item.size; i++) {
        const checkPosition = newPosition - i;
        if (
          checkPosition <= existingItem.startPosition &&
          checkPosition > existingItem.startPosition - existingItem.size
        ) {
          return true;
        }
      }
      return false;
    });

    if (wouldOverlap) return;

    removeItem(itemId);
    addItem(
      {
        id: item.id,
        label: item.label,
        size: item.size,
        vectorUrl: item.vectorUrl,
      },
      newPosition
    );
  };

  return (
    <div className="rack-planner flex flex-col gap-1">
      {Array.from({ length: slotCount }).map((_, index) => {
        const position = slotCount - index;
        const equipment = items.find(
          (item) =>
            position <= item.startPosition &&
            position > item.startPosition - item.size
        );

        return (
          <Slot
            key={position}
            position={position}
            equipment={equipment}
            onDrop={(e) => handleDrop(e, position)}
            onDragStart={setDragSize}
            dragSize={dragSize}
            removeItem={removeItem}
          />
        );
      })}
    </div>
  );
}
