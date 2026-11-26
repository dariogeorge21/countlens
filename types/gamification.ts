export type BadgeCategory =
  | "starter"
  | "consistency"
  | "milestone"
  | "exploration"
  | "mastery";

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";

export type Badge = {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  tier: BadgeTier;
  xpReward: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: number;
  currentProgress: number;
};

export type ChallengeType =
  | "count_today"
  | "rapid_combo"
  | "multi_counter"
  | "reach_milestone";

export type Challenge = {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  type: ChallengeType;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: number;
  period: "daily" | "weekly";
};

export type SoundTheme = "mechanical" | "chime" | "arcade" | "minimal";

export type UserProgression = {
  xp: number;
  level: number;
  levelTitle: string;
  currentLevelXp: number;
  nextLevelXp: number;
  percentToNext: number;
  lifetimeCounts: number;
  todayCounts: number;
  lastActiveDate: string; // YYYY-MM-DD
  streak: number;
  bestStreak: number;
  streakFreezeAvailable: boolean;
  streakFreezeUsedThisMonth: boolean;
  unlockedBadgeIds: string[];
  badgeUnlockTimestamps: Record<string, number>;
  dailyChallenges: Challenge[];
  weeklyChallenge: Challenge | null;
  soundTheme: SoundTheme;
  focusMode: boolean; // Disables gamification HUD for minimalist mode
  hapticsIntensity: "off" | "subtle" | "strong";
};

export type ComboState = {
  count: number;
  multiplier: number;
  lastTapTimestamp: number;
  isActive: boolean;
};

export type DailyActivityLog = {
  date: string; // YYYY-MM-DD
  count: number;
  countersActive: Record<string, number>;
  peakHour: number;
};

export type MilestoneTier = "minor" | "medium" | "epic";

export type MilestoneHit = {
  counterId: string;
  counterName: string;
  milestone: number;
  tier: MilestoneTier;
  timestamp: number;
};
