"use client";

import React from "react";
import { DailyActivityLog } from "@/types/gamification";
import { getTodayDateString } from "@/lib/gamification/engine";

interface ActivityHeatmapProps {
  logs: DailyActivityLog[];
  days?: number;
}

export function ActivityHeatmap({ logs, days = 28 }: ActivityHeatmapProps) {
  const logMap = new Map(logs.map((l) => [l.date, l.count]));

  // Generate the last `days` calendar dates
  const dates: { dateStr: string; label: string; count: number }[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = getTodayDateString(d);
    const count = logMap.get(dateStr) ?? 0;
    dates.push({
      dateStr,
      label: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      count,
    });
  }

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-secondary/60";
    if (count < 5) return "bg-indigo-500/30";
    if (count < 15) return "bg-indigo-500/60";
    if (count < 30) return "bg-indigo-500/85";
    return "bg-indigo-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Activity (Last 4 Weeks)</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-secondary/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500/30" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 p-3 rounded-2xl bg-secondary/30 border border-border/40">
        {dates.map((d) => (
          <div
            key={d.dateStr}
            className={`h-7 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono transition-transform hover:scale-110 cursor-pointer ${getColorClass(
              d.count
            )}`}
            title={`${d.label}: ${d.count} counts`}
          >
            <span
              className={
                d.count > 0 ? "font-bold text-white drop-shadow-xs" : "text-muted-foreground opacity-60"
              }
            >
              {d.count > 0 ? d.count : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
