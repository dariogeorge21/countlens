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
        "group relative flex items-center gap-1.5 h-8 px-2.5 rounded-lg border transition-all duration-150 cursor-pointer select-none shadow-2xs",
        hasStreak
          ? "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
          : "bg-background/80 hover:bg-secondary/70 border-border/80 text-muted-foreground hover:border-foreground/20"
      )}
      title={`Streak: ${progression.streak} days • Best: ${progression.bestStreak} days • ${
        progression.streakFreezeAvailable ? "Freeze armed" : "Freeze used"
      }`}
    >
      <Flame
        className={cn(
          "w-3.5 h-3.5 transition-colors",
          hasStreak ? "text-amber-500 fill-amber-500/20 stroke-[2]" : "text-muted-foreground stroke-[1.8]"
        )}
      />
      <span className="text-xs font-mono font-bold tabular-nums">
        {progression.streak}
        <span className="text-[10px] text-muted-foreground/80 font-normal ml-0.5">d</span>
      </span>

      {progression.streakFreezeAvailable && hasStreak && (
        <span
          title="Streak Freeze Armed"
          className="flex items-center text-cyan-600 dark:text-cyan-400 pl-0.5 border-l border-amber-500/30"
        >
          <ShieldCheck className="w-3 h-3 stroke-[2.2]" />
        </span>
      )}
    </button>
  );
}
