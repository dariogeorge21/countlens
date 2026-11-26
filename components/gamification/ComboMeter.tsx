"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGamificationStore } from "@/store/gamification.store";
import { Zap } from "lucide-react";

export function ComboMeter() {
  const combo = useGamificationStore((s) => s.combo);
  const focusMode = useGamificationStore((s) => s.progression.focusMode);

  if (focusMode || !combo.isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="combo-meter"
        initial={{ opacity: 0, y: 12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/90 to-rose-500/90 text-white shadow-2xl backdrop-blur-xl border border-white/20 select-none">
          <div className="flex items-center gap-1.5 font-extrabold text-sm tracking-wide uppercase">
            <Zap className="w-4 h-4 fill-white animate-bounce" />
            <span>{combo.multiplier}x COMBO!</span>
            <span className="text-xs font-mono opacity-90">({combo.count} counts)</span>
          </div>
          <div className="w-full h-1 bg-white/30 rounded-full mt-1.5 overflow-hidden">
            <motion.div
              key={combo.lastTapTimestamp}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 1.8, ease: "linear" }}
              className="h-full bg-white"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
