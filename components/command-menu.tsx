"use client";

import { useEffect, useState, useRef } from "react";
import { DownloadIcon, FileJson, Package, ImageIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRack } from "@/context/rack-context";
import { saveRackState, saveRackImage } from "@/lib/rack-actions";

interface EquipmentData {
  id: string;
  label: string;
  manufacturer: string;
  model: string;
  size: string;
  color: string;
  logoUrl?: string;
  imageUrl?: string;
  link?: string;
}

interface CommandMenuProps {
  setOpen: (open: boolean) => void;
}

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

export function CommandMenu({ setOpen }: CommandMenuProps) {
  const { slotCount, items, updateSlotCount, updateItems, addItem } = useRack();
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [inputValue, setInputValue] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch("/api/equipment");
        if (!response.ok) throw new Error("Failed to fetch equipment");
        const data = await response.json();
        setEquipment(data.equipment);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      }
    };

    fetchEquipment();
  }, []);

  const filteredEquipment = inputValue
    ? (equipment || []).filter((item) =>
        item.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  const handleSave = () => {
    window.umami?.track("Command Menu - Save Layout");
    const state = {
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
    saveRackState(state);
    setOpen(false);
  };

  const handleLoad = () => {
    window.umami?.track("Command Menu - Load Layout");
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

  const handleSaveImage = async () => {
    window.umami?.track("Command Menu - Create Image");
    await saveRackImage(items);
    setOpen(false);
  };

  const handleInsert = (equipmentItem: EquipmentData) => {
    window.umami?.track("Command Menu - Insert Equipment", {
      label: equipmentItem.label,
    });
    addItem({
      id: `${equipmentItem.id}-${Date.now()}`,
      label: equipmentItem.label,
      size: parseInt(equipmentItem.size),
      imageUrl: equipmentItem.imageUrl,
      link: equipmentItem.link,
    });
    setOpen(false);
  };

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput
        placeholder="Search equipment or type a command..."
        value={inputValue}
        onValueChange={(value) => {
          setInputValue(value);
          if (listRef.current) {
            setTimeout(() => {
              listRef.current?.scrollTo(0, 0);
            }, 0);
          }
        }}
      />
      <CommandList ref={listRef}>
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
            onSelect={handleSaveImage}
            disabled={items.every((item) => item.isBlank)}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            <span>Create Image</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
