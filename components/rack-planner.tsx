"use client";

import { useRack } from "../context/rack-context";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Reorder,
  motion,
  AnimatePresence,
  useDragControls,
} from "motion/react";

interface ItemProps {
  item: {
    id: string;
    label: string;
    size: number;
    vectorUrl?: string;
    isBlank?: boolean;
  };
  removeItem: (id: string) => void;
}

function Item({ item, removeItem }: ItemProps) {
  const controls = useDragControls();
  const { id, label, size, vectorUrl, isBlank } = item;

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="touch-none select-none"
    >
      <motion.div
        className={`group relative flex flex-row items-center gap-2 w-full rounded-md p-4 select-none ${
          isBlank
            ? "bg-neutral-100 dark:bg-neutral-900"
            : "bg-neutral-200 dark:bg-neutral-800"
        }`}
        style={{
          aspectRatio: `10/${size}`,
          ...(vectorUrl && {
            backgroundImage: `url(${vectorUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }),
        }}
        onPointerDown={(e: React.PointerEvent) => controls.start(e)}
      >
        {vectorUrl && !isBlank && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
            style={{
              background:
                "linear-gradient(90deg, rgba(23,23,23,1) 0%, rgba(23,23,23,0.6) 50%, rgba(23,23,23,1) 100%)",
            }}
          />
        )}
        <span
          className={`text-sm font-medium relative z-10 transition-opacity ${
            vectorUrl && !isBlank ? "opacity-0 group-hover:opacity-100" : ""
          }`}
        >
          {label}
        </span>
        <span
          className={`text-xs text-muted-foreground relative z-10 transition-opacity ${
            vectorUrl && !isBlank ? "opacity-0 group-hover:opacity-100" : ""
          }`}
        >
          {size}U
        </span>
        {!isBlank && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-2 transition-opacity ${
              vectorUrl
                ? "opacity-0 group-hover:opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              removeItem(id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </motion.div>
    </Reorder.Item>
  );
}

export default function RackPlanner() {
  const { items, updateItems, removeItem } = useRack();

  return (
    <div className="rack-planner flex flex-col gap-1">
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={updateItems}
        className="flex flex-col gap-1"
      >
        <AnimatePresence>
          {items.map((item) => (
            <Item key={item.id} item={item} removeItem={removeItem} />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}
