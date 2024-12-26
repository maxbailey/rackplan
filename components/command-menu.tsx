"use client";

import { useEffect, useState } from "react";
import { DownloadIcon, FileJson, RotateCcw, Package } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRack } from "@/context/rack-context";

interface EquipmentData {
  id: string;
  label: string;
  manufacturer: string;
  model: string;
  size: string;
  color: string;
  logoUrl?: string;
  imageUrl?: string;
}

interface CommandMenuProps {
  setOpen: (open: boolean) => void;
}

export function CommandMenu({ setOpen }: CommandMenuProps) {
  const { slotCount, items, updateSlotCount, updateItems, addItem } = useRack();
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch("/api/equipment");
        if (!response.ok) throw new Error("Failed to fetch equipment");
        const data = await response.json();
        setEquipment(data);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      }
    };

    fetchEquipment();
  }, []);

  const filteredEquipment = inputValue
    ? equipment.filter((item) =>
        item.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  const handleSave = () => {
    const state = {
      slotCount,
      items: items.map((item) => ({
        id: item.id,
        label: item.label,
        size: item.size,
        imageUrl: item.imageUrl,
        isBlank: item.isBlank,
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
    setOpen(false);
  };

  const handleLoad = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const state = JSON.parse(e.target?.result as string);
          updateSlotCount(state.slotCount);
          updateItems(state.items);
          setOpen(false);
        } catch (error) {
          console.error("Invalid file format:", error);
          alert(
            "Invalid file format. Please select a valid rack plan JSON file."
          );
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    const blankSlots = Array.from({ length: slotCount }, (_, i) => ({
      id: `blank-${Date.now()}-${i}`,
      size: 1,
      isBlank: true,
      label: "1U",
    }));
    updateItems(blankSlots);
    setOpen(false);
  };

  const handleInsert = (equipmentItem: EquipmentData) => {
    addItem({
      id: `${equipmentItem.id}-${Date.now()}`,
      label: equipmentItem.label,
      size: parseInt(equipmentItem.size),
      imageUrl: equipmentItem.imageUrl,
    });
    setOpen(false);
  };

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput
        placeholder="Search equipment or type a command..."
        value={inputValue}
        onValueChange={setInputValue}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {filteredEquipment.length > 0 && (
          <CommandGroup heading="Equipment">
            {filteredEquipment.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleInsert(item)}
                className="flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>{item.label}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {item.size}U
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={handleSave}
            disabled={items.every((item) => item.isBlank)}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            <span>Save Layout</span>
          </CommandItem>
          <CommandItem onSelect={handleLoad}>
            <FileJson className="mr-2 h-4 w-4" />
            <span>Load Layout</span>
          </CommandItem>
          <CommandItem
            onSelect={handleReset}
            disabled={items.every((item) => item.isBlank)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Reset Layout</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
