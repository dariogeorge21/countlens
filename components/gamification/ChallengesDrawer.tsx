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
import { Flame, Shield, Check, Clock } from "lucide-react";
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
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border/80 shadow-2xl p-6 font-mono">
        <DialogHeader className="pb-2 border-b border-border/60">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              CADENCE &amp; RITUALS
            </span>
            <DialogTitle className="text-base font-bold tracking-tight text-foreground">
              Daily Objectives
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Streak Cadence Card */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Flame className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  ACTIVE STREAK
                </div>
                <div className="text-lg font-black tabular-nums text-foreground">
                  {progression.streak} {progression.streak === 1 ? "DAY" : "DAYS"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Record: {progression.bestStreak} days
                </div>
              </div>
            </div>

            {progression.streakFreezeAvailable ? (
              <Button
                variant="outline"
                size="sm"
                onClick={useStreakFreeze}
                className="h-8 text-xs gap-1.5 border-border/80 bg-background/60 hover:bg-background cursor-pointer"
                title="Arm Streak Freeze to protect tomorrow if you miss a count"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-500" />
                <span>Arm Freeze</span>
              </Button>
            ) : (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 rounded bg-secondary/60 border border-border/40">
                Freeze Armed
              </span>
            )}
          </div>

          {/* Daily Objectives List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              <span>TODAY&apos;S RITUALS</span>
              <span className="flex items-center gap-1 font-normal lowercase tracking-normal">
                <Clock className="w-3 h-3" /> resets midnight
              </span>
            </div>

            {dailies.map((quest) => (
              <div
                key={quest.id}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3",
                  quest.claimed
                    ? "bg-secondary/10 border-border/40 opacity-50"
                    : quest.completed
                    ? "bg-secondary/40 border-foreground/30 shadow-2xs"
                    : "bg-secondary/20 border-border/60"
                )}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {quest.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                      +{quest.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-muted-foreground leading-normal">
                    {quest.description}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="w-24 h-1 rounded-full bg-secondary overflow-hidden border border-border/30">
                      <div
                        className="h-full bg-foreground rounded-full"
                        style={{
                          width: `${Math.min(100, (quest.current / quest.target) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {quest.current} / {quest.target}
                    </span>
                  </div>
                </div>

                {quest.claimed ? (
                  <span className="text-[11px] text-muted-foreground px-2 py-1">
                    Claimed
                  </span>
                ) : quest.completed ? (
                  <Button
                    size="sm"
                    onClick={() => claimChallenge(quest.id)}
                    className="h-7 px-2.5 text-xs gap-1 bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Claim</span>
                  </Button>
                ) : (
                  <span className="text-[10px] text-muted-foreground/70 px-1">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Weekly Expedition */}
          {weekly && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                WEEKLY HORIZON
              </span>
              <div
                className={cn(
                  "p-3 rounded-xl border flex items-center justify-between gap-3",
                  weekly.claimed
                    ? "bg-secondary/10 border-border/40 opacity-50"
                    : weekly.completed
                    ? "bg-secondary/40 border-foreground/30 shadow-2xs"
                    : "bg-secondary/20 border-border/60"
                )}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {weekly.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                      +{weekly.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-muted-foreground">
                    {weekly.description}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="w-28 h-1 rounded-full bg-secondary overflow-hidden border border-border/30">
                      <div
                        className="h-full bg-foreground rounded-full"
                        style={{
                          width: `${Math.min(100, (weekly.current / weekly.target) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {weekly.current} / {weekly.target}
                    </span>
                  </div>
                </div>

                {weekly.claimed ? (
                  <span className="text-[11px] text-muted-foreground">Claimed</span>
                ) : weekly.completed ? (
                  <Button
                    size="sm"
                    onClick={() => claimChallenge(weekly.id)}
                    className="h-7 px-2.5 text-xs gap-1 bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Claim</span>
                  </Button>
                ) : (
                  <span className="text-[10px] text-muted-foreground/70 px-1">
                    Active
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
