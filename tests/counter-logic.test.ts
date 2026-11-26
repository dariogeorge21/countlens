import { describe, it, expect } from "vitest";
import {
  roundPrecision,
  clampValue,
  wrapValue,
  applyDelta,
  canIncrement,
  canDecrement,
  createCounter,
  duplicateCounter,
  resetCounter,
  undoCounter,
  appendHistory,
  MAX_HISTORY_LENGTH,
} from "@/lib/counter-logic";
import { Counter } from "@/types/counter";

describe("Counter Pure Logic", () => {
  describe("roundPrecision", () => {
    it("eliminates floating-point drift", () => {
      expect(0.1 + 0.2).not.toBe(0.3);
      expect(roundPrecision(0.1 + 0.2)).toBe(0.3);
      expect(roundPrecision(1.000000001, 4)).toBe(1);
    });
  });

  describe("clampValue", () => {
    it("returns the value if within bounds", () => {
      expect(clampValue(5, 0, 10)).toBe(5);
    });

    it("clamps to min when below min", () => {
      expect(clampValue(-2, 0, 10)).toBe(0);
    });

    it("clamps to max when above max", () => {
      expect(clampValue(15, 0, 10)).toBe(10);
    });

    it("handles null bounds cleanly", () => {
      expect(clampValue(-100, null, 10)).toBe(-100);
      expect(clampValue(100, 0, null)).toBe(100);
      expect(clampValue(42, null, null)).toBe(42);
    });
  });

  describe("wrapValue", () => {
    it("wraps around upper limit for discrete integers", () => {
      // Bounds: 0 to 5 (inclusive). Range = 6 (0,1,2,3,4,5)
      expect(wrapValue(6, 0, 5)).toBe(0);
      expect(wrapValue(7, 0, 5)).toBe(1);
    });

    it("wraps around lower limit for discrete integers", () => {
      // 0 - 1 = -1 -> wraps to 5
      expect(wrapValue(-1, 0, 5)).toBe(5);
      expect(wrapValue(-2, 0, 5)).toBe(4);
    });

    it("preserves values within range", () => {
      expect(wrapValue(3, 0, 5)).toBe(3);
      expect(wrapValue(0, 0, 5)).toBe(0);
      expect(wrapValue(5, 0, 5)).toBe(5);
    });
  });

  describe("applyDelta with stop limit behavior", () => {
    const baseCounter: Counter = {
      id: "test-1",
      name: "Inventory",
      value: 10,
      initialValue: 10,
      step: 1,
      min: 0,
      max: 12,
      limitBehavior: "stop",
      color: "#6366f1",
      pinned: false,
      order: 0,
      createdAt: 1000,
      updatedAt: 1000,
      history: [],
    };

    it("increments within bounds", () => {
      const res = applyDelta(baseCounter, 1);
      expect(res.nextValue).toBe(11);
      expect(res.deltaApplied).toBe(1);
      expect(res.hitLimit).toBe(false);
      expect(res.wrapped).toBe(false);
    });

    it("stops at max and signals hitLimit", () => {
      const res = applyDelta(baseCounter, 5);
      expect(res.nextValue).toBe(12);
      expect(res.deltaApplied).toBe(2);
      expect(res.hitLimit).toBe(true);
      expect(res.wrapped).toBe(false);
    });

    it("stops at min and signals hitLimit", () => {
      const res = applyDelta(baseCounter, -15);
      expect(res.nextValue).toBe(0);
      expect(res.deltaApplied).toBe(-10);
      expect(res.hitLimit).toBe(true);
      expect(res.wrapped).toBe(false);
    });
  });

  describe("applyDelta with wrap limit behavior", () => {
    const wrapCounter: Counter = {
      id: "test-wrap",
      name: "Days of Week",
      value: 6,
      initialValue: 0,
      step: 1,
      min: 0,
      max: 6,
      limitBehavior: "wrap",
      color: "#10b981",
      pinned: false,
      order: 0,
      createdAt: 1000,
      updatedAt: 1000,
      history: [],
    };

    it("wraps around max to min", () => {
      const res = applyDelta(wrapCounter, 1);
      expect(res.nextValue).toBe(0);
      expect(res.wrapped).toBe(true);
      expect(res.hitLimit).toBe(false);
    });

    it("wraps around min to max", () => {
      const zeroCounter = { ...wrapCounter, value: 0 };
      const res = applyDelta(zeroCounter, -1);
      expect(res.nextValue).toBe(6);
      expect(res.wrapped).toBe(true);
      expect(res.hitLimit).toBe(false);
    });
  });

  describe("canIncrement & canDecrement", () => {
    const counter: Counter = {
      id: "test-bounds",
      name: "Tally",
      value: 10,
      initialValue: 0,
      step: 1,
      min: 0,
      max: 10,
      limitBehavior: "stop",
      color: "#6366f1",
      pinned: false,
      order: 0,
      createdAt: 1000,
      updatedAt: 1000,
      history: [],
    };

    it("correctly identifies when increment or decrement is blocked by limit", () => {
      expect(canIncrement(counter)).toBe(false);
      expect(canDecrement(counter)).toBe(true);

      const minCounter = { ...counter, value: 0 };
      expect(canIncrement(minCounter)).toBe(true);
      expect(canDecrement(minCounter)).toBe(false);
    });

    it("always permits increment/decrement when wrap is enabled", () => {
      const wrapCounter = { ...counter, limitBehavior: "wrap" as const };
      expect(canIncrement(wrapCounter)).toBe(true);
      expect(canDecrement(wrapCounter)).toBe(true);
    });
  });

  describe("history management & undo", () => {
    it("caps history at MAX_HISTORY_LENGTH", () => {
      let history: { t: number; delta: number; value: number }[] = [];
      for (let i = 1; i <= 150; i++) {
        history = appendHistory(history, 1, i);
      }
      expect(history.length).toBe(MAX_HISTORY_LENGTH);
      expect(history[0]?.value).toBe(150);
    });

    it("undoes the most recent delta accurately", () => {
      const counter = createCounter({
        name: "Coffee",
        initialValue: 0,
      });

      const updatedHistory = appendHistory(counter.history, 2, 2);
      const counterWithHistory: Counter = {
        ...counter,
        value: 2,
        history: updatedHistory,
      };

      const { updatedCounter, undoneEntry } = undoCounter(counterWithHistory);
      expect(undoneEntry?.delta).toBe(2);
      expect(updatedCounter.value).toBe(0);
      expect(updatedCounter.history.length).toBe(0);
    });
  });

  describe("resetCounter & duplicateCounter", () => {
    it("resets counter to initialValue and creates a history delta", () => {
      const counter = createCounter({
        name: "Pushups",
        initialValue: 10,
        value: 45,
      });

      const reset = resetCounter(counter);
      expect(reset.value).toBe(10);
      expect(reset.history.length).toBe(1);
      expect(reset.history[0]?.delta).toBe(-35);
    });

    it("duplicates counter with fresh ID and copy name", () => {
      const original = createCounter({
        name: "Gym",
        initialValue: 5,
        step: 2,
        color: "#f59e0b",
      });

      const copy = duplicateCounter(original, 5);
      expect(copy.id).not.toBe(original.id);
      expect(copy.name).toBe("Gym (Copy)");
      expect(copy.order).toBe(5);
      expect(copy.step).toBe(2);
      expect(copy.color).toBe("#f59e0b");
      expect(copy.history).toEqual([]);
    });
  });
});
