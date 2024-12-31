"use client";

import { Badge } from "../ui/badge";

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

  const handleTagClick = (tag: string) => {
    window.umami?.track("Filter Tag Selected", {
      label: tag,
    });
    onTagSelect(selectedTag === tag ? null : tag);
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? "default" : "secondary"}
          className={`cursor-pointer select-none hover:opacity-80 ${
            selectedTag === tag ? "" : "bg-muted hover:bg-muted"
          }`}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
