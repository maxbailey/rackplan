"use client";

import { Badge } from "../ui/badge";

interface EquipmentTagsProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function EquipmentTags({
  tags,
  selectedTag,
  onTagSelect,
}: EquipmentTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? "default" : "secondary"}
          className={`cursor-pointer select-none hover:opacity-80 ${
            selectedTag === tag ? "" : "bg-muted hover:bg-muted"
          }`}
          onClick={() => onTagSelect(selectedTag === tag ? null : tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
