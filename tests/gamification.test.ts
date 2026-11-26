import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  getRequiredXpForLevel,
  evaluateStreak,
  evaluateCombo,
  checkMilestoneCrossing,
  evaluateBadges,
} from "@/lib/gamification/engine";
import { UserProgression } from "@/types/gamification";
import { Counter } from "@/types/counter";

describe("Gamification Engine Pure Logic", () => {
  describe("calculateLevel", () => {
    it("starts at Level 1 with 0 XP", () => {
      const res = calculateLevel(0);
      expect(res.level).toBe(1);
      expect(res.levelTitle).toBe("Novice Counter");
      expect(res.currentLevelXp).toBe(0);
      expect(res.percentToNext).toBe(0);
    });

    it("progresses to Level 2 and beyond predictably", () => {
      const xpForLvl2 = getRequiredXpForLevel(2);
      expect(xpForLvl2).toBeGreaterThan(0);

      const res = calculateLevel(xpForLvl2);
      expect(res.level).toBe(2);
      expect(res.levelTitle).toBe("Kinetic Apprentice");
      expect(res.percentToNext).toBe(0);

      // Halfway to level 3
      const xpForLvl3 = getRequiredXpForLevel(3);
      const halfXp = Math.floor(xpForLvl2 + (xpForLvl3 - xpForLvl2) / 2);
      const midRes = calculateLevel(halfXp);
      expect(midRes.level).toBe(2);
      expect(midRes.percentToNext).toBeGreaterThanOrEqual(45);
      expect(midRes.percentToNext).toBeLessThanOrEqual(55);
    });
  });

  describe("evaluateStreak", () => {
    it("initializes streak to 1 on first ever count", () => {
      const res = evaluateStreak("", "2026-11-26", 0, 0, true);
      expect(res.newStreak).toBe(1);
      expect(res.newBestStreak).toBe(1);
      expect(res.streakReset).toBe(false);
    });

    it("maintains streak when counting on the same calendar day", () => {
      const res = evaluateStreak("2026-11-26", "2026-11-26", 5, 8, true);
      expect(res.newStreak).toBe(5);
      expect(res.newBestStreak).toBe(8);
      expect(res.streakReset).toBe(false);
    });

    it("increments streak on consecutive day", () => {
      const res = evaluateStreak("2026-11-25", "2026-11-26", 4, 4, true);
      expect(res.newStreak).toBe(5);
      expect(res.newBestStreak).toBe(5);
      expect(res.streakFrozen).toBe(false);
    });

    it("uses streak freeze when 1 day was missed", () => {
      // Last active 24th, today 26th (missed 25th)
      const res = evaluateStreak("2026-11-24", "2026-11-26", 7, 10, true);
      expect(res.newStreak).toBe(8);
      expect(res.streakFrozen).toBe(true);
      expect(res.streakReset).toBe(false);
    });

    it("resets streak to 1 if missed more than 1 day or no freeze available", () => {
      const res = evaluateStreak("2026-11-20", "2026-11-26", 15, 20, false);
      expect(res.newStreak).toBe(1);
      expect(res.newBestStreak).toBe(20);
      expect(res.streakReset).toBe(true);
    });
  });

  describe("evaluateCombo", () => {
    it("starts fresh on first tap", () => {
      const res = evaluateCombo(0, 1000, 0);
      expect(res.count).toBe(1);
      expect(res.multiplier).toBe(1);
      expect(res.isActive).toBe(false);
    });

    it("ramps multiplier on rapid successive counts within 1800ms", () => {
      // Tap 1
      let combo = evaluateCombo(0, 1000, 0);
      // Tap 2 within 300ms
      combo = evaluateCombo(1000, 1300, combo.count);
      expect(combo.count).toBe(2);
      expect(combo.multiplier).toBe(1);

      // Tap 3 within 300ms -> activates combo!
      combo = evaluateCombo(1300, 1600, combo.count);
      expect(combo.count).toBe(3);
      expect(combo.multiplier).toBe(2);
      expect(combo.isActive).toBe(true);

      // Rapid counts up to 6 -> 3x
      combo = evaluateCombo(1600, 1800, 5);
      expect(combo.count).toBe(6);
      expect(combo.multiplier).toBe(3);

      // Rapid counts up to 10 -> 5x
      combo = evaluateCombo(1800, 2000, 9);
      expect(combo.multiplier).toBe(5);

      // Rapid counts up to 20 -> 10x
      combo = evaluateCombo(2000, 2200, 19);
      expect(combo.multiplier).toBe(10);
    });

    it("resets combo when delay exceeds 1800ms", () => {
      const res = evaluateCombo(1000, 3500, 8);
      expect(res.count).toBe(1);
      expect(res.multiplier).toBe(1);
      expect(res.isActive).toBe(false);
    });
  });

  describe("checkMilestoneCrossing", () => {
    it("detects crossing major milestone thresholds", () => {
      const hit = checkMilestoneCrossing(99, 100, "c1", "Water");
      expect(hit).not.toBeNull();
      expect(hit?.milestone).toBe(100);
      expect(hit?.tier).toBe("medium");

      const epicHit = checkMilestoneCrossing(999, 1000, "c1", "Pushups");
      expect(epicHit?.tier).toBe("epic");
    });

    it("returns null when no milestone was crossed", () => {
      const hit = checkMilestoneCrossing(12, 13, "c1", "Water");
      expect(hit).toBeNull();
    });
  });

  describe("evaluateBadges", () => {
    const baseProgression: UserProgression = {
      xp: 0,
      level: 1,
      levelTitle: "Novice Counter",
      currentLevelXp: 0,
      nextLevelXp: 80,
      percentToNext: 0,
      lifetimeCounts: 10,
      todayCounts: 10,
      lastActiveDate: "2026-11-26",
      streak: 3,
      bestStreak: 3,
      streakFreezeAvailable: true,
      streakFreezeUsedThisMonth: false,
      unlockedBadgeIds: [],
      badgeUnlockTimestamps: {},
      dailyChallenges: [],
      weeklyChallenge: null,
      soundTheme: "mechanical",
      focusMode: false,
      hapticsIntensity: "subtle",
    };

    const counters: Counter[] = [
      {
        id: "c1",
        name: "Reading",
        value: 10,
        initialValue: 0,
        step: 1,
        min: 0,
        max: 50,
        limitBehavior: "stop",
        color: "#6366f1",
        pinned: false,
        order: 0,
        createdAt: 1000,
        updatedAt: 1000,
        history: [],
      },
    ];

    it("unlocks eligible achievements and grants XP reward", () => {
      const { allBadges, newlyUnlocked, earnedXp } = evaluateBadges(
        baseProgression,
        counters
      );

      const unlockedIds = newlyUnlocked.map((b) => b.id);
      expect(unlockedIds).toContain("first_count");
      expect(unlockedIds).toContain("first_10");
      expect(unlockedIds).toContain("first_counter");
      expect(unlockedIds).toContain("streak_3");
      expect(earnedXp).toBeGreaterThan(0);
      expect(allBadges.length).toBe(24);
    });
  });
});
