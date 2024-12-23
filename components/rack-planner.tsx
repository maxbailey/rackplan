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
}

function Slot({ position, equipment }: SlotProps) {
  if (equipment && position === equipment.startPosition) {
    return (
      <div
        className="flex flex-row items-center gap-2 w-full bg-neutral-200 dark:bg-neutral-800 rounded-md p-4"
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
    <div className="flex flex-row gap-2 w-full aspect-[10/1] bg-neutral-100 dark:bg-neutral-900 rounded-md" />
  );
}

export default function RackPlanner() {
  const { slotCount, items } = useRack();

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
          <Slot key={position} position={position} equipment={equipment} />
        );
      })}
    </div>
  );
}
