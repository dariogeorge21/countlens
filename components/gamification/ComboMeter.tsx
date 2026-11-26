"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGamificationStore } from "@/store/gamification.store";

export function ComboMeter() {
  const combo = useGamificationStore((s) => s.combo);
  const focusMode = useGamificationStore((s) => s.progression.focusMode);

  if (focusMode || !combo.isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="combo-meter"
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 450, damping: 28 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="flex flex-col items-center px-3.5 py-1.5 rounded-full bg-foreground text-background shadow-2xl border border-background/20 select-none font-mono">
          <div className="flex items-center gap-2 text-xs font-bold tracking-tight">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">
              CADENCE
            </span>
            <span className="text-sm font-black tabular-nums text-amber-400">
              &times;{combo.multiplier}.0
            </span>
            <span className="text-[11px] opacity-60 font-medium tabular-nums border-l border-background/20 pl-2">
              {combo.count} counts
            </span>
          </div>

          {/* Micro Hairline Decay Gauge */}
          <div className="w-full h-[2px] bg-background/20 rounded-full mt-1 overflow-hidden">
            <motion.div
              key={combo.lastTapTimestamp}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 1.8, ease: "linear" }}
              className="h-full bg-amber-400"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
