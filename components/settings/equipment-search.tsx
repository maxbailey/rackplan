"use client";

import { Input } from "../ui/input";
import { useEffect } from "react";

interface EquipmentSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function EquipmentSearch({
  searchQuery,
  onSearchChange,
}: EquipmentSearchProps) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="relative border-b">
      <Input
        className="pe-11 border-none rounded-lg"
        placeholder="Search equipment..."
        type="search"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground">
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[12px] font-medium text-muted-foreground opacity-100">
          <span className="text-[10px] relative top-[2px]">⌘</span>K
        </kbd>
      </div>
    </div>
  );
}
