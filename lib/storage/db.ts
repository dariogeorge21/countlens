import { openDB, IDBPDatabase } from "idb";
import { Counter } from "@/types/counter";
import { AppSettings, DEFAULT_SETTINGS } from "@/types/settings";
import { UserProgression, DailyActivityLog } from "@/types/gamification";
import { CURRENT_SCHEMA_VERSION, migrateDatabase } from "./migrations";
import { CounterSchema, AppSettingsSchema } from "./schema";

export interface CounterRepository {
  isAvailable(): boolean;
  getAllCounters(): Promise<Counter[]>;
  saveCounter(counter: Counter): Promise<void>;
  saveCounters(counters: Counter[]): Promise<void>;
  deleteCounter(id: string): Promise<void>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  getProgression(): Promise<UserProgression | null>;
  saveProgression(progression: UserProgression): Promise<void>;
  logDailyCount(date: string, delta: number, counterId: string): Promise<void>;
  getActivityLogs(limitDays?: number): Promise<DailyActivityLog[]>;
  clearAll(): Promise<void>;
}

class MemoryCounterRepository implements CounterRepository {
  private counters: Map<string, Counter> = new Map();
  private settings: AppSettings = { ...DEFAULT_SETTINGS };
  private progression: UserProgression | null = null;
  private activityLogs: Map<string, DailyActivityLog> = new Map();

  isAvailable(): boolean {
    return false;
  }

  async getAllCounters(): Promise<Counter[]> {
    return Array.from(this.counters.values()).sort((a, b) => a.order - b.order);
  }

  async saveCounter(counter: Counter): Promise<void> {
    this.counters.set(counter.id, counter);
  }

  async saveCounters(counters: Counter[]): Promise<void> {
    for (const c of counters) {
      this.counters.set(c.id, c);
    }
  }

  async deleteCounter(id: string): Promise<void> {
    this.counters.delete(id);
  }

  async getSettings(): Promise<AppSettings> {
    return { ...this.settings };
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    this.settings = { ...settings };
  }

  async getProgression(): Promise<UserProgression | null> {
    return this.progression ? { ...this.progression } : null;
  }

  async saveProgression(p: UserProgression): Promise<void> {
    this.progression = { ...p };
  }

  async logDailyCount(date: string, delta: number, counterId: string): Promise<void> {
    const existing = this.activityLogs.get(date) ?? {
      date,
      count: 0,
      countersActive: {},
      peakHour: new Date().getHours(),
    };
    existing.count = Math.max(0, existing.count + delta);
    existing.countersActive[counterId] = (existing.countersActive[counterId] ?? 0) + delta;
    this.activityLogs.set(date, existing);
  }

  async getActivityLogs(limitDays = 30): Promise<DailyActivityLog[]> {
    const logs = Array.from(this.activityLogs.values());
    logs.sort((a, b) => b.date.localeCompare(a.date));
    return logs.slice(0, limitDays);
  }

  async clearAll(): Promise<void> {
    this.counters.clear();
    this.progression = null;
    this.activityLogs.clear();
  }
}

class IndexedDBCounterRepository implements CounterRepository {
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private hasFailed = false;
  private memoryFallback = new MemoryCounterRepository();

  constructor() {
    if (typeof window !== "undefined" && "indexedDB" in window) {
      this.initDB();
    } else {
      this.hasFailed = true;
    }
  }

  private initDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB("countlens_db", CURRENT_SCHEMA_VERSION, {
        upgrade(db, oldVersion) {
          migrateDatabase(db as unknown as IDBDatabase, oldVersion);
        },
        blocked() {
          console.warn("[COUNTLENS] Database upgrade blocked by another tab.");
        },
        blocking() {
          console.warn("[COUNTLENS] Database blocking newer version in another tab.");
        },
        terminated() {
          console.error("[COUNTLENS] Database unexpectedly terminated.");
        },
      }).catch((err) => {
        console.error("[COUNTLENS] Failed to open IndexedDB, falling back to memory:", err);
        this.hasFailed = true;
        throw err;
      });
    }
    return this.dbPromise;
  }

  isAvailable(): boolean {
    return !this.hasFailed && typeof window !== "undefined" && "indexedDB" in window;
  }

  async getAllCounters(): Promise<Counter[]> {
    if (!this.isAvailable()) {
      return this.memoryFallback.getAllCounters();
    }
    try {
      const db = await this.initDB();
      const rawRecords = await db.getAll("counters");
      const validCounters: Counter[] = [];

      for (const rec of rawRecords) {
        const parsed = CounterSchema.safeParse(rec);
        if (parsed.success) {
          validCounters.push(parsed.data);
        } else {
          console.warn(`[COUNTLENS] Quarantining corrupted counter record:`, parsed.error);
        }
      }

      return validCounters.sort((a, b) => a.order - b.order);
    } catch {
      this.hasFailed = true;
      return this.memoryFallback.getAllCounters();
    }
  }

  async saveCounter(counter: Counter): Promise<void> {
    if (!this.isAvailable()) {
      return this.memoryFallback.saveCounter(counter);
    }
    try {
      const db = await this.initDB();
      await db.put("counters", counter);
    } catch {
      this.hasFailed = true;
      await this.memoryFallback.saveCounter(counter);
    }
  }

  async saveCounters(counters: Counter[]): Promise<void> {
    if (!this.isAvailable()) {
      return this.memoryFallback.saveCounters(counters);
    }
    try {
      const db = await this.initDB();
      const tx = db.transaction("counters", "readwrite");
      await Promise.all([
        ...counters.map((c) => tx.store.put(c)),
        tx.done,
      ]);
    } catch {
      this.hasFailed = true;
      await this.memoryFallback.saveCounters(counters);
    }
  }

  async deleteCounter(id: string): Promise<void> {
    if (!this.isAvailable()) {
      return this.memoryFallback.deleteCounter(id);
    }
    try {
      const db = await this.initDB();
      await db.delete("counters", id);
    } catch {
      this.hasFailed = true;
      await this.memoryFallback.deleteCounter(id);
    }
  }

  async getSettings(): Promise<AppSettings> {
    if (!this.isAvailable()) {
      return this.memoryFallback.getSettings();
    }
    try {
      const db = await this.initDB();
      const entry = await db.get("settings", "app_settings");
      if (entry && entry.value) {
        const parsed = AppSettingsSchema.safeParse(entry.value);
        if (parsed.success) {
          return parsed.data;
        }
      }
      return { ...DEFAULT_SETTINGS };
    } catch {
      this.hasFailed = true;
      return this.memoryFallback.getSettings();
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.isAvailable()) {
      return this.memoryFallback.saveSettings(settings);
    }
    try {
      const db = await this.initDB();
      await db.put("settings", { key: "app_settings", value: settings });
    } catch {
      this.hasFailed = true;
      await this.memoryFallback.saveSettings(settings);
    }
  }

  async getProgression(): Promise<UserProgression | null> {
    if (!this.isAvailable()) {
      return this.memoryFallback.getProgression();
    }
    try {
      const db = await this.initDB();
      const entry = await db.get("progression", "user_progression");
      return entry ? entry.data : null;
    } catch {
      this.hasFailed = true;
      return this.memoryFallback.getProgression();
    }
  }

  async saveProgression(progression: UserProgression): Promise<void> {
    if (!this.isAvailable()) {
      return this.memoryFallback.saveProgression(progression);
    }
    try {
      const db = await this.initDB();
      await db.put("progression", { id: "user_progression", data: progression });
    } catch {
      this.hasFailed = true;
      await this.memoryFallback.saveProgression(progression);
    }
  }

  async logDailyCount(date: string, delta: number, counterId: string): Promise<void> {
    if (!this.isAvailable()) {
      return this.memoryFallback.logDailyCount(date, delta, counterId);
    }
    try {
      const db = await this.initDB();
      const tx = db.transaction("activity_logs", "readwrite");
      const existing = (await tx.store.get(date)) as DailyActivityLog | undefined;
      const updated: DailyActivityLog = existing ?? {
        date,
        count: 0,
        countersActive: {},
        peakHour: new Date().getHours(),
      };
      updated.count = Math.max(0, updated.count + delta);
      updated.countersActive[counterId] = (updated.countersActive[counterId] ?? 0) + delta;
      await tx.store.put(updated);
      await tx.done;
    } catch {
      this.hasFailed = true;
      await this.memoryFallback.logDailyCount(date, delta, counterId);
    }
  }

  async getActivityLogs(limitDays = 30): Promise<DailyActivityLog[]> {
    if (!this.isAvailable()) {
      return this.memoryFallback.getActivityLogs(limitDays);
    }
    try {
      const db = await this.initDB();
      const records = (await db.getAll("activity_logs")) as DailyActivityLog[];
      records.sort((a, b) => b.date.localeCompare(a.date));
      return records.slice(0, limitDays);
    } catch {
      this.hasFailed = true;
      return this.memoryFallback.getActivityLogs(limitDays);
    }
  }

  async clearAll(): Promise<void> {
    if (!this.isAvailable()) {
      return this.memoryFallback.clearAll();
    }
    try {
      const db = await this.initDB();
      const tx = db.transaction(["counters", "settings", "progression", "activity_logs"], "readwrite");
      await tx.objectStore("counters").clear();
      await tx.objectStore("progression").clear();
      await tx.objectStore("activity_logs").clear();
      await tx.done;
    } catch {
      this.hasFailed = true;
      await this.memoryFallback.clearAll();
    }
  }
}

export const repository: CounterRepository = new IndexedDBCounterRepository();
