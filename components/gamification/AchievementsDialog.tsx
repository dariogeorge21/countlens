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
import { Trophy, CheckCircle, Lock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_COLORS = {
  bronze: "from-amber-700/20 to-amber-900/10 border-amber-700/40 text-amber-600 dark:text-amber-400",
  silver: "from-slate-400/20 to-slate-600/10 border-slate-400/40 text-slate-600 dark:text-slate-300",
  gold: "from-amber-400/25 to-yellow-600/15 border-amber-400/50 text-amber-500",
  platinum: "from-cyan-400/25 to-indigo-600/15 border-cyan-400/50 text-cyan-500",
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
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-2 border-b border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Trophy className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Achievements Gallery
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Earn XP and unlock badges through tactile consistency and milestones.
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-secondary/80 border border-border/60 text-xs font-mono font-bold">
              {totalUnlocked} / {allBadges.length} Unlocked
            </div>
          </div>

          <div className="pt-3">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid grid-cols-6 h-8 text-xs">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="starter">Starter</TabsTrigger>
                <TabsTrigger value="consistency">Habits</TabsTrigger>
                <TabsTrigger value="milestone">Scale</TabsTrigger>
                <TabsTrigger value="exploration">Tactile</TabsTrigger>
                <TabsTrigger value="mastery">Mastery</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredBadges.map((badge) => {
              const tierStyle = TIER_COLORS[badge.tier];
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col justify-between p-3.5 rounded-2xl border transition-all duration-200 relative overflow-hidden",
                    badge.unlocked
                      ? `bg-gradient-to-br ${tierStyle} shadow-xs`
                      : "bg-secondary/30 border-border/40 opacity-70"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border",
                          badge.unlocked
                            ? "bg-background/80 border-current shadow-xs"
                            : "bg-secondary/50 border-border/50 text-muted-foreground"
                        )}
                      >
                        {badge.unlocked ? (
                          <Award className="w-4 h-4 stroke-[2.2]" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 opacity-60" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs leading-tight text-foreground">
                          {badge.title}
                        </h4>
                        <span className="text-[10px] uppercase tracking-wider font-mono opacity-70">
                          {badge.tier}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-background/60 border border-border/40 text-foreground">
                      +{badge.xpReward} XP
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {badge.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>
                      {badge.unlocked
                        ? "Completed"
                        : `${badge.currentProgress} / ${badge.maxProgress}`}
                    </span>
                    {badge.unlocked && (
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle className="w-3 h-3" />
                        <span>Unlocked</span>
                      </div>
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
