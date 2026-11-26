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
import { useGamificationStore } from "@/store/gamification.store";
import { downloadBackupFile, parseAndValidateImport } from "@/lib/storage/export-import";
import { soundSynthesizer } from "@/lib/gamification/sound-synthesizer";
import { SoundTheme } from "@/types/gamification";
import {
  Volume2,
  Vibrate,
  Download,
  Upload,
  Trash2,
  Database,
  Music,
  ShieldCheck,
  EyeOff,
} from "lucide-react";
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

  const progression = useGamificationStore((s) => s.progression);
  const setSoundTheme = useGamificationStore((s) => s.setSoundTheme);
  const toggleFocusMode = useGamificationStore((s) => s.toggleFocusMode);
  const useStreakFreeze = useGamificationStore((s) => s.useStreakFreeze);

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

  const handleThemeChange = (theme: SoundTheme) => {
    setSoundTheme(theme);
    if (settings.sound) {
      soundSynthesizer.playCountTick(theme, 0);
    }
  };

  return (
    <>
      <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border-border/80 shadow-2xl p-6 font-mono">
          <DialogHeader className="pb-2 border-b border-border/60">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                SYSTEM CONFIGURATION
              </span>
              <DialogTitle className="text-base font-bold tracking-tight text-foreground">
                Preferences &amp; Telemetry
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 py-1">
            {/* Storage status banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/25 border border-border/60">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs font-bold text-foreground">Persistence Engine</div>
                  <div className="text-[10px] text-muted-foreground">
                    {storageStatus === "ready"
                      ? "IndexedDB Active (Encrypted locally)"
                      : storageStatus === "fallback"
                      ? "In-Memory Fallback (Private mode)"
                      : "Initializing..."}
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-foreground/10 text-foreground font-bold uppercase">
                {storageStatus}
              </span>
            </div>

            {/* Focus Mode (Pure Counter) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/60">
              <div className="flex items-center gap-2.5">
                <EyeOff className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs font-bold text-foreground">Focus Mode</div>
                  <div className="text-[10px] text-muted-foreground">
                    Distraction-free pure counter: hides cadence gauges &amp; badges
                  </div>
                </div>
              </div>
              <Switch
                checked={progression.focusMode}
                onCheckedChange={toggleFocusMode}
              />
            </div>

            {/* Audio Feedback */}
            <div className="p-3 rounded-xl bg-secondary/20 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Audio Synthesizer</div>
                    <div className="text-[10px] text-muted-foreground">
                      Web Audio procedural clicks &amp; harmonic series
                    </div>
                  </div>
                </div>
                <Switch
                  checked={settings.sound}
                  onCheckedChange={(checked) => updateSettings({ sound: checked })}
                />
              </div>

              {/* Sound Theme Selector */}
              {settings.sound && (
                <div className="pt-2.5 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                    <Music className="w-3 h-3 text-muted-foreground" />
                    <span>Acoustic Profile</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: "chime", label: "Pentatonic Chime" },
                        { id: "mechanical", label: "Mechanical Click" },
                        { id: "arcade", label: "Arcade 8-Bit" },
                        { id: "minimal", label: "Subtle Minimal" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleThemeChange(t.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-all cursor-pointer ${
                          progression.soundTheme === t.id
                            ? "bg-foreground text-background border-foreground font-bold shadow-2xs"
                            : "bg-background/60 hover:bg-background border-border/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Haptics */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/60">
              <div className="flex items-center gap-2.5">
                <Vibrate className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs font-bold text-foreground">Haptic Feedback</div>
                  <div className="text-[10px] text-muted-foreground">
                    Impulse vibration on physical scrubs, limits &amp; snaps
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.haptics}
                onCheckedChange={(checked) => updateSettings({ haptics: checked })}
              />
            </div>

            {/* Streak Freeze Management */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/60">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-foreground">Streak Freeze Protection</div>
                  <div className="text-[10px] text-muted-foreground">
                    {progression.streakFreezeAvailable
                      ? "1 Freezes armed for current month"
                      : "Used for current calendar month"}
                  </div>
                </div>
              </div>
              {progression.streakFreezeAvailable ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Armed
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] px-2.5"
                  onClick={useStreakFreeze}
                  disabled={!progression.streakFreezeAvailable}
                >
                  Used
                </Button>
              )}
            </div>

            {/* Export & Import */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                DATA BACKUP &amp; ARCHIVE
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="gap-2 text-xs h-9 border-border/70 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 text-xs h-9 border-border/70 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
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
                className="w-full gap-2 text-xs h-8 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Counters</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Choice Alert Dialog */}
      <AlertDialog open={!!pendingImport} onOpenChange={() => setPendingImport(null)}>
        <AlertDialogContent className="font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold">Import Telemetry Archive</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground font-sans">
              Found {pendingImport?.counters.length ?? 0} counters in backup file. How
              would you like to merge them with current local data?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-between gap-2 text-xs">
            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => executeImport("merge")}>
                Merge Existing
              </Button>
              <AlertDialogAction className="h-8 text-xs" onClick={() => executeImport("replace")}>
                Replace All
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation Alert */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent className="font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold">Clear All Local Data?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground font-sans">
              This will permanently delete all {counters.length} counters and their
              associated telemetry logs from your local device. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="text-xs">
            <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
