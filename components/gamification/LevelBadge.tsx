"use client";

import React from "react";
import { useGamificationStore } from "@/store/gamification.store";

export function LevelBadge() {
  const progression = useGamificationStore((s) => s.progression);
  const setAchievementsOpen = useGamificationStore((s) => s.setAchievementsOpen);

  if (progression.focusMode) return null;

  return (
    <button
      type="button"
      onClick={() => setAchievementsOpen(true)}
      className="group relative flex items-center gap-2.5 h-8 px-2.5 rounded-lg bg-background/80 hover:bg-secondary/70 border border-border/80 transition-all duration-150 cursor-pointer select-none shadow-2xs hover:border-foreground/20"
      title={`Level ${progression.level} • ${progression.levelTitle} (${progression.currentLevelXp} / ${progression.nextLevelXp} XP)`}
    >
      {/* Precision Level Pill */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground font-semibold">
          LV
        </span>
        <span className="text-xs font-mono font-bold tabular-nums text-foreground">
          {String(progression.level).padStart(2, "0")}
        </span>
      </div>

      {/* Hairline Divider */}
      <span className="h-3.5 w-[1px] bg-border/80" />

      {/* Title & Micro Progress Meter */}
      <div className="hidden md:flex flex-col items-start gap-1">
        <span className="text-[10px] font-semibold text-foreground/80 leading-none tracking-tight group-hover:text-foreground transition-colors">
          {progression.levelTitle}
        </span>
        <div className="w-16 h-1 rounded-full bg-secondary/80 overflow-hidden border border-border/40">
          <div
            className="h-full bg-foreground/70 dark:bg-foreground/85 rounded-full transition-all duration-300"
            style={{ width: `${progression.percentToNext}%` }}
          />
        </div>
      </div>
    </button>
  );
}
