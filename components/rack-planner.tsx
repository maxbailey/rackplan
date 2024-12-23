"use client";

import { useRack } from "../context/rack-context";

export function Slot() {
  return (
    <>
      <div className="flex flex-row gap-2 w-full aspect-[10/1] bg-neutral-100 dark:bg-neutral-900 rounded-md"></div>
    </>
  );
}

export default function RackPlanner() {
  const { slotCount } = useRack();

  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: slotCount }).map((_, index) => (
        <Slot key={index} />
      ))}
    </div>
  );
}
