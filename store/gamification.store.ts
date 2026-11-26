"use client";

import { create } from "zustand";
import {
  UserProgression,
  ComboState,
  MilestoneHit,
  DailyActivityLog,
  SoundTheme,
} from "@/types/gamification";
import { Counter } from "@/types/counter";
import { repository } from "@/lib/storage/db";
import {
  calculateLevel,
  getTodayDateString,
  evaluateStreak,
  evaluateCombo,
  calculateCountXP,
  checkMilestoneCrossing,
  evaluateBadges,
} from "@/lib/gamification/engine";
import {
  generateDailyChallenges,
  generateWeeklyChallenge,
} from "@/lib/gamification/challenges-gen";
import { soundSynthesizer } from "@/lib/gamification/sound-synthesizer";
import { toast } from "sonner";

const DEFAULT_PROGRESSION: UserProgression = {
  xp: 0,
  level: 1,
  levelTitle: "Novice Counter",
  currentLevelXp: 0,
  nextLevelXp: 80,
  percentToNext: 0,
  lifetimeCounts: 0,
  todayCounts: 0,
  lastActiveDate: "",
  streak: 0,
  bestStreak: 0,
  streakFreezeAvailable: true,
  streakFreezeUsedThisMonth: false,
  unlockedBadgeIds: [],
  badgeUnlockTimestamps: {},
  dailyChallenges: [],
  weeklyChallenge: null,
  soundTheme: "chime",
  focusMode: false,
  hapticsIntensity: "subtle",
};

interface GamificationState {
  progression: UserProgression;
  combo: ComboState;
  activeMilestoneHit: MilestoneHit | null;
  levelUpCelebration: { level: number; title: string } | null;
  activityLogs: DailyActivityLog[];
  isAchievementsOpen: boolean;
  isChallengesOpen: boolean;
  isAnalyticsOpen: boolean;
  isShareModalOpen: boolean;
  shareTargetCounter: Counter | null;

  // Trackers for badges
  usedGestures: Set<string>;
  wrappedCount: number;
  highestCombo: number;

  // Actions
  hydrate: () => Promise<void>;
  recordCount: (
    counter: Counter,
    delta: number,
    gestureType?: string,
    allCounters?: Counter[]
  ) => void;
  recordWrap: () => void;
  claimChallenge: (challengeId: string) => void;
  setSoundTheme: (theme: SoundTheme) => void;
  toggleFocusMode: () => void;
  useStreakFreeze: () => void;
  clearMilestoneHit: () => void;
  clearLevelUp: () => void;

  setAchievementsOpen: (open: boolean) => void;
  setChallengesOpen: (open: boolean) => void;
  setAnalyticsOpen: (open: boolean) => void;
  openShareModal: (counter: Counter) => void;
  closeShareModal: () => void;
}

let comboDecayTimer: ReturnType<typeof setTimeout> | null = null;

export const useGamificationStore = create<GamificationState>((set, get) => ({
  progression: DEFAULT_PROGRESSION,
  combo: { count: 0, multiplier: 1, lastTapTimestamp: 0, isActive: false },
  activeMilestoneHit: null,
  levelUpCelebration: null,
  activityLogs: [],
  isAchievementsOpen: false,
  isChallengesOpen: false,
  isAnalyticsOpen: false,
  isShareModalOpen: false,
  shareTargetCounter: null,
  usedGestures: new Set(["tap"]),
  wrappedCount: 0,
  highestCombo: 0,

  hydrate: async () => {
    try {
      const [savedProgression, savedLogs] = await Promise.all([
        repository.getProgression(),
        repository.getActivityLogs(30),
      ]);

      const now = new Date();
      const todayStr = getTodayDateString(now);

      const currentProg = savedProgression ?? { ...DEFAULT_PROGRESSION };

      // Check daily streak boundaries
      const streakResult = evaluateStreak(
        currentProg.lastActiveDate,
        todayStr,
        currentProg.streak,
        currentProg.bestStreak,
        currentProg.streakFreezeAvailable
      );

      // Check daily challenges expiration (reset at midnight)
      const needNewDaily =
        !currentProg.dailyChallenges ||
        currentProg.dailyChallenges.length === 0 ||
        (currentProg.dailyChallenges[0] && currentProg.dailyChallenges[0].expiresAt < Date.now());

      const dailyChallenges = needNewDaily
        ? generateDailyChallenges(now)
        : currentProg.dailyChallenges;

      // Check weekly challenge expiration
      const needNewWeekly =
        !currentProg.weeklyChallenge || currentProg.weeklyChallenge.expiresAt < Date.now();

      const weeklyChallenge = needNewWeekly
        ? generateWeeklyChallenge(now)
        : currentProg.weeklyChallenge;

      const todayCounts = currentProg.lastActiveDate === todayStr ? currentProg.todayCounts : 0;

      const levelData = calculateLevel(currentProg.xp);

      const updatedProg: UserProgression = {
        ...currentProg,
        ...levelData,
        todayCounts,
        streak: streakResult.newStreak,
        bestStreak: streakResult.newBestStreak,
        streakFreezeAvailable: streakResult.streakFrozen
          ? false
          : currentProg.streakFreezeAvailable,
        dailyChallenges,
        weeklyChallenge,
      };

      set({
        progression: updatedProg,
        activityLogs: savedLogs,
      });

      await repository.saveProgression(updatedProg);
    } catch (err) {
      console.warn("[COUNTLENS Gamification] Hydration error:", err);
    }
  },

  recordCount: (counter, delta, gestureType = "button", allCounters = []) => {
    const state = get();
    const now = Date.now();
    const todayStr = getTodayDateString(new Date(now));

    // 1. Combo calculation
    const newCombo = evaluateCombo(
      state.combo.lastTapTimestamp,
      now,
      state.combo.count
    );

    const highestCombo = Math.max(state.highestCombo, newCombo.count);

    if (comboDecayTimer) clearTimeout(comboDecayTimer);
    comboDecayTimer = setTimeout(() => {
      set({
        combo: { count: 0, multiplier: 1, lastTapTimestamp: 0, isActive: false },
      });
    }, 1800);

    // 2. XP & Leveling
    const earnedCountXp = calculateCountXP(newCombo.multiplier);
    const updatedTotalXp = state.progression.xp + earnedCountXp;
    const oldLevel = state.progression.level;
    const levelData = calculateLevel(updatedTotalXp);

    let levelUpModal = state.levelUpCelebration;
    if (levelData.level > oldLevel) {
      levelUpModal = { level: levelData.level, title: levelData.levelTitle };
      soundSynthesizer.playLevelUp();
      toast.success(`Level Up! You reached Level ${levelData.level}: ${levelData.levelTitle}`, {
        duration: 4000,
      });
    }

    // 3. Streak & Daily Counts
    const streakResult = evaluateStreak(
      state.progression.lastActiveDate,
      todayStr,
      state.progression.streak,
      state.progression.bestStreak,
      state.progression.streakFreezeAvailable
    );

    const newLifetimeCounts = state.progression.lifetimeCounts + 1;
    const newTodayCounts =
      state.progression.lastActiveDate === todayStr
        ? state.progression.todayCounts + 1
        : 1;

    // 4. Gestures tracking
    const updatedGestures = new Set(state.usedGestures);
    if (gestureType) updatedGestures.add(gestureType);

    // 5. Milestone crossing check
    const prevVal = counter.value;
    const nextVal = counter.value + delta;
    const milestoneHit = checkMilestoneCrossing(prevVal, nextVal, counter.id, counter.name);

    if (milestoneHit) {
      soundSynthesizer.playMilestoneFanfare(milestoneHit.tier);
    }

    // 6. Quests progress update
    const updatedDailies = state.progression.dailyChallenges.map((c) => {
      if (c.completed) return c;
      let newCurrent = c.current;
      if (c.type === "count_today") newCurrent += 1;
      else if (c.type === "rapid_combo") newCurrent = Math.max(newCurrent, newCombo.count);
      else if (c.type === "multi_counter") newCurrent = Math.min(c.target, newCurrent + 1);

      const completed = newCurrent >= c.target;
      if (completed && !c.completed) {
        toast.info(`Quest Complete: "${c.title}"! Claim your reward in Quests.`);
      }
      return { ...c, current: newCurrent, completed };
    });

    let updatedWeekly = state.progression.weeklyChallenge;
    if (updatedWeekly && !updatedWeekly.completed) {
      const newCurr = updatedWeekly.current + 1;
      const completed = newCurr >= updatedWeekly.target;
      updatedWeekly = { ...updatedWeekly, current: newCurr, completed };
    }

    // 7. Base progression object
    const provisionalProgression: UserProgression = {
      ...state.progression,
      ...levelData,
      xp: updatedTotalXp,
      lifetimeCounts: newLifetimeCounts,
      todayCounts: newTodayCounts,
      lastActiveDate: todayStr,
      streak: streakResult.newStreak,
      bestStreak: streakResult.newBestStreak,
      dailyChallenges: updatedDailies,
      weeklyChallenge: updatedWeekly,
    };

    // 8. Badge Evaluation
    const { newlyUnlocked, earnedXp: badgeXp } = evaluateBadges(
      provisionalProgression,
      allCounters.length > 0 ? allCounters : [counter],
      {
        usedGestures: updatedGestures,
        hourOfDay: new Date(now).getHours(),
        wrappedCount: state.wrappedCount,
        highestCombo,
      }
    );

    let finalProgression = provisionalProgression;
    if (newlyUnlocked.length > 0) {
      const withBadgeXp = provisionalProgression.xp + badgeXp;
      const badgeLevelData = calculateLevel(withBadgeXp);
      const newUnlockedIds = [
        ...provisionalProgression.unlockedBadgeIds,
        ...newlyUnlocked.map((b) => b.id),
      ];
      const newTimestamps = { ...provisionalProgression.badgeUnlockTimestamps };
      newlyUnlocked.forEach((b) => {
        newTimestamps[b.id] = now;
        toast.success(`Achievement Unlocked: "${b.title}"! +${b.xpReward} XP`, {
          duration: 4000,
        });
      });

      finalProgression = {
        ...provisionalProgression,
        ...badgeLevelData,
        xp: withBadgeXp,
        unlockedBadgeIds: newUnlockedIds,
        badgeUnlockTimestamps: newTimestamps,
      };
    }

    set({
      progression: finalProgression,
      combo: newCombo,
      highestCombo,
      activeMilestoneHit: milestoneHit ?? state.activeMilestoneHit,
      levelUpCelebration: levelUpModal,
      usedGestures: updatedGestures,
    });

    // Asynchronously log to storage
    repository.saveProgression(finalProgression);
    repository.logDailyCount(todayStr, 1, counter.id);
  },

  recordWrap: () => {
    set((s) => ({ wrappedCount: s.wrappedCount + 1 }));
  },

  claimChallenge: (challengeId) => {
    const state = get();
    const challenge =
      state.progression.dailyChallenges.find((c) => c.id === challengeId) ||
      (state.progression.weeklyChallenge?.id === challengeId
        ? state.progression.weeklyChallenge
        : null);

    if (!challenge || !challenge.completed || challenge.claimed) return;

    const addedXp = challenge.xpReward;
    const newTotalXp = state.progression.xp + addedXp;
    const levelData = calculateLevel(newTotalXp);

    const updatedDailies = state.progression.dailyChallenges.map((c) =>
      c.id === challengeId ? { ...c, claimed: true } : c
    );

    const updatedWeekly =
      state.progression.weeklyChallenge?.id === challengeId
        ? { ...state.progression.weeklyChallenge, claimed: true }
        : state.progression.weeklyChallenge;

    const updatedProg: UserProgression = {
      ...state.progression,
      ...levelData,
      xp: newTotalXp,
      dailyChallenges: updatedDailies,
      weeklyChallenge: updatedWeekly,
    };

    set({ progression: updatedProg });
    repository.saveProgression(updatedProg);
    soundSynthesizer.playMilestoneFanfare("minor");
    toast.success(`Claimed +${addedXp} XP!`);
  },

  setSoundTheme: (theme) => {
    const updated = { ...get().progression, soundTheme: theme };
    set({ progression: updated });
    repository.saveProgression(updated);
  },

  toggleFocusMode: () => {
    const updated = { ...get().progression, focusMode: !get().progression.focusMode };
    set({ progression: updated });
    repository.saveProgression(updated);
  },

  useStreakFreeze: () => {
    const state = get();
    if (!state.progression.streakFreezeAvailable) return;
    const updated: UserProgression = {
      ...state.progression,
      streakFreezeAvailable: false,
      streakFreezeUsedThisMonth: true,
    };
    set({ progression: updated });
    repository.saveProgression(updated);
    toast.info("Streak Freeze equipped! Your streak is protected if you miss a day.");
  },

  clearMilestoneHit: () => set({ activeMilestoneHit: null }),
  clearLevelUp: () => set({ levelUpCelebration: null }),

  setAchievementsOpen: (open) => set({ isAchievementsOpen: open }),
  setChallengesOpen: (open) => set({ isChallengesOpen: open }),
  setAnalyticsOpen: async (open) => {
    if (open) {
      const logs = await repository.getActivityLogs(30);
      set({ activityLogs: logs, isAnalyticsOpen: true });
    } else {
      set({ isAnalyticsOpen: false });
    }
  },
  openShareModal: (counter) => set({ isShareModalOpen: true, shareTargetCounter: counter }),
  closeShareModal: () => set({ isShareModalOpen: false, shareTargetCounter: null }),
}));
