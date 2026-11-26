"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGamificationStore } from "@/store/gamification.store";
import { Target, Flame, Shield, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChallengesDrawer() {
  const isChallengesOpen = useGamificationStore((s) => s.isChallengesOpen);
  const setChallengesOpen = useGamificationStore((s) => s.setChallengesOpen);
  const progression = useGamificationStore((s) => s.progression);
  const claimChallenge = useGamificationStore((s) => s.claimChallenge);
  const useStreakFreeze = useGamificationStore((s) => s.useStreakFreeze);

  const dailies = progression.dailyChallenges;
  const weekly = progression.weeklyChallenge;

  return (
    <Dialog open={isChallengesOpen} onOpenChange={setChallengesOpen}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <DialogTitle className="text-lg font-bold">
              Daily Quests &amp; Streak
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Streak Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-indigo-500/15 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Flame className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Active Habit Streak
                </div>
                <div className="text-xl font-extrabold font-mono text-foreground">
                  {progression.streak} {progression.streak === 1 ? "day" : "days"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Best streak: {progression.bestStreak} days
                </div>
              </div>
            </div>

            {progression.streakFreezeAvailable ? (
              <Button
                variant="outline"
                size="sm"
                onClick={useStreakFreeze}
                className="text-xs gap-1 border-cyan-500/40 text-cyan-600 dark:text-cyan-400"
                title="Equip Streak Freeze to protect tomorrow if you miss a count"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Arm Freeze</span>
              </Button>
            ) : (
              <span className="text-[10px] font-mono uppercase text-muted-foreground px-2 py-1 rounded-md bg-secondary/60">
                Freeze Active
              </span>
            )}
          </div>

          {/* Daily Quests List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Today&apos;s Quests
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Resets midnight
              </span>
            </div>

            {dailies.map((quest) => (
              <div
                key={quest.id}
                className={cn(
                  "p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3",
                  quest.claimed
                    ? "bg-secondary/20 border-border/40 opacity-60"
                    : quest.completed
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-secondary/30 border-border/50"
                )}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {quest.title}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-indigo-500">
                      +{quest.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {quest.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-28 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (quest.current / quest.target) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {quest.current} / {quest.target}
                    </span>
                  </div>
                </div>

                {quest.claimed ? (
                  <span className="text-xs font-bold text-muted-foreground px-2 py-1">
                    Claimed
                  </span>
                ) : quest.completed ? (
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={() => claimChallenge(quest.id)}
                    className="h-8 px-3 text-xs gap-1 bg-emerald-600 hover:bg-emerald-500"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Claim</span>
                  </Button>
                ) : (
                  <span className="text-xs font-mono text-muted-foreground px-2">
                    In Progress
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Weekly Quest */}
          {weekly && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Weekly Expedition
              </span>
              <div
                className={cn(
                  "p-3.5 rounded-2xl border flex items-center justify-between gap-3",
                  weekly.claimed
                    ? "bg-secondary/20 border-border/40 opacity-60"
                    : weekly.completed
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-secondary/40 border-border/50"
                )}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground">
                      {weekly.title}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-purple-500">
                      +{weekly.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {weekly.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (weekly.current / weekly.target) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {weekly.current} / {weekly.target}
                    </span>
                  </div>
                </div>

                {weekly.claimed ? (
                  <span className="text-xs font-bold text-muted-foreground">Claimed</span>
                ) : weekly.completed ? (
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={() => claimChallenge(weekly.id)}
                    className="h-8 px-3 text-xs gap-1 bg-purple-600 hover:bg-purple-500"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Claim</span>
                  </Button>
                ) : (
                  <span className="text-xs font-mono text-muted-foreground px-2">
                    In Progress
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
