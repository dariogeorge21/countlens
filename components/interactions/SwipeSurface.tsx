"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface SwipeSurfaceProps {
  step: number;
  color: string;
  onApplyDelta: (delta: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function SwipeSurface({
  step,
  color,
  onApplyDelta,
  children,
  className,
}: SwipeSurfaceProps) {
  const [swipeHint, setSwipeHint] = useState<"left" | "right" | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isSwipingRef = useRef(false);
  const { playSound } = useSoundEffects();
  const haptics = useHaptics();

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture primary button and let nested inputs/buttons work naturally
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest(".gesture-zone")) {
      return;
    }

    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    isSwipingRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSwipingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    // If vertical movement dominates, respect scroll and cancel horizontal swipe
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 15) {
      isSwipingRef.current = false;
      setSwipeHint(null);
      return;
    }

    if (dx > 35) {
      setSwipeHint("right");
    } else if (dx < -35) {
      setSwipeHint("left");
    } else {
      setSwipeHint(null);
    }
  };

  const finishSwipe = useCallback(
    (e: React.PointerEvent) => {
      if (!isSwipingRef.current) return;
      isSwipingRef.current = false;

      const dx = e.clientX - startXRef.current;
      const swipeDistanceThreshold = 50;

      if (dx > swipeDistanceThreshold) {
        // Swipe Right -> Increment
        onApplyDelta(step);
        haptics.tick();
        playSound("tick");
      } else if (dx < -swipeDistanceThreshold) {
        // Swipe Left -> Decrement
        onApplyDelta(-step);
        haptics.tick();
        playSound("tick");
      }

      setSwipeHint(null);
    },
    [step, onApplyDelta, haptics, playSound]
  );

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishSwipe}
      onPointerCancel={() => {
        isSwipingRef.current = false;
        setSwipeHint(null);
      }}
      className={cn("relative overflow-hidden touch-pan-y", className)}
    >
      <AnimatePresence>
        {swipeHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10 flex items-center justify-between px-6"
            style={{ backgroundColor: color }}
          >
            {swipeHint === "left" && (
              <div className="flex items-center gap-2 text-white font-bold text-sm bg-black/40 px-3 py-1.5 rounded-full">
                <ArrowLeft className="w-4 h-4" />
                <span>-{step}</span>
              </div>
            )}
            <div className="flex-1" />
            {swipeHint === "right" && (
              <div className="flex items-center gap-2 text-white font-bold text-sm bg-black/40 px-3 py-1.5 rounded-full">
                <span>+{step}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
