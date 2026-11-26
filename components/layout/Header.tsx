"use client";

import React from "react";
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
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Counters Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-sm tracking-tighter">
              CL
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold tracking-tight text-base leading-none">
                COUNTLENS
              </span>
              <span className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold mt-0.5">
                Tactile Studio
              </span>
            </div>
          </div>

          {/* Live Global Counters Stats Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 text-[11px] font-mono border border-border/50 text-muted-foreground">
            <span className="font-bold text-foreground">{totalCount}</span>
            <span>counters</span>
            <span className="opacity-40">&bull;</span>
            <span className="font-bold text-foreground">{totalSum}</span>
            <span>sum</span>
          </div>

          {/* Gamification Level & Streak Badges */}
          {!focusMode && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <LevelBadge />
              <StreakFlame />
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="counter-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search counters by name, value or color... (Press /)"
            className="pl-9 pr-12 h-9 rounded-xl bg-secondary/40 border-border/50 text-xs focus-visible:bg-background transition-colors"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted border border-border/50 pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {/* Right Navigation & Action CTAs */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Focus Mode Indicator */}
          {focusMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFocusMode}
              className="h-8 px-2.5 rounded-xl text-xs text-amber-500 border-amber-500/40 gap-1.5 hover:bg-amber-500/10 cursor-pointer"
              title="Focus Mode active. Click to restore full gamification UI."
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-semibold">Exit Focus</span>
            </Button>
          ) : (
            <>
              {/* Daily Quests / Challenges Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChallengesOpen(true)}
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                title="Daily Quests & Streak"
              >
                <Target className="w-4 h-4 text-emerald-500" />
                {hasClaimable && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
              </Button>

              {/* Achievements Gallery Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAchievementsOpen(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                title="Achievements & Badges Gallery"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
              </Button>

              {/* Personal Analytics & Heatmap Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAnalyticsOpen(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                title="Personal Analytics Hub"
              >
                <BarChart3 className="w-4 h-4 text-cyan-500" />
              </Button>
            </>
          )}

          {/* Filter Pills */}
          <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-secondary/60 border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setFilterBy("all")}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterBy === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterBy("pinned")}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                filterBy === "pinned"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bookmark className="w-3 h-3 text-indigo-500" />
              <span className="hidden md:inline">Pinned</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-muted-foreground hover:text-foreground"
                title="Sort counters"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
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

          {/* Shortcuts Guide Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShortcutsOpen(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-muted-foreground hover:text-foreground hidden md:inline-flex"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* Preferences & Storage Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-muted-foreground hover:text-foreground"
            title="Settings & Data Backup"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>

          {/* Light / Dark Theme Switcher */}
          <ThemeToggle />

          {/* + New Counter CTA Button */}
          <Button
            variant="glow"
            size="sm"
            onClick={openCreate}
            className="h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl gap-1.5 font-semibold text-xs ml-0.5 sm:ml-1 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Counter</span>
            <kbd className="hidden lg:inline text-[9px] font-mono px-1 py-0.2 rounded bg-white/20">
              N
            </kbd>
          </Button>
        </div>
      </div>
    </header>
  );
}
