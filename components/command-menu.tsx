"use client";

import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Plus,
  Search,
  Package,
  LayoutGrid,
  Save,
  Download,
} from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandMenu() {
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem>
            <Plus className="mr-2" />
            <span>Add Equipment</span>
          </CommandItem>
          <CommandItem>
            <Search className="mr-2" />
            <span>Search Equipment</span>
          </CommandItem>
          <CommandItem>
            <Package className="mr-2" />
            <span>Browse Equipment</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Layout">
          <CommandItem>
            <LayoutGrid className="mr-2" />
            <span>Adjust Rack Size</span>
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Save className="mr-2" />
            <span>Save Layout</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Download className="mr-2" />
            <span>Export Layout</span>
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
