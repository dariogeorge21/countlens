import { openDB, IDBPDatabase } from "idb";
import { Counter } from "@/types/counter";
import { AppSettings, DEFAULT_SETTINGS } from "@/types/settings";
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
  clearAll(): Promise<void>;
}

class MemoryCounterRepository implements CounterRepository {
  private counters: Map<string, Counter> = new Map();
  private settings: AppSettings = { ...DEFAULT_SETTINGS };

  isAvailable(): boolean {
    return false; // Indicates in-memory fallback
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

  async clearAll(): Promise<void> {
    this.counters.clear();
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
          console.warn(`[COUNTLENS] Quarantining corrupted counter record [${(rec as Record<string, unknown>).id ?? "unknown"}]:`, parsed.error);
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

  async clearAll(): Promise<void> {
    if (!this.isAvailable()) {
      return this.memoryFallback.clearAll();
    }
    try {
      const db = await this.initDB();
      const tx = db.transaction(["counters", "settings"], "readwrite");
      await tx.objectStore("counters").clear();
      await tx.done;
    } catch {
      this.hasFailed = true;
      await this.memoryFallback.clearAll();
    }
  }
}

export const repository: CounterRepository = new IndexedDBCounterRepository();
