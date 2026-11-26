"use client";

import React from "react";
import { Bookmark, SearchX } from "lucide-react";
import { CounterCard } from "@/components/counter/CounterCard";
import { EmptyState } from "./EmptyState";
import { useCounters } from "@/hooks/useCounters";
import { useUIStore } from "@/store/ui.store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion, AnimatePresence } from "motion/react";

export function CounterGrid() {
  const { counters, pinnedCounters, unpinnedCounters, isHydrated, totalCount } = useCounters();
  const filterBy = useUIStore((s) => s.filterBy);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const reducedMotion = useReducedMotion();

  if (!isHydrated) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-80 rounded-3xl bg-secondary/30 border border-border/40 animate-pulse p-6 flex flex-col justify-between"
          >
            <div className="h-6 w-1/2 bg-muted/60 rounded-md" />
            <div className="h-16 w-3/4 mx-auto bg-muted/60 rounded-2xl" />
            <div className="h-12 w-full bg-muted/60 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  // If entirely empty (no counters exist at all)
  if (totalCount === 0) {
    return <EmptyState />;
  }

  // If counters exist but filter/search matched zero results
  if (counters.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary text-muted-foreground mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No matching counters</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {searchQuery
            ? `No counters found matching "${searchQuery}"`
            : "No counters in this filter category"}
        </p>
      </div>
    );
  }

  const showPinnedSeparately = filterBy === "all" && pinnedCounters.length > 0;

  return (
    <div className="space-y-10 py-6">
      {/* Pinned Counters Section */}
      {showPinnedSeparately && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-indigo-500 fill-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pinned Counters ({pinnedCounters.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {pinnedCounters.map((counter) => (
                <motion.div
                  key={counter.id}
                  layout={!reducedMotion}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <CounterCard counter={counter} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Main / Unpinned Grid Section */}
      <section className="space-y-4">
        {showPinnedSeparately && unpinnedCounters.length > 0 && (
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            All Counters ({unpinnedCounters.length})
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {(showPinnedSeparately ? unpinnedCounters : counters).map((counter) => (
              <motion.div
                key={counter.id}
                layout={!reducedMotion}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <CounterCard counter={counter} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
