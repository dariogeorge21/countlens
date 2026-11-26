"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGamificationStore } from "@/store/gamification.store";
import { useCountersStore } from "@/store/counters.store";
import { ActivityHeatmap } from "./ActivityHeatmap";

export function AnalyticsDialog() {
  const isAnalyticsOpen = useGamificationStore((s) => s.isAnalyticsOpen);
  const setAnalyticsOpen = useGamificationStore((s) => s.setAnalyticsOpen);
  const progression = useGamificationStore((s) => s.progression);
  const activityLogs = useGamificationStore((s) => s.activityLogs);
  const counters = useCountersStore((s) => s.counters);

  const totalLifetime = progression.lifetimeCounts;
  const todayCounts = progression.todayCounts;
  const bestStreak = progression.bestStreak;

  // Compute 7-day total and daily average
  const last7DaysLogs = activityLogs.slice(0, 7);
  const weekTotal = last7DaysLogs.reduce((sum, l) => sum + l.count, 0);
  const dailyAverage = Math.round((weekTotal / Math.max(1, last7DaysLogs.length)) * 10) / 10;

  // Counter distribution
  const sortedByActivity = [...counters].sort((a, b) => b.value - a.value);
  const totalValueSum = counters.reduce((sum, c) => sum + c.value, 0);

  return (
    <Dialog open={isAnalyticsOpen} onOpenChange={setAnalyticsOpen}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border/80 shadow-2xl p-6 font-mono">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              TELEMETRY ARCHIVE
            </span>
            <DialogTitle className="text-base font-bold tracking-tight text-foreground">
              Cadence &amp; Activity
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-xl bg-secondary/25 border border-border/60 text-center">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                LIFETIME
              </div>
              <div className="text-xl font-black tabular-nums text-foreground mt-1">
                {totalLifetime.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/25 border border-border/60 text-center">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                TODAY
              </div>
              <div className="text-xl font-black tabular-nums text-foreground mt-1">
                {todayCounts.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/25 border border-border/60 text-center">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                BEST STREAK
              </div>
              <div className="text-xl font-black tabular-nums text-foreground mt-1">
                {bestStreak}d
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/25 border border-border/60 text-center">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                7D AVG
              </div>
              <div className="text-xl font-black tabular-nums text-foreground mt-1">
                {dailyAverage}
              </div>
            </div>
          </div>

          {/* Activity Dot Matrix */}
          <ActivityHeatmap logs={activityLogs} days={28} />

          {/* Counter Distribution */}
          {sortedByActivity.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                COUNTER CONTRIBUTION
              </span>
              <div className="space-y-1.5">
                {sortedByActivity.slice(0, 5).map((c) => {
                  const percentage = totalValueSum > 0 ? Math.round((c.value / totalValueSum) * 100) : 0;
                  return (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-secondary/20 border border-border/50 flex flex-col gap-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="font-semibold text-foreground truncate max-w-[200px]">
                            {c.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono tabular-nums text-muted-foreground">
                          <span className="text-foreground font-bold">{c.value.toLocaleString()}</span>
                          <span className="text-[10px] opacity-70">({percentage}%)</span>
                        </div>
                      </div>

                      {/* Hairline representation bar */}
                      <div className="w-full h-1 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: c.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
