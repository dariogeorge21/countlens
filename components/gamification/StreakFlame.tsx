"use client";

import React from "react";
import { useGamificationStore } from "@/store/gamification.store";
import { Flame, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakFlame() {
  const progression = useGamificationStore((s) => s.progression);
  const setChallengesOpen = useGamificationStore((s) => s.setChallengesOpen);

  if (progression.focusMode) return null;

  const hasStreak = progression.streak > 0;

  return (
    <button
      type="button"
      onClick={() => setChallengesOpen(true)}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all border cursor-pointer select-none",
        hasStreak
          ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15"
          : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary/70"
      )}
      title={`Current Streak: ${progression.streak} days • Best: ${progression.bestStreak} days • ${
        progression.streakFreezeAvailable
          ? "Streak Freeze available"
          : "Streak Freeze used"
      }`}
    >
      <Flame
        className={cn(
          "w-4 h-4 transition-transform",
          hasStreak ? "fill-amber-500 text-amber-500 animate-pulse" : "text-muted-foreground"
        )}
      />
      <span className="text-xs font-mono font-bold leading-none">
        {progression.streak}
      </span>
      {progression.streakFreezeAvailable && hasStreak && (
        <span title="Streak Freeze Armed">
          <ShieldCheck className="w-3 h-3 text-cyan-500 opacity-80 ml-0.5" />
        </span>
      )}
    </button>
  );
}
