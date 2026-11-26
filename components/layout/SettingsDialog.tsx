"use client";

import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCountersStore } from "@/store/counters.store";
import { useUIStore } from "@/store/ui.store";
import { downloadBackupFile, parseAndValidateImport } from "@/lib/storage/export-import";
import { Volume2, Vibrate, Download, Upload, Trash2, Database } from "lucide-react";
import { toast } from "sonner";

export function SettingsDialog() {
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);

  const settings = useCountersStore((s) => s.settings);
  const updateSettings = useCountersStore((s) => s.updateSettings);
  const counters = useCountersStore((s) => s.counters);
  const importData = useCountersStore((s) => s.importData);
  const clearAll = useCountersStore((s) => s.clearAll);
  const storageStatus = useCountersStore((s) => s.storageStatus);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<Parameters<typeof importData>[0] | null>(null);

  const handleExport = () => {
    downloadBackupFile(counters, settings);
    toast.success("Backup downloaded successfully");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseAndValidateImport(content);
      if (!res.success) {
        toast.error(res.error);
      } else {
        setPendingImport(res.data);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const executeImport = async (mode: "merge" | "replace") => {
    if (!pendingImport) return;
    await importData(pendingImport, mode);
    setPendingImport(null);
    toast.success(`Import complete (${mode === "replace" ? "Replaced all" : "Merged"})`);
  };

  return (
    <>
      <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Preferences & Data</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Storage status banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/40 border border-border/60">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" />
                <div>
                  <div className="text-xs font-semibold">Local Persistence</div>
                  <div className="text-[11px] text-muted-foreground">
                    {storageStatus === "ready"
                      ? "IndexedDB Active (Encrypted in browser)"
                      : storageStatus === "fallback"
                      ? "In-Memory Session Fallback (Private mode)"
                      : "IndexedDB Initializing"}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                {storageStatus}
              </span>
            </div>

            {/* Audio Feedback */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs font-semibold">Audio Feedback</div>
                  <div className="text-[11px] text-muted-foreground">
                    Subtle tactile clicks and limit thuds via Web Audio
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.sound}
                onCheckedChange={(checked) => updateSettings({ sound: checked })}
              />
            </div>

            {/* Haptics */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30">
              <div className="flex items-center gap-2.5">
                <Vibrate className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs font-semibold">Haptic Feedback</div>
                  <div className="text-[11px] text-muted-foreground">
                    Device vibration on touches, limits, and snaps
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.haptics}
                onCheckedChange={(checked) => updateSettings({ haptics: checked })}
              />
            </div>

            {/* Export & Import */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Data Backup
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="gap-2 text-xs h-10"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 text-xs h-10"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import JSON</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Clear All Data */}
            <div className="pt-2 border-t border-border/50">
              <Button
                variant="destructive"
                onClick={() => setShowClearConfirm(true)}
                className="w-full gap-2 text-xs h-9"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All Counters</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Choice Alert Dialog */}
      <AlertDialog open={!!pendingImport} onOpenChange={() => setPendingImport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Counters</AlertDialogTitle>
            <AlertDialogDescription>
              Found {pendingImport?.counters.length ?? 0} counters in backup file. How
              would you like to import them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-between gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => executeImport("merge")}>
                Merge Existing
              </Button>
              <AlertDialogAction onClick={() => executeImport("replace")}>
                Replace All
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Alert */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {counters.length} counters and their
              associated history from your local storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await clearAll();
                setShowClearConfirm(false);
                toast.success("All counters cleared");
              }}
            >
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
