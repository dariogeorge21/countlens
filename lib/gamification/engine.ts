import {
  UserProgression,
  ComboState,
  MilestoneHit,
  MilestoneTier,
  Badge,
} from "@/types/gamification";
import { BADGES_CATALOG } from "./badges-catalog";
import { Counter } from "@/types/counter";

export const LEVEL_TITLES = [
  "Novice Counter",      // Lvl 1
  "Kinetic Apprentice",  // Lvl 2
  "Tally Enthusiast",    // Lvl 3
  "Rhythm Crafter",      // Lvl 4
  "Milestone Seeker",    // Lvl 5
  "Steady Striker",      // Lvl 6
  "Focus Dynamo",        // Lvl 7
  "Momentum Master",     // Lvl 8
  "Kinetic Virtuoso",    // Lvl 9
  "Grandmaster of Counts",// Lvl 10+
];

/**
 * Calculates cumulative XP required to reach a specific level
 */
export function getRequiredXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(80 * Math.pow(level - 1, 1.65));
}

export function calculateLevel(xp: number): {
  level: number;
  levelTitle: string;
  currentLevelXp: number;
  nextLevelXp: number;
  percentToNext: number;
} {
  let level = 1;
  while (xp >= getRequiredXpForLevel(level + 1)) {
    level++;
  }

  const baseLevelXp = getRequiredXpForLevel(level);
  const nextTargetXp = getRequiredXpForLevel(level + 1);
  const xpIntoCurrentLevel = xp - baseLevelXp;
  const xpSpanForLevel = Math.max(1, nextTargetXp - baseLevelXp);
  const percentToNext = Math.min(100, Math.floor((xpIntoCurrentLevel / xpSpanForLevel) * 100));

  const titleIndex = Math.min(level - 1, LEVEL_TITLES.length - 1);
  const levelTitle = LEVEL_TITLES[titleIndex] ?? "Grandmaster of Counts";

  return {
    level,
    levelTitle,
    currentLevelXp: xpIntoCurrentLevel,
    nextLevelXp: xpSpanForLevel,
    percentToNext,
  };
}

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Evaluates streak status based on local calendar dates
 */
export function evaluateStreak(
  lastActiveDate: string,
  todayDate: string,
  currentStreak: number,
  bestStreak: number,
  freezeAvailable: boolean
): {
  newStreak: number;
  newBestStreak: number;
  streakFrozen: boolean;
  streakReset: boolean;
} {
  if (!lastActiveDate) {
    return {
      newStreak: 1,
      newBestStreak: Math.max(1, bestStreak),
      streakFrozen: false,
      streakReset: false,
    };
  }

  if (lastActiveDate === todayDate) {
    return {
      newStreak: currentStreak,
      newBestStreak: Math.max(currentStreak, bestStreak),
      streakFrozen: false,
      streakReset: false,
    };
  }

  const last = new Date(`${lastActiveDate}T00:00:00`);
  const today = new Date(`${todayDate}T00:00:00`);
  const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day count
    const updated = currentStreak + 1;
    return {
      newStreak: updated,
      newBestStreak: Math.max(updated, bestStreak),
      streakFrozen: false,
      streakReset: false,
    };
  }

  if (diffDays === 2 && freezeAvailable) {
    // Saved by Streak Freeze!
    const updated = currentStreak + 1;
    return {
      newStreak: updated,
      newBestStreak: Math.max(updated, bestStreak),
      streakFrozen: true,
      streakReset: false,
    };
  }

  // Missed more than 1 day without freeze: restart streak respectfully
  return {
    newStreak: 1,
    newBestStreak: bestStreak,
    streakFrozen: false,
    streakReset: true,
  };
}

export const COMBO_DECAY_MS = 1800; // 1.8 seconds decay window

export function evaluateCombo(
  lastTapTimestamp: number,
  nowTimestamp: number,
  currentCount: number
): ComboState {
  const elapsed = nowTimestamp - lastTapTimestamp;

  if (elapsed > COMBO_DECAY_MS || lastTapTimestamp === 0) {
    // Combo reset / fresh start
    return {
      count: 1,
      multiplier: 1,
      lastTapTimestamp: nowTimestamp,
      isActive: false,
    };
  }

  const nextCount = currentCount + 1;
  let multiplier = 1;
  if (nextCount >= 20) multiplier = 10;
  else if (nextCount >= 10) multiplier = 5;
  else if (nextCount >= 6) multiplier = 3;
  else if (nextCount >= 3) multiplier = 2;

  return {
    count: nextCount,
    multiplier,
    lastTapTimestamp: nowTimestamp,
    isActive: nextCount >= 3,
  };
}

export function calculateCountXP(multiplier: number): number {
  const baseXP = 5;
  return baseXP * multiplier;
}

export const MILESTONES: { threshold: number; tier: MilestoneTier }[] = [
  { threshold: 25, tier: "minor" },
  { threshold: 50, tier: "minor" },
  { threshold: 100, tier: "medium" },
  { threshold: 250, tier: "medium" },
  { threshold: 500, tier: "medium" },
  { threshold: 1000, tier: "epic" },
  { threshold: 2500, tier: "epic" },
  { threshold: 5000, tier: "epic" },
  { threshold: 10000, tier: "epic" },
];

export function checkMilestoneCrossing(
  prevVal: number,
  nextVal: number,
  counterId: string,
  counterName: string
): MilestoneHit | null {
  for (const m of MILESTONES) {
    if (prevVal < m.threshold && nextVal >= m.threshold) {
      return {
        counterId,
        counterName,
        milestone: m.threshold,
        tier: m.tier,
        timestamp: Date.now(),
      };
    }
  }
  return null;
}

export function evaluateBadges(
  progression: UserProgression,
  counters: Counter[],
  context?: {
    usedGestures?: Set<string>;
    hourOfDay?: number;
    wrappedCount?: number;
    highestCombo?: number;
  }
): {
  allBadges: Badge[];
  newlyUnlocked: Badge[];
  earnedXp: number;
} {
  const unlockedIds = new Set(progression.unlockedBadgeIds);
  const newlyUnlocked: Badge[] = [];
  let earnedXp = 0;

  const distinctColors = new Set(counters.map((c) => c.color)).size;
  const hasDecimals = counters.some((c) => c.step < 1 || !Number.isInteger(c.value));
  const hasBoundedLimits = counters.some((c) => c.min !== null && c.max !== null);

  const allBadges: Badge[] = BADGES_CATALOG.map((item) => {
    let progress = 0;
    const isAlreadyUnlocked = unlockedIds.has(item.id);

    switch (item.id) {
      case "first_count":
        progress = Math.min(1, progression.lifetimeCounts);
        break;
      case "first_10":
        progress = Math.min(10, progression.lifetimeCounts);
        break;
      case "first_counter":
        progress = Math.min(1, counters.length);
        break;
      case "palette_pioneer":
        progress = Math.min(3, distinctColors);
        break;
      case "streak_3":
        progress = Math.min(3, progression.streak);
        break;
      case "streak_7":
        progress = Math.min(7, progression.streak);
        break;
      case "streak_14":
        progress = Math.min(14, progression.streak);
        break;
      case "streak_30":
        progress = Math.min(30, progression.streak);
        break;
      case "streak_100":
        progress = Math.min(100, progression.streak);
        break;
      case "counts_100":
        progress = Math.min(100, progression.lifetimeCounts);
        break;
      case "counts_500":
        progress = Math.min(500, progression.lifetimeCounts);
        break;
      case "counts_1000":
        progress = Math.min(1000, progression.lifetimeCounts);
        break;
      case "counts_5000":
        progress = Math.min(5000, progression.lifetimeCounts);
        break;
      case "counts_10000":
        progress = Math.min(10000, progression.lifetimeCounts);
        break;
      case "gesture_explorer":
        progress = context?.usedGestures ? Math.min(4, context.usedGestures.size) : isAlreadyUnlocked ? 4 : 1;
        break;
      case "precision_crafter":
        progress = hasDecimals ? 1 : 0;
        break;
      case "limit_master":
        progress = hasBoundedLimits ? 1 : 0;
        break;
      case "wrap_cycler":
        progress = Math.min(5, context?.wrappedCount ?? (isAlreadyUnlocked ? 5 : 0));
        break;
      case "night_owl":
        progress = context?.hourOfDay !== undefined && context.hourOfDay >= 0 && context.hourOfDay < 4 ? 1 : isAlreadyUnlocked ? 1 : 0;
        break;
      case "combo_5":
        progress = Math.min(5, context?.highestCombo ?? (isAlreadyUnlocked ? 5 : 0));
        break;
      case "combo_10":
        progress = Math.min(10, context?.highestCombo ?? (isAlreadyUnlocked ? 10 : 0));
        break;
      case "daily_sprint":
        progress = Math.min(100, progression.todayCounts);
        break;
      case "multi_orchestrator":
        progress = Math.min(5, counters.length);
        break;
      case "grand_perfection":
        progress = Math.min(15, unlockedIds.size);
        break;
      default:
        progress = isAlreadyUnlocked ? item.maxProgress : 0;
    }

    const shouldUnlock = !isAlreadyUnlocked && progress >= item.maxProgress;
    const badge: Badge = {
      ...item,
      currentProgress: progress,
      unlocked: isAlreadyUnlocked || shouldUnlock,
      unlockedAt: isAlreadyUnlocked
        ? progression.badgeUnlockTimestamps[item.id]
        : shouldUnlock
        ? Date.now()
        : undefined,
    };

    if (shouldUnlock) {
      newlyUnlocked.push(badge);
      earnedXp += item.xpReward;
    }

    return badge;
  });

  return {
    allBadges,
    newlyUnlocked,
    earnedXp,
  };
}
