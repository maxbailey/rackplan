"use client";

import { Button } from "../ui/button";
import Image from "next/image";
import type { EquipmentData } from "./settings-panel";

interface EquipmentItemProps {
  equipment: EquipmentData;
  canFit: boolean;
  onInsert: (equipment: EquipmentData) => void;
}

export function EquipmentItem({
  equipment,
  canFit,
  onInsert,
}: EquipmentItemProps) {
  return (
    <div className="flex flex-row gap-2 items-center justify-between py-2">
      <div className="flex flex-row items-center gap-3">
        <Image
          src={equipment.avatarUrl || equipment.logoUrl || "/rp-avatar.svg"}
          alt={`${equipment.label} logo`}
          width={32}
          height={32}
          className="object-contain rounded-full"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{equipment.label}</span>
          <span className="text-xs text-muted-foreground">
            {equipment.size}U
            {equipment.tags?.length ? ` - ${equipment.tags.join(", ")}` : ""}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onInsert(equipment)}
        disabled={!canFit}
      >
        {canFit ? "Insert" : "No Space"}
      </Button>
    </div>
  );
}
