"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface RackItem {
  id: string;
  label: string;
  size: number;
  vectorUrl?: string;
  isBlank?: boolean;
  link?: string;
}

interface RackContextType {
  slotCount: number;
  updateSlotCount: (size: number) => void;
  items: RackItem[];
  addItem: (item: Omit<RackItem, "isBlank">) => void;
  removeItem: (id: string) => void;
  updateItems: (items: RackItem[]) => void;
}

const RackContext = createContext<RackContextType | undefined>(undefined);

function createBlankSlots(count: number): RackItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `blank-${Date.now()}-${i}`,
    size: 1,
    isBlank: true,
    label: "1U",
  }));
}

export function RackProvider({ children }: { children: ReactNode }) {
  const [slotCount, setSlotCount] = useState<number>(12);
  const [items, setItems] = useState<RackItem[]>(createBlankSlots(12));

  const updateSlotCount = (size: number) => {
    if (size >= 1 && size <= 50) {
      setSlotCount(size);
      const nonBlankItems = items.filter((item) => !item.isBlank);
      const usedSlots = nonBlankItems.reduce((acc, item) => acc + item.size, 0);
      const neededBlankSlots = Math.max(0, size - usedSlots);

      setItems([...nonBlankItems, ...createBlankSlots(neededBlankSlots)]);
    }
  };

  const updateItems = (newItems: RackItem[]) => {
    setItems(newItems);
  };

  const addItem = (item: Omit<RackItem, "isBlank">) => {
    const newItem = { ...item, isBlank: false };

    let consecutiveBlankCount = 0;
    let startIndex = -1;

    for (let i = 0; i < items.length; i++) {
      if (items[i].isBlank) {
        if (startIndex === -1) startIndex = i;
        consecutiveBlankCount++;
        if (consecutiveBlankCount === newItem.size) break;
      } else {
        consecutiveBlankCount = 0;
        startIndex = -1;
      }
    }

    if (consecutiveBlankCount < newItem.size) return;

    const newItems = [...items];
    newItems.splice(startIndex, newItem.size, newItem);
    setItems(newItems);
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find((item) => item.id === id);
    if (!itemToRemove || itemToRemove.isBlank) return;

    setItems((prev) => {
      const newItems = prev.filter((item) => item.id !== id);
      return [...newItems, ...createBlankSlots(itemToRemove.size)];
    });
  };

  return (
    <RackContext.Provider
      value={{
        slotCount,
        updateSlotCount,
        items,
        addItem,
        removeItem,
        updateItems,
      }}
    >
      {children}
    </RackContext.Provider>
  );
}

export function useRack() {
  const context = useContext(RackContext);
  if (context === undefined) {
    throw new Error("useRack must be used within a RackProvider");
  }
  return context;
}
