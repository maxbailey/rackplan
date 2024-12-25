"use client";

import { useEffect, useState } from "react";
import { CommandDialog } from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { CommandMenu } from "@/components/command-menu";

export function CommandDialogDemo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Command Menu</DialogTitle>
      <CommandMenu setOpen={setOpen} />
    </CommandDialog>
  );
}
