"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Repeat } from "lucide-react";
import { LimitBehavior } from "@/types/counter";

interface LimitIndicatorProps {
  value: number;
  min: number | null;
  max: number | null;
  limitBehavior: LimitBehavior;
  hitLimitFlash: boolean;
  wrappedFlash: boolean;
}

export function LimitIndicator({
  value,
  min,
  max,
  limitBehavior,
  hitLimitFlash,
  wrappedFlash,
}: LimitIndicatorProps) {
  const isAtMax = max !== null && value >= max;

  return (
    <div className="flex items-center gap-1.5 h-5 select-none">
      <AnimatePresence mode="wait">
        {hitLimitFlash && (
          <motion.div
            key="limit-flash"
            initial={{ opacity: 0, scale: 0.8, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-destructive/15 text-destructive border border-destructive/30"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{isAtMax ? "Limit Max" : "Limit Min"}</span>
          </motion.div>
        )}

        {wrappedFlash && (
          <motion.div
            key="wrap-flash"
            initial={{ opacity: 0, scale: 0.8, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
          >
            <Repeat className="w-3 h-3 animate-spin duration-700" />
            <span>Wrapped</span>
          </motion.div>
        )}

        {!hitLimitFlash && !wrappedFlash && (min !== null || max !== null) && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground/75 font-mono">
            <span>
              {min !== null ? min : "-\u221E"} &hellip; {max !== null ? max : "+\u221E"}
            </span>
            {limitBehavior === "wrap" && (
              <span title="Wraps around">
                <Repeat className="w-2.5 h-2.5 opacity-60 ml-0.5" />
              </span>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
