"use client";

import { useRack } from "../../context/rack-context";
import { ActionButtons } from "./action-buttons";
import { RackSizeControl } from "./rack-size-control";
import { EquipmentList } from "./equipment-list";

export interface EquipmentData {
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
  tags?: string[];
}

export interface RackState {
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

  const handleReset = () => {
    const blankSlots = Array.from({ length: slotCount }, (_, i) => ({
      id: `blank-${Date.now()}-${i}`,
      size: 1,
      isBlank: true,
      label: "1U",
    }));
    updateItems(blankSlots);
  };

  const handleLoad = (state: RackState) => {
    updateSlotCount(state.slotCount);
    updateItems(state.items);
  };

  return (
    <div className="flex flex-col gap-3 sticky top-6">
      <ActionButtons
        items={items}
        slotCount={slotCount}
        onLoad={handleLoad}
        onReset={handleReset}
      />
      <RackSizeControl
        slotCount={slotCount}
        items={items}
        onUpdateSlotCount={updateSlotCount}
      />
      <EquipmentList items={items} onAddItem={addItem} />
    </div>
  );
}
