"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface DragScrubberProps {
  currentValue: number;
  step: number;
  color: string;
  onApplyDelta: (delta: number) => void;
  className?: string;
}

export function DragScrubber({
  currentValue,
  step,
  color,
  onApplyDelta,
  className,
}: DragScrubberProps) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubDelta, setScrubDelta] = useState(0);
  const startXRef = useRef(0);
  const accumulatedDeltaRef = useRef(0);
  const { playSound } = useSoundEffects();
  const haptics = useHaptics();

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    setIsScrubbing(true);
    setScrubDelta(0);
    accumulatedDeltaRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScrubbing) return;
    const dx = e.clientX - startXRef.current;
    const pxPerStep = 20;
    const steps = Math.trunc(dx / pxPerStep);
    const newDelta = steps * step;

    if (newDelta !== accumulatedDeltaRef.current) {
      accumulatedDeltaRef.current = newDelta;
      setScrubDelta(newDelta);
      haptics.tick();
      playSound("tick");
    }
  };

  const finishScrub = useCallback(() => {
    if (!isScrubbing) return;
    setIsScrubbing(false);

    if (accumulatedDeltaRef.current !== 0) {
      onApplyDelta(accumulatedDeltaRef.current);
      haptics.snap();
      playSound("snap");
    }

    setScrubDelta(0);
    accumulatedDeltaRef.current = 0;
  }, [isScrubbing, onApplyDelta, haptics, playSound]);

  const targetValue = Math.round((currentValue + scrubDelta) * 100) / 100;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full py-1.5 select-none gesture-zone",
        className
      )}
    >
      <AnimatePresence>
        {isScrubbing && scrubDelta !== 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: -36 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="absolute z-20 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg backdrop-blur-md"
            style={{ backgroundColor: color }}
          >
            <span>{scrubDelta > 0 ? `+${scrubDelta}` : scrubDelta}</span>
            <span className="opacity-70 text-[10px]">({targetValue})</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishScrub}
        onPointerCancel={finishScrub}
        className={cn(
          "w-full h-7 rounded-xl flex items-center justify-between px-3 cursor-ew-resize transition-all duration-150 border border-border/50",
          isScrubbing
            ? "bg-accent border-primary/40 shadow-inner"
            : "bg-secondary/40 hover:bg-secondary/70"
        )}
        title="Scrub left to decrement, right to increment"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
        <div className="flex items-center gap-1">
          {[-2, -1, 0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-150",
                i === 0
                  ? "h-3.5 bg-primary/70"
                  : "h-2 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
      </div>
    </div>
  );
}
