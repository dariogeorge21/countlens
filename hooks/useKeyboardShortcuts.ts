"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui.store";
import { useCountersStore } from "@/store/counters.store";

export function useKeyboardShortcuts() {
  const openCreate = useUIStore((s) => s.openCreate);
  const isCreateOpen = useUIStore((s) => s.isCreateOpen);
  const editingCounterId = useUIStore((s) => s.editingCounterId);
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);
  const isShortcutsOpen = useUIStore((s) => s.isShortcutsOpen);
  const focusedCounterId = useUIStore((s) => s.focusedCounterId);

  const applyDelta = useCountersStore((s) => s.applyDelta);
  const undo = useCountersStore((s) => s.undo);
  const counters = useCountersStore((s) => s.counters);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      // Check for Cmd/Ctrl + Z (Undo)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (focusedCounterId) {
          undo(focusedCounterId);
        } else if (counters.length > 0 && counters[0]) {
          undo(counters[0].id);
        }
        return;
      }

      // Global hotkeys when no modal is open
      const hasModalOpen =
        isCreateOpen || editingCounterId !== null || isSettingsOpen || isShortcutsOpen;

      if (!hasModalOpen) {
        if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          openCreate();
        } else if (e.key === "/") {
          e.preventDefault();
          const searchInput = document.getElementById("counter-search-input");
          if (searchInput) {
            searchInput.focus();
          }
        } else if (e.key === "?") {
          e.preventDefault();
          setShortcutsOpen(true);
        } else if (focusedCounterId) {
          const counter = counters.find((c) => c.id === focusedCounterId);
          if (counter) {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const multiplier = e.shiftKey ? 10 : 1;
              applyDelta(counter.id, counter.step * multiplier);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const multiplier = e.shiftKey ? 10 : 1;
              applyDelta(counter.id, -counter.step * multiplier);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    openCreate,
    isCreateOpen,
    editingCounterId,
    isSettingsOpen,
    isShortcutsOpen,
    setShortcutsOpen,
    focusedCounterId,
    counters,
    applyDelta,
    undo,
  ]);
}
