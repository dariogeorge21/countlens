"use client";

import { create } from "zustand";
import { Counter, CounterHistoryEntry } from "@/types/counter";
import { AppSettings, DEFAULT_SETTINGS, StorageStatus } from "@/types/settings";
import { repository } from "@/lib/storage/db";
import { tabSync } from "@/lib/storage/sync";
import {
  applyDelta as computeDelta,
  createCounter,
  duplicateCounter,
  resetCounter,
  undoCounter,
  appendHistory,
  DeltaResult,
} from "@/lib/counter-logic";
import { ExportData } from "@/lib/storage/schema";

interface CountersState {
  counters: Counter[];
  settings: AppSettings;
  isHydrated: boolean;
  storageStatus: StorageStatus;
  writeQueue: Map<string, Counter>;
  deletedCounterDraft: Counter | null;

  // Lifecycle
  hydrate: () => Promise<void>;
  flushWrites: () => Promise<void>;

  // CRUD
  addCounter: (input: Partial<Counter> & { name: string }) => Counter;
  updateCounter: (id: string, updates: Partial<Counter>) => void;
  deleteCounter: (id: string) => { undo: () => void };
  restoreCounter: (counter: Counter) => void;
  duplicateCounter: (id: string) => Counter | null;
  resetCounter: (id: string) => void;

  // Counting & History
  applyDelta: (id: string, delta: number) => DeltaResult | null;
  setDirectValue: (id: string, newValue: number) => void;
  undo: (id: string) => CounterHistoryEntry | null;

  // Organization
  togglePin: (id: string) => void;
  reorderCounters: (orderedIds: string[]) => void;

  // Settings
  updateSettings: (partial: Partial<AppSettings>) => void;

  // Data Migration & Import
  importData: (payload: ExportData, mode: "merge" | "replace") => Promise<void>;
  clearAll: () => Promise<void>;
}

let writeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useCountersStore = create<CountersState>((set, get) => ({
  counters: [],
  settings: DEFAULT_SETTINGS,
  isHydrated: false,
  storageStatus: "idle",
  writeQueue: new Map(),
  deletedCounterDraft: null,

  hydrate: async () => {
    try {
      const [savedCounters, savedSettings] = await Promise.all([
        repository.getAllCounters(),
        repository.getSettings(),
      ]);

      const isAvailable = repository.isAvailable();

      // If database is empty, seed with 2 friendly starter counters to demonstrate features
      let initialCounters = savedCounters;
      if (initialCounters.length === 0) {
        const starter1 = createCounter({
          name: "Daily Water (Glasses)",
          initialValue: 0,
          value: 3,
          step: 1,
          min: 0,
          max: 8,
          limitBehavior: "stop",
          color: "#06b6d4",
          icon: "Droplets",
          pinned: true,
          order: 0,
        });

        const starter2 = createCounter({
          name: "Deep Work Sessions",
          initialValue: 0,
          value: 2,
          step: 1,
          min: 0,
          max: null,
          limitBehavior: "stop",
          color: "#6366f1",
          icon: "Flame",
          pinned: false,
          order: 1,
        });

        initialCounters = [starter1, starter2];
        await repository.saveCounters(initialCounters);
      }

      set({
        counters: initialCounters,
        settings: savedSettings,
        isHydrated: true,
        storageStatus: isAvailable ? "ready" : "fallback",
      });

      // Register flush handlers on page leave
      if (typeof window !== "undefined") {
        window.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") {
            get().flushWrites();
          }
        });
        window.addEventListener("pagehide", () => {
          get().flushWrites();
        });

        // Listen for cross-tab sync messages
        tabSync.subscribe(async (msg) => {
          if (msg.type === "COUNTER_UPSERT" || msg.type === "COUNTERS_REORDERED" || msg.type === "COUNTER_DELETE") {
            const reloaded = await repository.getAllCounters();
            set({ counters: reloaded });
          } else if (msg.type === "SETTINGS_CHANGED") {
            const reloadedSettings = await repository.getSettings();
            set({ settings: reloadedSettings });
          } else if (msg.type === "DATA_RESET") {
            const reloaded = await repository.getAllCounters();
            set({ counters: reloaded });
          }
        });
      }
    } catch (err) {
      console.error("[COUNTLENS] Hydration failed:", err);
      set({
        isHydrated: true,
        storageStatus: "error",
      });
    }
  },

  flushWrites: async () => {
    const queue = get().writeQueue;
    if (queue.size === 0) return;

    const countersToSave = Array.from(queue.values());
    queue.clear();

    try {
      await repository.saveCounters(countersToSave);
    } catch (err) {
      console.error("[COUNTLENS] Flush writes error:", err);
    }
  },

  addCounter: (input) => {
    const state = get();
    const newOrder = state.counters.length;
    const newCounter = createCounter({
      ...input,
      order: newOrder,
    });

    const updatedCounters = [...state.counters, newCounter];
    set({ counters: updatedCounters });

    repository.saveCounter(newCounter);
    tabSync.broadcast({ type: "COUNTER_UPSERT", id: newCounter.id });

    return newCounter;
  },

  updateCounter: (id, updates) => {
    const state = get();
    const index = state.counters.findIndex((c) => c.id === id);
    if (index === -1) return;

    const current = state.counters[index]!;
    const updated: Counter = {
      ...current,
      ...updates,
      updatedAt: Date.now(),
    };

    const nextCounters = [...state.counters];
    nextCounters[index] = updated;

    set({ counters: nextCounters });

    // Schedule debounced persist
    state.writeQueue.set(id, updated);
    if (writeDebounceTimer) clearTimeout(writeDebounceTimer);
    writeDebounceTimer = setTimeout(() => {
      get().flushWrites();
    }, 300);

    tabSync.broadcast({ type: "COUNTER_UPSERT", id });
  },

  deleteCounter: (id) => {
    const state = get();
    const target = state.counters.find((c) => c.id === id);
    if (!target) return { undo: () => {} };

    const remaining = state.counters.filter((c) => c.id !== id);
    set({
      counters: remaining,
      deletedCounterDraft: target,
    });

    repository.deleteCounter(id);
    tabSync.broadcast({ type: "COUNTER_DELETE", id });

    return {
      undo: () => {
        get().restoreCounter(target);
      },
    };
  },

  restoreCounter: (counter) => {
    const state = get();
    const restored = [...state.counters, counter].sort((a, b) => a.order - b.order);
    set({
      counters: restored,
      deletedCounterDraft: null,
    });

    repository.saveCounter(counter);
    tabSync.broadcast({ type: "COUNTER_UPSERT", id: counter.id });
  },

  duplicateCounter: (id) => {
    const state = get();
    const target = state.counters.find((c) => c.id === id);
    if (!target) return null;

    const cloned = duplicateCounter(target, state.counters.length);
    const updated = [...state.counters, cloned];

    set({ counters: updated });
    repository.saveCounter(cloned);
    tabSync.broadcast({ type: "COUNTER_UPSERT", id: cloned.id });

    return cloned;
  },

  resetCounter: (id) => {
    const state = get();
    const target = state.counters.find((c) => c.id === id);
    if (!target) return;

    const reset = resetCounter(target);
    get().updateCounter(id, reset);
  },

  applyDelta: (id, delta) => {
    const state = get();
    const counter = state.counters.find((c) => c.id === id);
    if (!counter) return null;

    const result = computeDelta(counter, delta);
    const updatedHistory = appendHistory(counter.history, result.deltaApplied, result.nextValue);

    const updated: Counter = {
      ...counter,
      value: result.nextValue,
      updatedAt: Date.now(),
      history: updatedHistory,
    };

    const nextCounters = state.counters.map((c) => (c.id === id ? updated : c));
    set({ counters: nextCounters });

    state.writeQueue.set(id, updated);
    if (writeDebounceTimer) clearTimeout(writeDebounceTimer);
    writeDebounceTimer = setTimeout(() => {
      get().flushWrites();
    }, 300);

    tabSync.broadcast({ type: "COUNTER_UPSERT", id });

    return result;
  },

  setDirectValue: (id, rawValue) => {
    const state = get();
    const counter = state.counters.find((c) => c.id === id);
    if (!counter) return;

    let targetValue = rawValue;
    if (counter.min !== null && targetValue < counter.min) targetValue = counter.min;
    if (counter.max !== null && targetValue > counter.max) targetValue = counter.max;

    const delta = targetValue - counter.value;
    if (delta === 0) return;

    const updatedHistory = appendHistory(counter.history, delta, targetValue);
    const updated: Counter = {
      ...counter,
      value: targetValue,
      updatedAt: Date.now(),
      history: updatedHistory,
    };

    const nextCounters = state.counters.map((c) => (c.id === id ? updated : c));
    set({ counters: nextCounters });

    repository.saveCounter(updated);
    tabSync.broadcast({ type: "COUNTER_UPSERT", id });
  },

  undo: (id) => {
    const state = get();
    const counter = state.counters.find((c) => c.id === id);
    if (!counter || counter.history.length === 0) return null;

    const { updatedCounter, undoneEntry } = undoCounter(counter);
    if (!undoneEntry) return null;

    const nextCounters = state.counters.map((c) => (c.id === id ? updatedCounter : c));
    set({ counters: nextCounters });

    repository.saveCounter(updatedCounter);
    tabSync.broadcast({ type: "COUNTER_UPSERT", id });

    return undoneEntry;
  },

  togglePin: (id) => {
    const state = get();
    const counter = state.counters.find((c) => c.id === id);
    if (!counter) return;

    const updated: Counter = {
      ...counter,
      pinned: !counter.pinned,
      updatedAt: Date.now(),
    };

    const nextCounters = state.counters.map((c) => (c.id === id ? updated : c));
    set({ counters: nextCounters });

    repository.saveCounter(updated);
    tabSync.broadcast({ type: "COUNTER_UPSERT", id });
  },

  reorderCounters: (orderedIds) => {
    const state = get();
    const idMap = new Map(state.counters.map((c) => [c.id, c]));
    const updated: Counter[] = [];

    orderedIds.forEach((id, index) => {
      const c = idMap.get(id);
      if (c) {
        updated.push({ ...c, order: index });
        idMap.delete(id);
      }
    });

    // Append any missing
    for (const remaining of idMap.values()) {
      updated.push({ ...remaining, order: updated.length });
    }

    set({ counters: updated });
    repository.saveCounters(updated);
    tabSync.broadcast({ type: "COUNTERS_REORDERED" });
  },

  updateSettings: (partial) => {
    const state = get();
    const updatedSettings: AppSettings = {
      ...state.settings,
      ...partial,
    };

    set({ settings: updatedSettings });
    repository.saveSettings(updatedSettings);
    tabSync.broadcast({ type: "SETTINGS_CHANGED" });
  },

  importData: async (payload, mode) => {
    const state = get();
    let finalCounters: Counter[] = [];

    if (mode === "replace") {
      finalCounters = payload.counters.map((c, idx) => ({ ...c, order: idx }));
      await repository.clearAll();
      await repository.saveCounters(finalCounters);
      await repository.saveSettings(payload.settings);
    } else {
      // Merge mode: preserve existing counters and append imported ones with new IDs if collision
      const existingIds = new Set(state.counters.map((c) => c.id));
      const importedAdjusted = payload.counters.map((c, idx) => {
        const id = existingIds.has(c.id)
          ? typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `imported_${Date.now()}_${idx}`
          : c.id;
        return {
          ...c,
          id,
          order: state.counters.length + idx,
        };
      });

      finalCounters = [...state.counters, ...importedAdjusted];
      await repository.saveCounters(importedAdjusted);
    }

    set({
      counters: finalCounters,
      settings: payload.settings,
    });

    tabSync.broadcast({ type: "DATA_RESET" });
  },

  clearAll: async () => {
    await repository.clearAll();
    set({ counters: [] });
    tabSync.broadcast({ type: "DATA_RESET" });
  },
}));
