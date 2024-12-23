"use client";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { useState } from "react";
import { useRack } from "../context/rack-context";

export default function SettingsPanel() {
  const { slotCount, updateSlotCount } = useRack();
  const [inputValue, setInputValue] = useState<string>(slotCount.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newValue = parseInt(inputValue);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= 50) {
      updateSlotCount(newValue);
    } else {
      setInputValue(slotCount.toString());
    }
  };

  return (
    <Card className="flex flex-col p-6 gap-2 sticky top-6">
      <h1 className="text-xl font-medium tracking-tight text-foreground">
        Settings
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-row w-full items-center justify-between"
      >
        <span className="text-sm text-muted-foreground">Rack Size (units)</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={50}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <Button variant="outline" type="submit">
            Update
          </Button>
        </div>
      </form>
    </Card>
  );
}
