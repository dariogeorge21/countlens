"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/store/ui.store";
import { Keyboard } from "lucide-react";

export function ShortcutsDialog() {
  const isShortcutsOpen = useUIStore((s) => s.isShortcutsOpen);
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);

  const shortcuts = [
    { key: "N", desc: "Create a new counter" },
    { key: "/", desc: "Focus search bar" },
    { key: "?", desc: "Open keyboard shortcuts guide" },
    { key: "Esc", desc: "Close open dialog or unfocus search" },
    { key: "\u2191 / \u2193", desc: "Increment / Decrement focused counter" },
    { key: "Shift + \u2191 / \u2193", desc: "Increment / Decrement by 10\u00d7 step" },
    { key: "Cmd/Ctrl + Z", desc: "Undo most recent counting action" },
  ];

  return (
    <Dialog open={isShortcutsOpen} onOpenChange={setShortcutsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-500" />
            <DialogTitle className="text-lg font-bold">
              Keyboard Shortcuts
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-secondary/40 text-xs"
            >
              <span className="text-muted-foreground">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded-md bg-secondary text-foreground font-mono font-semibold border border-border shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
