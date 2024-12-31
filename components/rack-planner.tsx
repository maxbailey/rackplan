"use client";

import { Trash2 } from "lucide-react";
import { useRack } from "../context/rack-context";
import { Reorder, motion, useDragControls } from "motion/react";
import Link from "next/link";
import "@/lib/types/umami";

interface ItemProps {
  item: {
    id: string;
    label: string;
    size: number;
    imageUrl?: string;
    isBlank?: boolean;
    link?: string;
  };
  removeItem: (id: string) => void;
}

function Item({ item, removeItem }: ItemProps) {
  const controls = useDragControls();
  const { id, label, size, imageUrl, isBlank, link } = item;

  const handleBuyNowClick = () => {
    window.umami?.track("Equipment - Buy Now Click", {
      label,
    });
  };

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
        <div className="flex flex-row gap-2 items-center justify-between p-2 pb-2.5 w-full">
          {isBlank ? (
            <span className="text-sm font-medium text-neutral-400 dark:text-neutral-700">
              Empty 1U Slot
            </span>
          ) : (
            <>
              <span className="text-sm font-medium text-foreground dark:text-foreground">
                {size}U{" "}
                <span className="text-black/30 dark:text-white/30">•</span>{" "}
                {label}
              </span>
              <div className="flex gap-4">
                {link && (
                  <Link
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 flex flex-row items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuyNowClick();
                    }}
                  >
                    Buy Now
                  </Link>
                )}
                <span
                  className="text-sm font-medium text-muted-foreground dark:text-muted-foreground cursor-pointer hover:dark:text-red-400 relative top-[1px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </span>
              </div>
            </>
          )}
        </div>
        <div
          className="w-full"
          style={{
            aspectRatio: `10/${size}`,
            ...(imageUrl && {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }),
          }}
        ></div>
      </motion.div>
    </Reorder.Item>
  );
}

export default function RackPlanner() {
  const { items, updateItems, removeItem } = useRack();

  const handleReorder = (newItems: typeof items) => {
    // Find the item that was moved by comparing the old and new arrays
    const movedItem = newItems.find((item, index) => {
      return item.id !== items[index]?.id && !item.isBlank;
    });

    if (movedItem) {
      window.umami?.track("Equipment - Reorder", {
        label: movedItem.label,
      });
    }

    updateItems(newItems);
  };

  return (
    <div className="rack-planner flex flex-col gap-1">
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="flex flex-col gap-3"
        layoutScroll
      >
        {items.map((item) => (
          <Item key={item.id} item={item} removeItem={removeItem} />
        ))}
      </Reorder.Group>
    </div>
  );
}
