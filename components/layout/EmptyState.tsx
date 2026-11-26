"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Plus, Hand, MoveHorizontal, ArrowUpDown, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui.store";
import { CounterValue } from "@/components/counter/CounterValue";
import { PullHandle } from "@/components/interactions/PullHandle";
import { DragScrubber } from "@/components/interactions/DragScrubber";
import { HoldButton } from "@/components/interactions/HoldButton";

export function EmptyState() {
  const openCreate = useUIStore((s) => s.openCreate);
  const [sandboxValue, setSandboxValue] = useState(7);

  const handleApplyDelta = (delta: number) => {
    setSandboxValue((v) => Math.max(0, v + delta));
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-xl mx-auto py-12 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Gesture Sandbox</span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            No counters yet. Try the gestures below!
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            COUNTLENS gives digital counting physical tactile weight. Try pulling,
            scrubbing, or holding this interactive sandbox card:
          </p>
        </div>

        {/* Interactive Tutorial Mini-Card */}
        <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-6 shadow-2xl border border-indigo-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/40">
            <span>Tutorial Sandbox</span>
            <span className="font-mono text-indigo-500">Step: 1</span>
          </div>

          <CounterValue
            id="sandbox-demo"
            value={sandboxValue}
            color="#6366f1"
            onCommitValue={(v) => setSandboxValue(Math.max(0, v))}
          />

          <DragScrubber
            currentValue={sandboxValue}
            step={1}
            color="#6366f1"
            onApplyDelta={handleApplyDelta}
          />

          <PullHandle
            currentValue={sandboxValue}
            step={1}
            color="#6366f1"
            onApplyDelta={handleApplyDelta}
          />

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
            <HoldButton
              onTick={() => handleApplyDelta(-1)}
              icon={<span className="font-bold text-lg">-</span>}
              label="Decrement"
              variant="decrement"
            />
            <HoldButton
              onTick={() => handleApplyDelta(1)}
              icon={<span className="font-bold text-lg">+</span>}
              label="Increment"
              variant="increment"
            />
          </div>

          {/* Gesture guide badges */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border/30 text-[11px] text-muted-foreground text-left">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pull handle vertically</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MoveHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              <span>Scrub horizontally</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-indigo-500" />
              <span>Hold buttons to speed up</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tap number to edit</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button
            size="lg"
            variant="glow"
            onClick={openCreate}
            className="rounded-2xl gap-2 font-semibold shadow-xl px-8"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Counter (N)</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
