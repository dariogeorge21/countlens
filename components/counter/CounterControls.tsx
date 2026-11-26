"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import { HoldButton } from "@/components/interactions/HoldButton";
import { canIncrement, canDecrement } from "@/lib/counter-logic";
import { Counter } from "@/types/counter";

interface CounterControlsProps {
  counter: Counter;
  onIncrement: () => boolean | void;
  onDecrement: () => boolean | void;
  onStepChange?: (newStep: number) => void;
}

export function CounterControls({
  counter,
  onIncrement,
  onDecrement,
  onStepChange,
}: CounterControlsProps) {
  const isIncDisabled = !canIncrement(counter);
  const isDecDisabled = !canDecrement(counter);

  // Quick cycle step: 1 -> 5 -> 10 -> 25 -> 100 -> 1
  const cycleStep = () => {
    if (!onStepChange) return;
    const presets = [1, 5, 10, 25, 100];
    const currentIndex = presets.indexOf(counter.step);
    const nextIndex = (currentIndex + 1) % presets.length;
    const nextStep = presets[nextIndex] ?? 1;
    onStepChange(nextStep);
  };

  return (
    <div className="flex items-center gap-2.5 w-full mt-2">
      <HoldButton
        onTick={onDecrement}
        icon={<Minus className="w-5 h-5 stroke-[2.5]" />}
        label="Decrement"
        variant="decrement"
        disabled={isDecDisabled}
      />

      {/* Step multiplier badge */}
      <button
        type="button"
        onClick={cycleStep}
        className="h-10 px-3 flex flex-col items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary/90 transition-colors text-[11px] font-mono font-bold text-muted-foreground hover:text-foreground cursor-pointer select-none border border-border/50"
        title="Click to cycle step multiplier"
      >
        <span className="text-[9px] uppercase tracking-wider opacity-60">Step</span>
        <span>±{counter.step}</span>
      </button>

      <HoldButton
        onTick={onIncrement}
        icon={<Plus className="w-5 h-5 stroke-[2.5]" />}
        label="Increment"
        variant="increment"
        disabled={isIncDisabled}
      />
    </div>
  );
}
