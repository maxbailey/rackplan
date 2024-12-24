"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface RackItem {
  id: string;
  label: string;
  size: number;
  startPosition?: number;
  vectorUrl?: string;
}

interface RackContextType {
  slotCount: number;
  updateSlotCount: (size: number) => void;
  items: RackItem[];
  addItem: (item: Omit<RackItem, "startPosition">, position?: number) => void;
  removeItem: (id: string) => void;
  updateItems: (items: RackItem[]) => void;
}

const RackContext = createContext<RackContextType | undefined>(undefined);

export function RackProvider({ children }: { children: ReactNode }) {
  const [slotCount, setSlotCount] = useState<number>(12);
  const [items, setItems] = useState<RackItem[]>([]);

  const updateSlotCount = (size: number) => {
    if (size >= 1 && size <= 50) {
      setSlotCount(size);
    }
  };

  const updateItems = (newItems: RackItem[]) => {
    const itemsWithPosition = newItems.map((item) => ({
      ...item,
      startPosition: item.startPosition ?? slotCount,
    }));
    setItems(itemsWithPosition);
  };

  const addItem = (
    item: Omit<RackItem, "startPosition">,
    position?: number
  ) => {
    if (position !== undefined) {
      setItems((prev) => [...prev, { ...item, startPosition: position }]);
      return;
    }

    let startPosition = slotCount;
    while (startPosition > 0) {
      const isSlotAvailable = !items.some(
        (existingItem) =>
          startPosition <= (existingItem.startPosition ?? 0) &&
          startPosition > (existingItem.startPosition ?? 0) - existingItem.size
      );

      if (isSlotAvailable && startPosition - item.size + 1 > 0) {
        setItems((prev) => [...prev, { ...item, startPosition }]);
        break;
      }
      startPosition--;
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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
