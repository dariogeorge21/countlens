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
import { Trophy, Share2 } from "lucide-react";

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
          particleCount: activeMilestone.tier === "epic" ? 120 : 60,
          spread: activeMilestone.tier === "epic" ? 90 : 60,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#06b6d4"],
        });
      } catch {
        // Safe fallback if canvas-confetti context lost
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
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="w-16 h-16 mx-auto mb-2 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center shadow-xl text-white">
            <Trophy className="w-8 h-8 stroke-[2.5]" />
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            Milestone Reached!
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-2">
          <p className="text-3xl font-extrabold font-mono text-indigo-500">
            {activeMilestone.milestone}
          </p>
          <p className="text-xs text-muted-foreground">
            You reached {activeMilestone.milestone} on{" "}
            <span className="font-bold text-foreground">
              {activeMilestone.counterName}
            </span>
            . That&apos;s meaningful momentum!
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {targetCounter && (
            <Button
              variant="glow"
              onClick={handleShare}
              className="gap-2 font-semibold"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Milestone Card</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={clearMilestoneHit}
            className="text-xs"
          >
            Continue Counting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
