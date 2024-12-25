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
  removeItem: (id: string) => void;
}

function Slot({ position, equipment, removeItem }: SlotProps) {
  if (equipment && position === equipment.startPosition) {
    return (
      <div
        className="group relative flex flex-row items-center gap-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-md p-4"
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
      className="flex flex-row gap-2 w-full aspect-[10/1] bg-neutral-100 dark:bg-neutral-900 rounded-md transition-colors"
    />
  );
}

export default function RackPlanner() {
  const { slotCount, items, removeItem } = useRack();

  return (
    <div className="rack-planner flex flex-col gap-1">
      {Array.from({ length: slotCount }).map((_, index) => {
        const position = slotCount - index;
        const equipment = items.find((item) => {
          const startPosition = item.startPosition ?? 0;
          return (
            position <= startPosition && position > startPosition - item.size
          );
        });

        // Only pass equipment if it has a valid startPosition
        const validEquipment =
          equipment && equipment.startPosition !== undefined
            ? {
                ...equipment,
                startPosition: equipment.startPosition,
              }
            : undefined;

        return (
          <Slot
            key={position}
            position={position}
            equipment={validEquipment}
            removeItem={removeItem}
          />
        );
      })}
    </div>
  );
}
