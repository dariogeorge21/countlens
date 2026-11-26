"use client";

import React from "react";
import { History, Undo2 } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Counter } from "@/types/counter";

interface CounterHistoryProps {
  counter: Counter;
  onUndo: () => void;
}

export function CounterHistory({ counter, onUndo }: CounterHistoryProps) {
  const hasHistory = counter.history.length > 0;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-lg text-muted-foreground hover:text-foreground"
          title="View recent history & undo"
          aria-label="Counter history"
        >
          <History className="w-3.5 h-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-primary" />
            <span className="font-semibold text-xs uppercase tracking-wider">
              Recent History
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onUndo}
            disabled={!hasHistory}
            className="h-7 px-2 text-xs gap-1"
          >
            <Undo2 className="w-3 h-3" />
            <span>Undo</span>
          </Button>
        </div>

        {hasHistory ? (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {counter.history.slice(0, 15).map((entry, idx) => (
              <div
                key={`${entry.t}-${idx}`}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-secondary/40"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      entry.delta > 0
                        ? "font-mono font-bold text-emerald-600 dark:text-emerald-400"
                        : "font-mono font-bold text-rose-600 dark:text-rose-400"
                    }
                  >
                    {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    &rarr; {entry.value}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatTime(entry.t)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No recent changes yet.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
