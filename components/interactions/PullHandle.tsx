"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, ArrowDown, GripHorizontal } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface PullHandleProps {
  currentValue: number;
  step: number;
  color: string;
  onApplyDelta: (delta: number) => void;
  className?: string;
}

export function PullHandle({
  currentValue,
  step,
  color,
  onApplyDelta,
  className,
}: PullHandleProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullOffset, setPullOffset] = useState(0);
  const [activeDelta, setActiveDelta] = useState(0);
  const startYRef = useRef(0);
  const activeDeltaRef = useRef(0);
  const { playSound } = useSoundEffects();
  const haptics = useHaptics();

  const calculateDelta = (offsetY: number) => {
    const thresholdPerStep = 24;
    const direction = offsetY < 0 ? 1 : -1;
    const distance = Math.abs(offsetY);
    const stepsCount = Math.floor(distance / thresholdPerStep);
    return direction * stepsCount * step;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startYRef.current = e.clientY;
    setIsPulling(true);
    setPullOffset(0);
    setActiveDelta(0);
    activeDeltaRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPulling) return;
    const rawDy = e.clientY - startYRef.current;
    const sign = Math.sign(rawDy);
    const absDy = Math.abs(rawDy);
    const dampedDy = sign * Math.min(absDy * 0.65, 120);

    setPullOffset(dampedDy);

    const newDelta = calculateDelta(rawDy);
    if (newDelta !== activeDeltaRef.current) {
      activeDeltaRef.current = newDelta;
      setActiveDelta(newDelta);
      haptics.tick();
      playSound("tick");
    }
  };

  const finishPull = useCallback(() => {
    if (!isPulling) return;
    setIsPulling(false);

    if (activeDeltaRef.current !== 0) {
      onApplyDelta(activeDeltaRef.current);
      haptics.snap();
      playSound("snap");
    }

    setPullOffset(0);
    setActiveDelta(0);
    activeDeltaRef.current = 0;
  }, [isPulling, onApplyDelta, haptics, playSound]);

  const anticipatedValue = Math.round((currentValue + activeDelta) * 100) / 100;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center py-1 select-none gesture-zone",
        className
      )}
    >
      <AnimatePresence>
        {isPulling && activeDelta !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: pullOffset < 0 ? -48 : 36, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="absolute z-30 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-xl shadow-black/40 backdrop-blur-md"
            style={{ backgroundColor: color }}
          >
            {activeDelta > 0 ? (
              <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
            )}
            <span>
              {activeDelta > 0 ? `+${activeDelta}` : activeDelta}
            </span>
            <span className="opacity-60 text-[10px]">({anticipatedValue})</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPull}
        onPointerCancel={finishPull}
        animate={{ y: pullOffset }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className={cn(
          "flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full cursor-ns-resize transition-colors duration-150 group",
          isPulling
            ? "bg-accent/80 ring-2 ring-primary/30"
            : "hover:bg-accent/50 active:bg-accent/80"
        )}
        title="Pull up to increment, pull down to decrement"
      >
        <GripHorizontal className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        <span className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground group-hover:text-foreground select-none">
          {isPulling ? "Release to count" : "Pull to count"}
        </span>
      </motion.div>
    </div>
  );
}
