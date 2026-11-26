"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGamificationStore } from "@/store/gamification.store";
import { useCountersStore } from "@/store/counters.store";
import { Share2 } from "lucide-react";

export function MilestoneCelebration() {
  const counters = useCountersStore((s) => s.counters);
  const activeMilestone = useGamificationStore((s) => s.activeMilestoneHit);
  const clearMilestoneHit = useGamificationStore((s) => s.clearMilestoneHit);
  const openShareModal = useGamificationStore((s) => s.openShareModal);

  useEffect(() => {
    if (!activeMilestone) return;

    if (activeMilestone.tier === "medium" || activeMilestone.tier === "epic") {
      try {
        confetti({
          particleCount: activeMilestone.tier === "epic" ? 70 : 35,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#18181b", "#71717a", "#e4e4e7", "#6366f1", "#f59e0b"],
          ticks: 200,
        });
      } catch {
        // Fallback if canvas-confetti is unavailable
      }
    }
  }, [activeMilestone]);

  if (!activeMilestone) return null;

  const targetCounter = counters.find((c) => c.id === activeMilestone.counterId);

  const handleShare = () => {
    if (targetCounter) {
      openShareModal(targetCounter);
    }
    clearMilestoneHit();
  };

  return (
    <Dialog open={!!activeMilestone} onOpenChange={() => clearMilestoneHit()}>
      <DialogContent className="max-w-sm p-6 text-center border-border/80 bg-background/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="mx-auto w-10 h-10 rounded-full border border-border/80 bg-secondary/50 flex items-center justify-center text-xs font-mono font-bold text-foreground mb-2">
            CL
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            Telemetry Milestone
          </span>
          <DialogTitle className="text-3xl sm:text-4xl font-mono font-black tracking-tight tabular-nums text-foreground">
            {activeMilestone.milestone.toLocaleString()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-1 font-mono text-xs">
          <p className="text-muted-foreground">
            Recorded on{" "}
            <span className="font-semibold text-foreground">
              {activeMilestone.counterName}
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Tier: {activeMilestone.tier.toUpperCase()} &bull; Cadence intact
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-3">
          {targetCounter && (
            <Button
              onClick={handleShare}
              className="gap-2 font-mono text-xs h-9 bg-foreground text-background hover:bg-foreground/90 cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Generate Collector&apos;s Card</span>
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={clearMilestoneHit}
            className="text-xs h-8 text-muted-foreground hover:text-foreground cursor-pointer font-mono"
          >
            Continue (Esc)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
