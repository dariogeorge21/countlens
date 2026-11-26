import React from "react";
import {
  Flame,
  Droplets,
  Target,
  Trophy,
  Heart,
  Dumbbell,
  Coffee,
  Book,
  Coins,
  Zap,
  CheckCircle,
  Activity,
  Clock,
  Hash,
  type LucideIcon,
} from "lucide-react";

export const COUNTER_ICON_MAP: Record<string, LucideIcon> = {
  Hash,
  Flame,
  Droplets,
  Target,
  Trophy,
  Heart,
  Dumbbell,
  Coffee,
  Book,
  Coins,
  Zap,
  CheckCircle,
  Activity,
  Clock,
};

export const AVAILABLE_ICONS = Object.keys(COUNTER_ICON_MAP);

interface CounterIconProps {
  name?: string;
  className?: string;
}

export function CounterIcon({ name, className = "w-4 h-4" }: CounterIconProps) {
  const IconComponent = name && COUNTER_ICON_MAP[name] ? COUNTER_ICON_MAP[name] : Hash;
  return <IconComponent className={className} />;
}
