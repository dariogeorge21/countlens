"use client";

import { useCallback } from "react";
import { useCountersStore } from "@/store/counters.store";

export function useHaptics() {
  const hapticsEnabled = useCountersStore((s) => s.settings.haptics);

  const trigger = useCallback(
    (pattern: number | number[] = 15) => {
      if (!hapticsEnabled) return;
      if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch {
          // Ignore vibration failures on non-supported platforms
        }
      }
    },
    [hapticsEnabled]
  );

  return {
    tick: () => trigger(12),
    limit: () => trigger([30, 40, 30]),
    wrap: () => trigger([15, 20, 25]),
    snap: () => trigger(25),
  };
}
