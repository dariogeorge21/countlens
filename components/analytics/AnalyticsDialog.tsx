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
import { BarChart3 } from "lucide-react";

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

  return (
    <Dialog open={isAnalyticsOpen} onOpenChange={setAnalyticsOpen}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <DialogTitle className="text-lg font-bold">
              Personal Counting Insights
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
              <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Lifetime Counts
              </div>
              <div className="text-2xl font-extrabold font-mono text-indigo-500 mt-0.5">
                {totalLifetime}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
              <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Today&apos;s Pulse
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-500 mt-0.5">
                {todayCounts}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
              <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Best Streak
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-500 mt-0.5">
                {bestStreak}d
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
              <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                Daily Avg
              </div>
              <div className="text-2xl font-extrabold font-mono text-purple-500 mt-0.5">
                {dailyAverage}
              </div>
            </div>
          </div>

          {/* 30-Day Activity Heatmap */}
          <ActivityHeatmap logs={activityLogs} days={28} />

          {/* Counter Distribution */}
          {sortedByActivity.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Counter Distribution
              </span>
              <div className="space-y-2">
                {sortedByActivity.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-secondary/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {c.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-foreground">
                      {c.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
