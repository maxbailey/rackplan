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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      <motion.div
        className={`group relative flex flex-col items-center w-full overflow-hidden select-none rounded-md shadow-black/10 dark:shadow-lg dark:shadow-black/20 ${
          isBlank
            ? "bg-neutral-100 dark:bg-rack-muted justify-center"
            : "bg-white border shadow dark:bg-rack"
        }`}
        onPointerDown={(e: React.PointerEvent) => controls.start(e)}
      >
        <div
          className="w-full"
          style={{
            aspectRatio: `10/${size}`,
            ...(vectorUrl && {
              backgroundImage: `url(${vectorUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }),
          }}
        ></div>
        <div className="flex flex-row gap-2 justify-between p-2 w-full">
          {isBlank ? (
            <span className="text-sm font-medium text-neutral-400 dark:text-neutral-700">
              Empty 1U Slot
            </span>
          ) : (
            <>
              <span className="text-sm font-medium text-foreground dark:text-foreground">
                {size}U • {label}
              </span>
            </>
          )}
          {!isBlank && (
            <span
              className="text-sm font-medium text-muted-foreground dark:text-muted-foreground cursor-pointer hover:dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                removeItem(id);
              }}
            >
              Remove
            </span>
          )}
        </div>
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
        layoutScroll
      >
        {items.map((item) => (
          <Item key={item.id} item={item} removeItem={removeItem} />
        ))}
      </Reorder.Group>
    </div>
  );
}
