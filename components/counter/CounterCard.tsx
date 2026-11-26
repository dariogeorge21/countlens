"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  MoreVertical,
  Pin,
  Copy,
  RotateCcw,
  Pencil,
  Trash2,
  Bookmark,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CounterValue } from "./CounterValue";
import { CounterControls } from "./CounterControls";
import { LimitIndicator } from "./LimitIndicator";
import { CounterHistory } from "./CounterHistory";
import { PullHandle } from "@/components/interactions/PullHandle";
import { DragScrubber } from "@/components/interactions/DragScrubber";
import { SwipeSurface } from "@/components/interactions/SwipeSurface";
import { useCountersStore } from "@/store/counters.store";
import { useUIStore } from "@/store/ui.store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Counter } from "@/types/counter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CounterCardProps {
  counter: Counter;
  className?: string;
}

export function CounterCard({ counter, className }: CounterCardProps) {
  const applyDelta = useCountersStore((s) => s.applyDelta);
  const setDirectValue = useCountersStore((s) => s.setDirectValue);
  const undo = useCountersStore((s) => s.undo);
  const togglePin = useCountersStore((s) => s.togglePin);
  const duplicateCounter = useCountersStore((s) => s.duplicateCounter);
  const resetCounter = useCountersStore((s) => s.resetCounter);
  const deleteCounter = useCountersStore((s) => s.deleteCounter);
  const updateCounter = useCountersStore((s) => s.updateCounter);

  const openEdit = useUIStore((s) => s.openEdit);
  const setFocusedCounterId = useUIStore((s) => s.setFocusedCounterId);
  const focusedCounterId = useUIStore((s) => s.focusedCounterId);

  const [hitLimitFlash, setHitLimitFlash] = useState(false);
  const [wrappedFlash, setWrappedFlash] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [mouseGlowPos, setMouseGlowPos] = useState({ x: 0, y: 0, opacity: 0 });

  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // 3D Tilt Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 300,
    damping: 30,
  });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    setMouseGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 0.12,
    });
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setMouseGlowPos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleApplyDelta = useCallback(
    (delta: number): boolean => {
      const res = applyDelta(counter.id, delta);
      if (!res) return false;

      if (res.hitLimit) {
        setHitLimitFlash(true);
        setIsShaking(true);
        setTimeout(() => setHitLimitFlash(false), 900);
        setTimeout(() => setIsShaking(false), 400);
        return false;
      }

      if (res.wrapped) {
        setWrappedFlash(true);
        setTimeout(() => setWrappedFlash(false), 900);
      }

      return true;
    },
    [applyDelta, counter.id]
  );

  const handleIncrement = () => handleApplyDelta(counter.step);
  const handleDecrement = () => handleApplyDelta(-counter.step);

  const handleDelete = () => {
    const { undo: undoDelete } = deleteCounter(counter.id);
    toast(`Deleted "${counter.name}"`, {
      action: {
        label: "Undo",
        onClick: () => undoDelete(),
      },
    });
  };

  const isFocused = focusedCounterId === counter.id;

  return (
    <motion.div
      ref={cardRef}
      role="spinbutton"
      tabIndex={0}
      aria-label={`${counter.name} counter`}
      aria-valuenow={counter.value}
      aria-valuemin={counter.min ?? undefined}
      aria-valuemax={counter.max ?? undefined}
      onFocus={() => setFocusedCounterId(counter.id)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      animate={
        isShaking && !reducedMotion
          ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.4 }}
      style={{
        perspective: 1000,
        rotateX: reducedMotion ? 0 : rotateXSpring,
        rotateY: reducedMotion ? 0 : rotateYSpring,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative group flex flex-col justify-between rounded-3xl p-5 transition-shadow duration-200 outline-none select-none",
        "glass-card backdrop-blur-xl shadow-lg hover:shadow-2xl",
        isFocused ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
        className
      )}
    >
      {/* Dynamic Specular Parallax Glow Following Mouse Cursor */}
      {!reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mouseGlowPos.x}px ${mouseGlowPos.y}px, ${counter.color}, transparent 70%)`,
            opacity: mouseGlowPos.opacity,
          }}
        />
      )}

      {/* Card Header */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
            style={{ backgroundColor: counter.color }}
          />
          <div className="min-w-0">
            <h3
              className="font-bold text-sm leading-tight truncate text-foreground group-hover:text-primary transition-colors"
              title={counter.name}
            >
              {counter.name}
            </h3>
            <LimitIndicator
              value={counter.value}
              min={counter.min}
              max={counter.max}
              limitBehavior={counter.limitBehavior}
              hitLimitFlash={hitLimitFlash}
              wrappedFlash={wrappedFlash}
            />
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {counter.pinned && (
            <Bookmark className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500 mr-1" />
          )}

          <CounterHistory counter={counter} onUndo={() => undo(counter.id)} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Counter options"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => togglePin(counter.id)}>
                <Pin className="w-4 h-4 mr-2" />
                <span>{counter.pinned ? "Unpin" : "Pin to top"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateCounter(counter.id)}>
                <Copy className="w-4 h-4 mr-2" />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => resetCounter(counter.id)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                <span>Reset to {counter.initialValue}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEdit(counter.id)}>
                <Pencil className="w-4 h-4 mr-2" />
                <span>Edit settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:bg-destructive/15 focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Swipe Surface wrapping the hero value */}
      <SwipeSurface
        step={counter.step}
        color={counter.color}
        onApplyDelta={handleApplyDelta}
        className="w-full my-1 rounded-2xl"
      >
        <CounterValue
          id={counter.id}
          value={counter.value}
          color={counter.color}
          onCommitValue={(val) => setDirectValue(counter.id, val)}
        />
      </SwipeSurface>

      {/* Drag Scrubber */}
      <DragScrubber
        currentValue={counter.value}
        step={counter.step}
        color={counter.color}
        onApplyDelta={handleApplyDelta}
      />

      {/* Physical Pull Handle */}
      <PullHandle
        currentValue={counter.value}
        step={counter.step}
        color={counter.color}
        onApplyDelta={handleApplyDelta}
      />

      {/* Bottom Counter Controls */}
      <div className="relative z-10 pt-2 border-t border-border/40">
        <CounterControls
          counter={counter}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onStepChange={(newStep) => updateCounter(counter.id, { step: newStep })}
        />
      </div>
    </motion.div>
  );
}
