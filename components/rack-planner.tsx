"use client";

import { useRack } from "../context/rack-context";

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
}

function Slot({ position, equipment, onDrop }: SlotProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-neutral-300", "dark:bg-neutral-700");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("bg-neutral-300", "dark:bg-neutral-700");
  };

  if (equipment && position === equipment.startPosition) {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", equipment.id);
          e.currentTarget.classList.add("opacity-50");
        }}
        onDragEnd={(e) => {
          e.currentTarget.classList.remove("opacity-50");
        }}
        className="flex flex-row items-center gap-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-md p-4 cursor-move transition-opacity"
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
        <span className="text-sm font-medium">{equipment.label}</span>
        <span className="text-xs text-muted-foreground">{equipment.size}U</span>
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
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        handleDragLeave(e);
        onDrop(e);
      }}
      className="flex flex-row gap-2 w-full aspect-[10/1] bg-neutral-100 dark:bg-neutral-900 rounded-md transition-colors"
    />
  );
}

export default function RackPlanner() {
  const { slotCount, items, removeItem, addItem } = useRack();

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
    <div className="flex flex-col gap-1">
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
          />
        );
      })}
    </div>
  );
}
