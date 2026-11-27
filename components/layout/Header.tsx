"use client";

import React from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  HelpCircle,
  X,
  Bookmark,
  Trophy,
  Target,
  BarChart3,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { StreakFlame } from "@/components/gamification/StreakFlame";
import { useUIStore } from "@/store/ui.store";
import { useCounters } from "@/hooks/useCounters";
import { useGamificationStore } from "@/store/gamification.store";
import { SortOption } from "@/types/counter";

export function Header() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const sortBy = useUIStore((s) => s.sortBy);
  const setSortBy = useUIStore((s) => s.setSortBy);
  const filterBy = useUIStore((s) => s.filterBy);
  const setFilterBy = useUIStore((s) => s.setFilterBy);
  const openCreate = useUIStore((s) => s.openCreate);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);

  const { totalCount, totalSum } = useCounters();

  const focusMode = useGamificationStore((s) => s.progression.focusMode);
  const toggleFocusMode = useGamificationStore((s) => s.toggleFocusMode);
  const setChallengesOpen = useGamificationStore((s) => s.setChallengesOpen);
  const setAchievementsOpen = useGamificationStore((s) => s.setAchievementsOpen);
  const setAnalyticsOpen = useGamificationStore((s) => s.setAnalyticsOpen);

  const dailyChallenges = useGamificationStore((s) => s.progression.dailyChallenges);
  const weeklyChallenge = useGamificationStore((s) => s.progression.weeklyChallenge);
  const hasClaimable =
    dailyChallenges.some((c) => c.completed && !c.claimed) ||
    Boolean(weeklyChallenge?.completed && !weeklyChallenge.claimed);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Identity & Telemetry Cluster */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Image
              src="/countlens-logo.svg"
              alt="COUNTLENS logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg shadow-xs flex-shrink-0"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold tracking-tight text-sm leading-none text-foreground font-mono">
                COUNTLENS
              </span>
              <span className="text-[9px] tracking-widest uppercase text-muted-foreground font-mono font-medium mt-0.5">
                Tactile Studio
              </span>
            </div>
          </div>

          {/* Hairline Divider */}
          <span className="hidden md:inline-block h-4 w-[1px] bg-border/80" />

          {/* Telemetry Capsule (Level & Streak) */}
          {!focusMode && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <LevelBadge />
              <StreakFlame />
            </div>
          )}

          {/* Quick Stats Pill */}
          <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/50 text-[11px] font-mono text-muted-foreground border border-border/50">
            <span className="font-semibold text-foreground tabular-nums">{totalCount}</span>
            <span>counters</span>
            <span className="opacity-30">&bull;</span>
            <span className="font-semibold text-foreground tabular-nums">{totalSum}</span>
            <span>total</span>
          </div>
        </div>

        {/* Minimalist Search Bar */}
        <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md relative hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="counter-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search counters... (Press /)"
            className="pl-8 pr-10 h-8 rounded-lg bg-secondary/30 border-border/60 text-xs focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-foreground/20 transition-all font-mono"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1 py-0.2 rounded text-[9px] font-mono text-muted-foreground bg-secondary/80 border border-border/50 pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {/* Right Navigation & Action CTAs */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Focus Mode Indicator */}
          {focusMode ? (
            <button
              type="button"
              onClick={toggleFocusMode}
              className="h-8 px-2.5 rounded-lg text-xs font-mono font-medium text-amber-600 dark:text-amber-400 border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Focus Mode active. Click to restore full gamification UI."
            >
              <EyeOff className="w-3.5 h-3.5 stroke-[2]" />
              <span className="hidden md:inline">Exit Focus</span>
            </button>
          ) : (
            /* Cohesive Monochromatic Companion Launcher Group */
            <div className="flex items-center p-0.5 rounded-lg bg-secondary/40 border border-border/60">
              {/* Daily Rituals / Quests */}
              <button
                type="button"
                onClick={() => setChallengesOpen(true)}
                className="relative h-7 w-7 sm:w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all cursor-pointer"
                title="Daily Rituals & Objectives"
              >
                <Target className="w-3.5 h-3.5 stroke-[2]" />
                {hasClaimable && (
                  <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                )}
              </button>

              {/* Achievements / Badges Gallery */}
              <button
                type="button"
                onClick={() => setAchievementsOpen(true)}
                className="h-7 w-7 sm:w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all cursor-pointer"
                title="Badges & Milestones Catalog"
              >
                <Trophy className="w-3.5 h-3.5 stroke-[2]" />
              </button>

              {/* Personal Telemetry / Heatmap */}
              <button
                type="button"
                onClick={() => setAnalyticsOpen(true)}
                className="h-7 w-7 sm:w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all cursor-pointer"
                title="Personal Telemetry & Heatmap"
              >
                <BarChart3 className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-secondary/40 border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setFilterBy("all")}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                filterBy === "all"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterBy("pinned")}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                filterBy === "pinned"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bookmark className="w-3 h-3 text-indigo-500 fill-indigo-500/20" />
              <span className="hidden md:inline">Pinned</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground border border-border/60 bg-secondary/20 hover:bg-secondary/60"
                title="Sort counters"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 font-mono text-xs">
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <DropdownMenuRadioItem value="manual">Manual Order</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name">Name (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="value">Highest Value</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="updated">Recently Updated</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="created">Recently Created</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Keyboard Shortcuts Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShortcutsOpen(true)}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground border border-border/60 bg-secondary/20 hover:bg-secondary/60 hidden md:inline-flex"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </Button>

          {/* Settings & Storage */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground border border-border/60 bg-secondary/20 hover:bg-secondary/60"
            title="Settings & Preferences"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* New Counter Button */}
          <Button
            size="sm"
            onClick={openCreate}
            className="h-8 px-3 rounded-lg gap-1.5 font-semibold text-xs ml-0.5 shadow-sm bg-foreground text-background hover:bg-foreground/90 cursor-pointer font-mono"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New</span>
            <kbd className="hidden lg:inline text-[9px] font-mono px-1 rounded bg-background/20 text-background">
              N
            </kbd>
          </Button>
        </div>
      </div>
    </header>
  );
}
