"use client";

import React from "react";
import { useGamificationStore } from "@/store/gamification.store";
import { Sparkles } from "lucide-react";

export function LevelBadge() {
  const progression = useGamificationStore((s) => s.progression);
  const setAchievementsOpen = useGamificationStore((s) => s.setAchievementsOpen);

  if (progression.focusMode) return null;

  return (
    <button
      type="button"
      onClick={() => setAchievementsOpen(true)}
      className="group relative flex items-center gap-2 px-2.5 py-1 rounded-xl bg-secondary/60 hover:bg-secondary/90 transition-all border border-border/50 cursor-pointer select-none"
      title={`Level ${progression.level}: ${progression.levelTitle} (${progression.currentLevelXp} / ${progression.nextLevelXp} XP to next level)`}
    >
      <div className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-extrabold text-[11px] shadow-xs">
        {progression.level}
      </div>

      <div className="hidden md:flex flex-col items-start text-left">
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-foreground leading-none">
            {progression.levelTitle}
          </span>
          <Sparkles className="w-2.5 h-2.5 text-indigo-500 opacity-70" />
        </div>
        <div className="w-20 h-1.5 rounded-full bg-secondary mt-1 overflow-hidden border border-border/30">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progression.percentToNext}%` }}
          />
        </div>
      </div>
    </button>
  );
}
