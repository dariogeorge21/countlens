export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Handles database schema upgrades and data migration
 */
export function migrateDatabase(db: IDBDatabase, oldVersion: number) {
  if (oldVersion < 1) {
    if (!db.objectStoreNames.contains("counters")) {
      const counterStore = db.createObjectStore("counters", { keyPath: "id" });
      counterStore.createIndex("order", "order", { unique: false });
      counterStore.createIndex("pinned", "pinned", { unique: false });
      counterStore.createIndex("updatedAt", "updatedAt", { unique: false });
    }

    if (!db.objectStoreNames.contains("settings")) {
      db.createObjectStore("settings", { keyPath: "key" });
    }
  }
}
