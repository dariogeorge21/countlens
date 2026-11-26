import { Challenge } from "@/types/gamification";
import { getTodayDateString } from "./engine";

export function generateDailyChallenges(now: Date = new Date()): Challenge[] {
  const todayStr = getTodayDateString(now);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const expiresAt = endOfDay.getTime();

  return [
    {
      id: `daily_count_${todayStr}`,
      title: "Daily Pulse",
      description: "Perform 25 counts today across any counters.",
      target: 25,
      current: 0,
      type: "count_today",
      xpReward: 60,
      completed: false,
      claimed: false,
      expiresAt,
      period: "daily",
    },
    {
      id: `daily_combo_${todayStr}`,
      title: "Momentum Builder",
      description: "Trigger a 5x rapid-count combo multiplier.",
      target: 5,
      current: 0,
      type: "rapid_combo",
      xpReward: 75,
      completed: false,
      claimed: false,
      expiresAt,
      period: "daily",
    },
    {
      id: `daily_multi_${todayStr}`,
      title: "Diversified Tally",
      description: "Log at least 1 count on 2 different counters today.",
      target: 2,
      current: 0,
      type: "multi_counter",
      xpReward: 80,
      completed: false,
      claimed: false,
      expiresAt,
      period: "daily",
    },
  ];
}

export function generateWeeklyChallenge(now: Date = new Date()): Challenge {
  const endOfWeek = new Date(now);
  const dayOfWeek = endOfWeek.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  const expiresAt = endOfWeek.getTime();

  return {
    id: `weekly_${Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000))}`,
    title: "Century Expedition",
    description: "Complete 150 cumulative counts this week.",
    target: 150,
    current: 0,
    type: "count_today",
    xpReward: 350,
    completed: false,
    claimed: false,
    expiresAt,
    period: "weekly",
  };
}
