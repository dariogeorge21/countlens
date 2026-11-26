export type LimitBehavior = "stop" | "wrap";

export type CounterHistoryEntry = {
  t: number;
  delta: number;
  value: number;
};

export type Counter = {
  id: string;
  name: string;
  value: number;
  initialValue: number;
  step: number;
  min: number | null;
  max: number | null;
  limitBehavior: LimitBehavior;
  color: string;
  icon?: string;
  pinned: boolean;
  order: number;
  createdAt: number;
  updatedAt: number;
  history: CounterHistoryEntry[];
};

export type SortOption = "manual" | "name" | "value" | "updated" | "created";

export type PaletteColor = {
  name: string;
  value: string;
  border: string;
  glow: string;
  bgSubtle: string;
};

export const COLOR_PALETTE: PaletteColor[] = [
  {
    name: "Indigo",
    value: "#6366f1",
    border: "border-indigo-500/40",
    glow: "rgba(99, 102, 241, 0.25)",
    bgSubtle: "rgba(99, 102, 241, 0.08)",
  },
  {
    name: "Emerald",
    value: "#10b981",
    border: "border-emerald-500/40",
    glow: "rgba(16, 185, 129, 0.25)",
    bgSubtle: "rgba(16, 185, 129, 0.08)",
  },
  {
    name: "Amber",
    value: "#f59e0b",
    border: "border-amber-500/40",
    glow: "rgba(245, 158, 11, 0.25)",
    bgSubtle: "rgba(245, 158, 11, 0.08)",
  },
  {
    name: "Rose",
    value: "#f43f5e",
    border: "border-rose-500/40",
    glow: "rgba(244, 63, 94, 0.25)",
    bgSubtle: "rgba(244, 63, 94, 0.08)",
  },
  {
    name: "Cyan",
    value: "#06b6d4",
    border: "border-cyan-500/40",
    glow: "rgba(6, 182, 212, 0.25)",
    bgSubtle: "rgba(6, 182, 212, 0.08)",
  },
  {
    name: "Purple",
    value: "#a855f7",
    border: "border-purple-500/40",
    glow: "rgba(168, 85, 247, 0.25)",
    bgSubtle: "rgba(168, 85, 247, 0.08)",
  },
  {
    name: "Orange",
    value: "#f97316",
    border: "border-orange-500/40",
    glow: "rgba(249, 115, 22, 0.25)",
    bgSubtle: "rgba(249, 115, 22, 0.08)",
  },
  {
    name: "Zinc",
    value: "#71717a",
    border: "border-zinc-500/40",
    glow: "rgba(113, 113, 122, 0.25)",
    bgSubtle: "rgba(113, 113, 122, 0.08)",
  },
];
