export type SyncMessage =
  | { type: "COUNTER_UPSERT"; id: string }
  | { type: "COUNTER_DELETE"; id: string }
  | { type: "COUNTERS_REORDERED" }
  | { type: "SETTINGS_CHANGED" }
  | { type: "DATA_RESET" };

class TabSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(msg: SyncMessage) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel("countlens_tab_sync");
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          this.notify(event.data);
        };
      } catch (err) {
        console.warn("[COUNTLENS] BroadcastChannel unavailable:", err);
      }
    }
  }

  broadcast(msg: SyncMessage): void {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn("[COUNTLENS] Broadcast postMessage failed:", err);
      }
    }
  }

  subscribe(callback: (msg: SyncMessage) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(msg: SyncMessage): void {
    for (const listener of this.listeners) {
      try {
        listener(msg);
      } catch (err) {
        console.error("[COUNTLENS] Error in sync listener:", err);
      }
    }
  }
}

export const tabSync = new TabSyncManager();
