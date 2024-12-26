"use client";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { useState, useEffect } from "react";
import { useRack } from "../context/rack-context";
import { DownloadIcon, FileJson, RotateCcw } from "lucide-react";
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

  const filteredEquipment = equipment.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3 sticky top-6">
      <div className="grid grid-cols-3 gap-3">
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
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
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
