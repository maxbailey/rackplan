"use client";

import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";
import { useState, useEffect } from "react";
import Image from "next/image";
import { EquipmentSearch } from "./equipment-search";
import { EquipmentTags } from "./equipment-tags";
import { EquipmentItem } from "./equipment-item";
import type { EquipmentData } from "./settings-panel";

interface EquipmentListProps {
  items: {
    id: string;
    size: number;
    isBlank?: boolean;
  }[];
  onAddItem: (item: {
    id: string;
    label: string;
    size: number;
    imageUrl?: string;
    link?: string;
  }) => void;
}

export function EquipmentList({ items, onAddItem }: EquipmentListProps) {
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch("/api/equipment");
        if (!response.ok) throw new Error("Failed to fetch equipment");
        const data = await response.json();
        setEquipment(data.equipment);
        setAllTags(data.tags);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const canFitEquipment = (size: number) => {
    const blankSlots = items.filter((item) => item.isBlank);
    return blankSlots.length >= size;
  };

  const handleInsert = (equipmentItem: EquipmentData) => {
    onAddItem({
      id: `${equipmentItem.id}-${Date.now()}`,
      label: equipmentItem.label,
      size: parseInt(equipmentItem.size),
      imageUrl: equipmentItem.imageUrl,
      link: equipmentItem.link,
    });
  };

  const filteredEquipment = equipment.filter((item) => {
    if (selectedTag && (!item.tags || !item.tags.includes(selectedTag))) {
      return false;
    }

    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const searchableFields = [
      item.label,
      item.manufacturer,
      item.model,
      ...(item.tags || []),
    ];

    return searchableFields.some((field) =>
      field?.toLowerCase().includes(query)
    );
  });

  return (
    <Card className="flex flex-col">
      <EquipmentSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <EquipmentTags
        tags={allTags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
      />

      {loading ? (
        <div className="flex items-center justify-center w-full p-6">
          <Image src="/loading-ring.svg" alt="Loading" width={24} height={24} />
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="px-3 py-2">
            {filteredEquipment.map((item) => (
              <EquipmentItem
                key={item.id}
                equipment={item}
                canFit={canFitEquipment(parseInt(item.size))}
                onInsert={handleInsert}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
