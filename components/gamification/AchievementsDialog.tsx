"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGamificationStore } from "@/store/gamification.store";
import { useCountersStore } from "@/store/counters.store";
import { evaluateBadges } from "@/lib/gamification/engine";
import { CheckCircle2, Lock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_METRICS = {
  bronze: {
    label: "BRONZE",
    border: "border-amber-700/30 dark:border-amber-600/30",
    badge: "text-amber-700 dark:text-amber-500 bg-amber-500/10",
  },
  silver: {
    label: "SILVER",
    border: "border-slate-400/30 dark:border-slate-500/30",
    badge: "text-slate-700 dark:text-slate-300 bg-slate-500/10",
  },
  gold: {
    label: "GOLD",
    border: "border-amber-400/40 dark:border-amber-400/30",
    badge: "text-amber-600 dark:text-amber-400 bg-amber-400/10",
  },
  platinum: {
    label: "PLATINUM",
    border: "border-cyan-400/40 dark:border-cyan-400/30",
    badge: "text-cyan-600 dark:text-cyan-400 bg-cyan-400/10",
  },
};

export function AchievementsDialog() {
  const isAchievementsOpen = useGamificationStore((s) => s.isAchievementsOpen);
  const setAchievementsOpen = useGamificationStore((s) => s.setAchievementsOpen);
  const progression = useGamificationStore((s) => s.progression);
  const counters = useCountersStore((s) => s.counters);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { allBadges } = evaluateBadges(progression, counters);

  const filteredBadges =
    selectedCategory === "all"
      ? allBadges
      : allBadges.filter((b) => b.category === selectedCategory);

  const totalUnlocked = allBadges.filter((b) => b.unlocked).length;

  return (
    <Dialog open={isAchievementsOpen} onOpenChange={setAchievementsOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 bg-background/95 backdrop-blur-2xl border-border/80 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                TELEMETRY CATALOG
              </span>
              <DialogTitle className="text-base font-bold font-mono tracking-tight text-foreground">
                Badges &amp; Milestones
              </DialogTitle>
            </div>

            <div className="px-2.5 py-1 rounded-md bg-secondary/60 border border-border/60 text-xs font-mono font-semibold text-foreground">
              {totalUnlocked} / {allBadges.length} Unlocked
            </div>
          </div>

          <div className="pt-3">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid grid-cols-6 h-8 text-xs font-mono bg-secondary/50 p-0.5 rounded-lg border border-border/60">
                <TabsTrigger value="all" className="rounded-md text-[11px]">All</TabsTrigger>
                <TabsTrigger value="starter" className="rounded-md text-[11px]">Origins</TabsTrigger>
                <TabsTrigger value="consistency" className="rounded-md text-[11px]">Habits</TabsTrigger>
                <TabsTrigger value="milestone" className="rounded-md text-[11px]">Scale</TabsTrigger>
                <TabsTrigger value="exploration" className="rounded-md text-[11px]">Tactile</TabsTrigger>
                <TabsTrigger value="mastery" className="rounded-md text-[11px]">Mastery</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        {/* Badges Matrix */}
        <div className="flex-1 overflow-y-auto pr-1 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredBadges.map((badge) => {
              const tier = TIER_METRICS[badge.tier];
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col justify-between p-3 rounded-xl border transition-all duration-150 font-mono relative",
                    badge.unlocked
                      ? `bg-secondary/20 hover:bg-secondary/35 ${tier.border} shadow-2xs`
                      : "bg-secondary/10 border-border/40 opacity-55 hover:opacity-70"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border",
                          badge.unlocked
                            ? "bg-background/90 border-border/80 text-foreground"
                            : "bg-secondary/40 border-border/40 text-muted-foreground"
                        )}
                      >
                        {badge.unlocked ? (
                          <Award className="w-3.5 h-3.5 stroke-[2]" />
                        ) : (
                          <Lock className="w-3 h-3 stroke-[2] opacity-50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs leading-tight text-foreground truncate">
                          {badge.title}
                        </h4>
                        <span className={cn("text-[9px] uppercase tracking-wider font-semibold px-1 py-0.2 rounded mt-0.5 inline-block", tier.badge)}>
                          {tier.label}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-muted-foreground tabular-nums px-1.5 py-0.5 rounded bg-secondary/50 border border-border/40 flex-shrink-0">
                      +{badge.xpReward} XP
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground/85 font-sans mt-2 line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="tabular-nums">
                      {badge.unlocked
                        ? "Completed"
                        : `${badge.currentProgress} / ${badge.maxProgress}`}
                    </span>
                    {badge.unlocked ? (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Achieved</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50">Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
