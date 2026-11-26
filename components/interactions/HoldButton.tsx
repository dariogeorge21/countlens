"use client";

import React from "react";
import { motion } from "motion/react";
import { useHold } from "@/hooks/useHold";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface HoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onTick: () => boolean | void; // Return false when limit reached to stop holding
  icon: React.ReactNode;
  label: string;
  variant?: "increment" | "decrement";
  disabled?: boolean;
  className?: string;
}

export function HoldButton({
  onTick,
  icon,
  label,
  variant = "increment",
  disabled = false,
  className,
}: HoldButtonProps) {
  const { playSound } = useSoundEffects();
  const haptics = useHaptics();

  const handleAction = () => {
    if (disabled) return false;
    const shouldContinue = onTick();
    if (shouldContinue === false) {
      playSound("limit");
      haptics.limit();
      return false;
    }
    playSound("tick");
    haptics.tick();
    return true;
  };

  const { holdHandlers } = useHold({
    action: handleAction,
    initialDelayMs: 300,
    minIntervalMs: 50, // Accelerates to 20 ticks per second
    accelerationFactor: 0.86,
    disabled,
  });

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      {...holdHandlers}
      disabled={disabled}
      aria-label={label}
      title={`${label} (tap or hold to accelerate)`}
      type="button"
      className={cn(
        "relative flex items-center justify-center rounded-2xl h-14 flex-1 select-none cursor-pointer transition-all duration-150 border border-border/80 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
        variant === "increment"
          ? "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-md shadow-primary/10"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
        className
      )}
    >
      <span className="scale-125">{icon}</span>
    </motion.button>
  );
}
