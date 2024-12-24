"use client";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { useState, useEffect, useCallback } from "react";
import { useRack } from "../context/rack-context";
import { DownloadIcon, FileJson } from "lucide-react";

interface EquipmentData {
  id: string;
  label: string;
  manufacturer: string;
  model: string;
  size: string;
  color: string;
  logoUrl?: string;
  vectorUrl?: string;
}

interface RackState {
  slotCount: number;
  items: {
    id: string;
    label: string;
    size: number;
    startPosition?: number;
    vectorUrl?: string;
  }[];
}

export default function SettingsPanel() {
  const { slotCount, updateSlotCount, addItem, items, updateItems } = useRack();
  const [inputValue, setInputValue] = useState<string>(slotCount.toString());
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSave = () => {
    const state: RackState = {
      slotCount,
      items: items.map((item) => ({
        id: item.id,
        label: item.label,
        size: item.size,
        startPosition: item.startPosition,
        vectorUrl: item.vectorUrl,
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
      vectorUrl: equipmentItem.vectorUrl,
    });
  };

  const canFitEquipment = (size: number) => {
    for (let position = slotCount; position > 0; position--) {
      let isFree = true;
      for (let offset = 0; offset < size; offset++) {
        const checkPosition = position - offset;
        if (checkPosition <= 0) {
          isFree = false;
          break;
        }

        const isOccupied = items.some(
          (item) =>
            checkPosition <= (item.startPosition ?? 0) &&
            checkPosition > (item.startPosition ?? 0) - item.size
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
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSave}
          disabled={items.length === 0}
        >
          <DownloadIcon className="w-4 h-4" />
          Save JSON
        </Button>
        <div className="relative w-full">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <FileJson className="w-4 h-4" />
            Load JSON
          </Button>
          <input
            type="file"
            id="file-upload"
            accept=".json"
            onChange={handleLoad}
            className="hidden"
          />
        </div>
      </div>
      <Card className="flex flex-col p-6 gap-4">
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
          <div className="flex items-center justify-center w-full">
            <img src="/loading-ring.svg" alt="Loading" />
          </div>
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
                  <div className="flex flex-row items-center gap-3">
                    <img
                      src={item.logoUrl || "/rp-avatar.svg"}
                      alt={`${item.label} logo`}
                      className="w-8 h-8 object-contain rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.size}U
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
        )}
      </Card>
    </div>
  );
}
