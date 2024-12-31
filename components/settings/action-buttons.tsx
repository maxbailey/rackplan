"use client";

import { Button } from "../ui/button";
import { FileJson, DownloadIcon, ImageIcon, RotateCcw } from "lucide-react";
import type { RackState } from "./settings-panel";
import { ResetConfirmDialog } from "@/components/reset-confirm-dialog";
import {
  saveRackState,
  saveRackImage,
  validateRackState,
} from "@/lib/rack-actions";

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

interface ActionButtonsProps {
  items: RackState["items"];
  slotCount: number;
  onLoad: (state: RackState) => void;
  onReset: () => void;
}

export function ActionButtons({
  items,
  slotCount,
  onLoad,
  onReset,
}: ActionButtonsProps) {
  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedState = JSON.parse(e.target?.result as string);
        if (!validateRackState(parsedState)) {
          throw new Error("Invalid rack state format");
        }
        window.umami?.track("Action Button - Load Layout");
        onLoad(parsedState);
      } catch (error) {
        console.error("Invalid file format:", error);
        alert(
          "Invalid file format. Please select a valid rack plan JSON file that matches the expected structure."
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSave = () => {
    window.umami?.track("Action Button - Save Layout");
    const state: RackState = {
      slotCount,
      items: items.map((item) => ({
        id: item.id,
        label: item.label,
        size: item.size,
        imageUrl: item.imageUrl,
        isBlank: item.isBlank,
        link: item.link,
      })),
    };
    saveRackState(state);
  };

  const handleSaveImage = async () => {
    window.umami?.track("Action Button - Create Image");
    await saveRackImage(items);
  };

  const handleReset = () => {
    window.umami?.track("Action Button - Reset");
    onReset();
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="relative w-full">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <FileJson className="w-4 h-4" />
          Load
        </Button>
        <input
          type="file"
          id="file-upload"
          accept=".json"
          onChange={handleLoad}
          className="hidden"
        />
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleSave}
        disabled={items.every((item) => item.isBlank)}
      >
        <DownloadIcon className="w-4 h-4" />
        Save
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleSaveImage}
        disabled={items.every((item) => item.isBlank)}
      >
        <ImageIcon className="w-4 h-4" />
        Image
      </Button>
      <ResetConfirmDialog
        title="Reset Rack Configuration?"
        description="This will clear all equipment from your rack. Make sure you have saved your work before continuing, as this action cannot be undone."
        trigger={
          <Button
            variant="outline"
            className="w-full"
            disabled={items.every((item) => item.isBlank)}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        }
        onConfirm={handleReset}
        disabled={items.every((item) => item.isBlank)}
      />
    </div>
  );
}
