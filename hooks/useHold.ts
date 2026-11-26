"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseHoldOptions {
  action: () => boolean | void;
  initialDelayMs?: number;
  minIntervalMs?: number;
  accelerationFactor?: number;
  disabled?: boolean;
}

export function useHold({
  action,
  initialDelayMs = 300,
  minIntervalMs = 50,
  accelerationFactor = 0.88,
  disabled = false,
}: UseHoldOptions) {
  const [isHolding, setIsHolding] = useState(false);
  const currentIntervalRef = useRef(200);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);
  const actionRef = useRef(action);
  const loopRef = useRef<() => void>(() => {});

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  const clearHold = useCallback(() => {
    isHoldingRef.current = false;
    setIsHolding(false);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const runHoldLoop = useCallback(() => {
    if (!isHoldingRef.current) return;

    timeoutIdRef.current = setTimeout(() => {
      if (!isHoldingRef.current) return;

      const continueHold = actionRef.current();
      if (continueHold === false) {
        clearHold();
        return;
      }

      currentIntervalRef.current = Math.max(
        minIntervalMs,
        currentIntervalRef.current * accelerationFactor
      );

      loopRef.current();
    }, currentIntervalRef.current);
  }, [minIntervalMs, accelerationFactor, clearHold]);

  useEffect(() => {
    loopRef.current = runHoldLoop;
  }, [runHoldLoop]);

  const startHold = useCallback(
    (e?: React.SyntheticEvent) => {
      if (disabled) return;
      if (e) {
        e.preventDefault();
      }

      clearHold();
      isHoldingRef.current = true;
      setIsHolding(true);
      currentIntervalRef.current = 200;

      const continueHold = actionRef.current();
      if (continueHold === false) {
        clearHold();
        return;
      }

      timeoutIdRef.current = setTimeout(() => {
        if (!isHoldingRef.current) return;
        runHoldLoop();
      }, initialDelayMs);
    },
    [disabled, clearHold, initialDelayMs, runHoldLoop]
  );

  useEffect(() => {
    const handleWindowBlur = () => {
      clearHold();
    };
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      clearHold();
    };
  }, [clearHold]);

  return {
    isHolding,
    holdHandlers: {
      onPointerDown: (e: React.PointerEvent) => {
        if (e.button === 0) startHold(e);
      },
      onPointerUp: clearHold,
      onPointerLeave: clearHold,
      onPointerCancel: clearHold,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
    clearHold,
  };
}
