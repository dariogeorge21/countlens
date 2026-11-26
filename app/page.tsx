"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { CounterGrid } from "@/components/layout/CounterGrid";
import { CounterForm } from "@/components/counter/CounterForm";
import { SettingsDialog } from "@/components/layout/SettingsDialog";
import { ShortcutsDialog } from "@/components/layout/ShortcutsDialog";
import { ThreeHeroClient } from "@/components/three/ThreeHeroClient";
import { useCountersStore } from "@/store/counters.store";
import { useUIStore } from "@/store/ui.store";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { AlertTriangle } from "lucide-react";

export default function Home() {
  const hydrate = useCountersStore((s) => s.hydrate);
  const addCounter = useCountersStore((s) => s.addCounter);
  const updateCounter = useCountersStore((s) => s.updateCounter);
  const counters = useCountersStore((s) => s.counters);
  const storageStatus = useCountersStore((s) => s.storageStatus);

  const isCreateOpen = useUIStore((s) => s.isCreateOpen);
  const closeCreate = useUIStore((s) => s.closeCreate);
  const editingCounterId = useUIStore((s) => s.editingCounterId);
  const closeEdit = useUIStore((s) => s.closeEdit);

  // Initialize keyboard shortcuts & hydration
  useKeyboardShortcuts();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const editingCounter = editingCounterId
    ? counters.find((c) => c.id === editingCounterId) ?? null
    : null;

  return (
    <div className="relative min-h-screen flex flex-col bg-background selection:bg-indigo-500/20">
      {/* Ambient Lazy 3D Scene Background */}
      <ThreeHeroClient />

      {/* Main Header */}
      <Header />

      {/* Fallback storage banner if IndexedDB is blocked */}
      {storageStatus === "fallback" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center text-xs text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Storage is currently running in temporary in-memory mode (e.g. private
            browsing). Export your data before closing to preserve changes.
          </span>
        </div>
      )}

      {/* Main Dashboard Workspace */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <CounterGrid />
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 py-6 border-t border-border/40 text-center text-xs text-muted-foreground select-none">
        <p className="font-mono">
          COUNTLENS &bull; Built with tactile motion, 3D depth &amp; local persistence
        </p>
      </footer>

      {/* Create Counter Modal */}
      <CounterForm
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) closeCreate();
        }}
        onSubmit={(data) => {
          addCounter(data);
        }}
      />

      {/* Edit Counter Modal */}
      <CounterForm
        open={!!editingCounter}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
        initialCounter={editingCounter}
        onSubmit={(data) => {
          if (editingCounterId) {
            updateCounter(editingCounterId, data);
          }
        }}
      />

      {/* Settings Dialog */}
      <SettingsDialog />

      {/* Shortcuts Guide Dialog */}
      <ShortcutsDialog />

      {/* Accessible Polite Live Region for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {counters.length > 0
          ? `${counters.length} counters loaded.`
          : "No counters available."}
      </div>
    </div>
  );
}
