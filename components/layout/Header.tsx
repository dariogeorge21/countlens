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
import { useUIStore } from "@/store/ui.store";
import { useCounters } from "@/hooks/useCounters";
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Counters Badge */}
        <div className="flex items-center gap-3 flex-shrink-0">
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
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 text-[11px] font-mono border border-border/50 text-muted-foreground">
            <span className="font-bold text-foreground">{totalCount}</span>
            <span>counters</span>
            <span className="opacity-40">&bull;</span>
            <span className="font-bold text-foreground">{totalSum}</span>
            <span>sum</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative hidden sm:block">
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Filter Pills */}
          <div className="flex items-center p-0.5 rounded-xl bg-secondary/60 border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setFilterBy("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                filterBy === "pinned"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bookmark className="w-3 h-3 text-indigo-500" />
              <span className="hidden sm:inline">Pinned</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground"
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
            className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* Preferences & Storage Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground"
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
            className="h-9 px-3 sm:px-4 rounded-xl gap-1.5 font-semibold text-xs ml-1 shadow-md"
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
