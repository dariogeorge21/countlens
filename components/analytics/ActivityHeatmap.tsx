"use client";

import React from "react";
import { DailyActivityLog } from "@/types/gamification";
import { getTodayDateString } from "@/lib/gamification/engine";

interface ActivityHeatmapProps {
  logs: DailyActivityLog[];
  days?: number;
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function ActivityHeatmap({ logs, days = 28 }: ActivityHeatmapProps) {
  const logMap = new Map(logs.map((l) => [l.date, l.count]));

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

  const getCellTone = (count: number) => {
    if (count === 0) return "bg-secondary/40 border-border/40";
    if (count < 5) return "bg-foreground/20 border-foreground/30 text-foreground/70";
    if (count < 15) return "bg-foreground/45 border-foreground/50 text-background";
    if (count < 30) return "bg-foreground/75 border-foreground/80 text-background";
    return "bg-foreground border-foreground text-background";
  };

  return (
    <div className="space-y-2 font-mono">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
        <span>ACTIVITY CADENCE (LAST 4 WEEKS)</span>
        <div className="flex items-center gap-1.5 text-[9px] lowercase tracking-normal">
          <span>less</span>
          <div className="w-2 h-2 rounded-[2px] bg-secondary/40 border border-border/40" />
          <div className="w-2 h-2 rounded-[2px] bg-foreground/25" />
          <div className="w-2 h-2 rounded-[2px] bg-foreground/55" />
          <div className="w-2 h-2 rounded-[2px] bg-foreground" />
          <span>more</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-secondary/20 border border-border/60 space-y-1.5">
        {/* Day of Week Row Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] text-muted-foreground/60 font-semibold">
          {WEEKDAY_LABELS.map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>

        {/* 28-Cell Matrix */}
        <div className="grid grid-cols-7 gap-1.5">
          {dates.map((d) => (
            <div
              key={d.dateStr}
              className={`aspect-square rounded-[3px] border flex items-center justify-center text-[9px] font-mono transition-all duration-100 hover:scale-115 hover:z-10 cursor-pointer shadow-2xs select-none ${getCellTone(
                d.count
              )}`}
              title={`${d.label}: ${d.count} counts`}
            >
              {d.count > 0 ? (
                <span className="font-bold tabular-nums leading-none">
                  {d.count}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
