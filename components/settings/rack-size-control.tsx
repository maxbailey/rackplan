"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { useState } from "react";
import type { RackState } from "./settings-panel";

declare global {
  interface Window {
    umami?: {
      track: (
        eventName: string,
        eventData?: Record<string, string | number>
      ) => void;
    };
  }
}

interface RackSizeControlProps {
  slotCount: number;
  items: RackState["items"];
  onUpdateSlotCount: (count: number) => void;
}

export function RackSizeControl({
  slotCount,
  items,
  onUpdateSlotCount,
}: RackSizeControlProps) {
  const [inputValue, setInputValue] = useState<string>(slotCount.toString());
  const usedSlots = items.reduce(
    (acc, item) => acc + (item.isBlank ? 0 : item.size),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= 50) {
      window.umami?.track("Rack Size Update", {
        size: newValue,
      });
      onUpdateSlotCount(newValue);
    } else {
      setInputValue(slotCount.toString());
    }
  };

  return (
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
  );
}
