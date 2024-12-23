"use client";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { useRack } from "../context/rack-context";

interface EquipmentData {
  id: string;
  label: string;
  manufacturer: string;
  model: string;
  size: string;
  color: string;
}

export default function SettingsPanel() {
  const { slotCount, updateSlotCount, addItem, items } = useRack();
  const [inputValue, setInputValue] = useState<string>(slotCount.toString());
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch("/api/equipment");
        if (!response.ok) throw new Error("Failed to fetch equipment");
        const data = await response.json();
        setEquipment(data);
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
    });
  };

  const canFitEquipment = (size: number) => {
    // Start from the bottom and check each position
    for (let position = slotCount; position > 0; position--) {
      // Check if this position and the required slots above it are free
      let isFree = true;
      for (let offset = 0; offset < size; offset++) {
        const checkPosition = position - offset;
        if (checkPosition <= 0) {
          isFree = false;
          break;
        }

        const isOccupied = items.some(
          (item) =>
            checkPosition <= item.startPosition &&
            checkPosition > item.startPosition - item.size
        );

        if (isOccupied) {
          isFree = false;
          break;
        }
      }

      if (isFree) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col gap-6 sticky top-6">
      <Card className="flex flex-col p-6 gap-2">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          Settings
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-row w-full items-center justify-between"
        >
          <span className="text-sm text-muted-foreground">
            Rack Size (units)
          </span>
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
      <Card className="flex flex-col p-6 gap-3">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          Insert Equipment
        </h1>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="flex flex-col gap-2">
            {equipment.map((item) => {
              const size = parseInt(item.size);
              const canFit = canFitEquipment(size);

              return (
                <div
                  key={item.id}
                  className="flex flex-row items-center justify-between py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.size}U
                    </span>
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
        )}
      </Card>
    </div>
  );
}
