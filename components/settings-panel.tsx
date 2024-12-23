"use client";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { useRack } from "../context/rack-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EquipmentData {
  id: string;
  label: string;
  manufacturer: string;
  model: string;
  size: string;
  color: string;
}

export default function SettingsPanel() {
  const { slotCount, updateSlotCount, addItem } = useRack();
  const [inputValue, setInputValue] = useState<string>(slotCount.toString());
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleEquipmentSelect = (equipmentId: string) => {
    const selectedEquipment = equipment.find((item) => item.id === equipmentId);
    if (selectedEquipment) {
      addItem({
        id: `${selectedEquipment.id}-${Date.now()}`,
        label: selectedEquipment.label,
        size: parseInt(selectedEquipment.size),
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 sticky top-6">
      <Card className="flex flex-col p-6 gap-2">
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
      <Card className="flex flex-col p-6 gap-3 sticky top-6">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          Insert Equipment
        </h1>
        <Select onValueChange={handleEquipmentSelect} disabled={loading}>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={loading ? "Loading..." : "Select Equipment"}
            />
          </SelectTrigger>
          <SelectContent>
            {equipment.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label} ({item.size}U)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>
    </div>
  );
}
