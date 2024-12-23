"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface RackContextType {
  slotCount: number;
  updateSlotCount: (size: number) => void;
}

const RackContext = createContext<RackContextType | undefined>(undefined);

export function RackProvider({ children }: { children: ReactNode }) {
  const [slotCount, setSlotCount] = useState<number>(12);

  const updateSlotCount = (size: number) => {
    if (size >= 1 && size <= 50) {
      setSlotCount(size);
    }
  };

  return (
    <RackContext.Provider value={{ slotCount, updateSlotCount }}>
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
