"use client";

import { useCallback } from "react";
import { soundSynthesizer } from "@/lib/gamification/sound-synthesizer";
import { useCountersStore } from "@/store/counters.store";
import { useGamificationStore } from "@/store/gamification.store";
import { SoundTheme } from "@/types/gamification";

type SoundType = "tick" | "limit" | "wrap" | "snap" | "reset";

export function useSoundEffects() {
  const soundEnabled = useCountersStore((s) => s.settings.sound);
  const soundTheme: SoundTheme = useGamificationStore((s) => s.progression.soundTheme);
  const comboCount = useGamificationStore((s) => s.combo.count);

  const playSound = useCallback(
    (type: SoundType) => {
      if (!soundEnabled) return;

      try {
        if (type === "tick") {
          soundSynthesizer.playCountTick(soundTheme, comboCount);
        } else if (type === "limit") {
          soundSynthesizer.playCountTick("mechanical", 0);
        } else if (type === "wrap") {
          soundSynthesizer.playMilestoneFanfare("minor");
        } else if (type === "snap") {
          soundSynthesizer.playCountTick("arcade", 2);
        } else if (type === "reset") {
          soundSynthesizer.playCountTick("mechanical", 0);
        }
      } catch (err) {
        console.warn("[COUNTLENS] Sound playback error:", err);
      }
    },
    [soundEnabled, soundTheme, comboCount]
  );

  const playMilestone = useCallback(
    (tier: "minor" | "medium" | "epic") => {
      if (!soundEnabled) return;
      soundSynthesizer.playMilestoneFanfare(tier);
    },
    [soundEnabled]
  );

  const playLevelUp = useCallback(() => {
    if (!soundEnabled) return;
    soundSynthesizer.playLevelUp();
  }, [soundEnabled]);

  return { playSound, playMilestone, playLevelUp };
}
