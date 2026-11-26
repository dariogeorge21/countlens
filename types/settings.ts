export type AppSettings = {
  theme: "system" | "dark" | "light";
  sound: boolean;
  haptics: boolean;
  defaultStep: number;
  defaultLimitBehavior: "stop" | "wrap";
  schemaVersion: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  sound: false,
  haptics: false,
  defaultStep: 1,
  defaultLimitBehavior: "stop",
  schemaVersion: 1,
};

export type StorageStatus = "idle" | "ready" | "fallback" | "error";
