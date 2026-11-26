import { Counter, CounterHistoryEntry } from "@/types/counter";

export const MAX_HISTORY_LENGTH = 100;

/**
 * Rounds a number to avoid JavaScript floating point errors (e.g. 0.1 + 0.2 = 0.30000000000000004)
 */
export function roundPrecision(val: number, precision: number = 8): number {
  const factor = Math.pow(10, precision);
  return Math.round(val * factor) / factor;
}

/**
 * Clamps a value between optional min and max bounds
 */
export function clampValue(
  val: number,
  min: number | null,
  max: number | null
): number {
  let res = val;
  if (min !== null && res < min) {
    res = min;
  }
  if (max !== null && res > max) {
    res = max;
  }
  return roundPrecision(res);
}

/**
 * Wraps a value around min and max bounds (both inclusive)
 */
export function wrapValue(val: number, min: number, max: number): number {
  if (min >= max) return min;

  // For discrete values (like integers)
  const isInteger = Number.isInteger(min) && Number.isInteger(max) && Number.isInteger(val);
  const range = isInteger ? max - min + 1 : max - min;

  if (range <= 0) return min;

  const offset = val - min;
  const wrappedOffset = ((offset % range) + range) % range;
  return roundPrecision(min + wrappedOffset);
}

export type DeltaResult = {
  nextValue: number;
  deltaApplied: number;
  hitLimit: boolean;
  wrapped: boolean;
};

/**
 * Computes next value after applying delta, respecting limits and wrapping
 */
export function applyDelta(counter: Counter, delta: number): DeltaResult {
  const rawTarget = roundPrecision(counter.value + delta);

  if (counter.min === null && counter.max === null) {
    return {
      nextValue: rawTarget,
      deltaApplied: delta,
      hitLimit: false,
      wrapped: false,
    };
  }

  // If wrapping is enabled and both bounds are set
  if (
    counter.limitBehavior === "wrap" &&
    counter.min !== null &&
    counter.max !== null
  ) {
    if (rawTarget > counter.max || rawTarget < counter.min) {
      const wrapped = wrapValue(rawTarget, counter.min, counter.max);
      return {
        nextValue: wrapped,
        deltaApplied: delta,
        hitLimit: false,
        wrapped: true,
      };
    }

    return {
      nextValue: rawTarget,
      deltaApplied: delta,
      hitLimit: false,
      wrapped: false,
    };
  }

  // Stop behavior or single-ended limit
  const clamped = clampValue(rawTarget, counter.min, counter.max);
  const hitLimit = clamped !== rawTarget;
  const deltaApplied = roundPrecision(clamped - counter.value);

  return {
    nextValue: clamped,
    deltaApplied,
    hitLimit,
    wrapped: false,
  };
}

export function canIncrement(counter: Counter): boolean {
  if (counter.limitBehavior === "wrap" && counter.min !== null && counter.max !== null) {
    return true;
  }
  if (counter.max === null) {
    return true;
  }
  return counter.value < counter.max;
}

export function canDecrement(counter: Counter): boolean {
  if (counter.limitBehavior === "wrap" && counter.min !== null && counter.max !== null) {
    return true;
  }
  if (counter.min === null) {
    return true;
  }
  return counter.value > counter.min;
}

/**
 * Appends a history entry while preserving the max length limit
 */
export function appendHistory(
  history: CounterHistoryEntry[],
  delta: number,
  newValue: number
): CounterHistoryEntry[] {
  if (delta === 0) return history;

  const newEntry: CounterHistoryEntry = {
    t: Date.now(),
    delta,
    value: newValue,
  };

  const updated = [newEntry, ...history];
  if (updated.length > MAX_HISTORY_LENGTH) {
    return updated.slice(0, MAX_HISTORY_LENGTH);
  }
  return updated;
}

/**
 * Helper to generate a new valid Counter record
 */
export function createCounter(
  input: Partial<Counter> & { name: string }
): Counter {
  const now = Date.now();
  const initialValue = input.initialValue ?? 0;
  const min = input.min ?? null;
  const max = input.max ?? null;
  const value = clampValue(input.value ?? initialValue, min, max);

  return {
    id: input.id ?? (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`),
    name: input.name.trim().substring(0, 40) || "Untitled Counter",
    value,
    initialValue,
    step: input.step && input.step > 0 ? input.step : 1,
    min,
    max,
    limitBehavior: input.limitBehavior ?? "stop",
    color: input.color ?? "#6366f1",
    icon: input.icon ?? "Hash",
    pinned: input.pinned ?? false,
    order: input.order ?? 0,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    history: input.history ? input.history.slice(0, MAX_HISTORY_LENGTH) : [],
  };
}

/**
 * Duplicates an existing counter with a copy name and given order index
 */
export function duplicateCounter(counter: Counter, newOrder: number): Counter {
  const now = Date.now();
  return {
    ...counter,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: `${counter.name} (Copy)`.substring(0, 40),
    order: newOrder,
    createdAt: now,
    updatedAt: now,
    history: [],
  };
}

/**
 * Resets counter value to its initialValue
 */
export function resetCounter(counter: Counter): Counter {
  if (counter.value === counter.initialValue) return counter;
  const now = Date.now();
  const delta = roundPrecision(counter.initialValue - counter.value);
  const updatedHistory = appendHistory(counter.history, delta, counter.initialValue);

  return {
    ...counter,
    value: counter.initialValue,
    updatedAt: now,
    history: updatedHistory,
  };
}

/**
 * Undoes the most recent delta from history
 */
export function undoCounter(counter: Counter): {
  updatedCounter: Counter;
  undoneEntry: CounterHistoryEntry | null;
} {
  if (counter.history.length === 0) {
    return { updatedCounter: counter, undoneEntry: null };
  }

  const [latestEntry, ...remainingHistory] = counter.history;
  if (!latestEntry) {
    return { updatedCounter: counter, undoneEntry: null };
  }

  const previousValue = roundPrecision(counter.value - latestEntry.delta);
  const now = Date.now();

  return {
    updatedCounter: {
      ...counter,
      value: previousValue,
      updatedAt: now,
      history: remainingHistory,
    },
    undoneEntry: latestEntry,
  };
}
