"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGamificationStore } from "@/store/gamification.store";
import { CounterIcon } from "@/components/counter/CounterIcon";
import { Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareCardModal() {
  const isOpen = useGamificationStore((s) => s.isShareModalOpen);
  const closeModal = useGamificationStore((s) => s.closeShareModal);
  const targetCounter = useGamificationStore((s) => s.shareTargetCounter);
  const progression = useGamificationStore((s) => s.progression);

  const [copied, setCopied] = useState(false);

  if (!targetCounter) return null;

  const serialId = targetCounter.id.slice(0, 8).toUpperCase();
  const shareText = `COUNTLENS TELEMETRY SPECIMEN // [${serialId}]
Counter: ${targetCounter.name}
Value: ${targetCounter.value.toLocaleString()}
Cadence: Lv.${progression.level} (${progression.levelTitle})
Streak: ${progression.streak} days
Lifetime Logs: ${progression.lifetimeCounts.toLocaleString()}
Verified Local Persistence // CountLens Tactile Studio`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Card telemetry copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `COUNTLENS // ${targetCounter.name}`,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md p-6 bg-background/95 backdrop-blur-2xl border-border/80 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
              Collector&apos;s Specimen
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              #{serialId}
            </span>
          </div>
          <DialogTitle className="sr-only">Share Milestone Card</DialogTitle>
        </DialogHeader>

        {/* Swiss Industrial Specimen Card */}
        <div className="relative mt-2 rounded-xl border border-border/90 bg-card p-6 shadow-sm font-mono overflow-hidden select-none">
          {/* Subtle Drafting Grid Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-foreground/90" />

          {/* Top Classification Row */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white border border-black/10 shadow-2xs"
                style={{ backgroundColor: targetCounter.color }}
              >
                <CounterIcon name={targetCounter.icon} className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                  OBJECT SPECIMEN
                </div>
                <div className="font-bold text-sm leading-tight text-foreground truncate max-w-[200px]">
                  {targetCounter.name}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
                CADENCE
              </div>
              <div className="text-xs font-bold text-foreground">
                {progression.streak}d streak
              </div>
            </div>
          </div>

          {/* Hero Value Monolith */}
          <div className="py-6 text-center">
            <div
              className="text-5xl sm:text-6xl font-black tracking-tight tabular-nums"
              style={{ color: targetCounter.color }}
            >
              {targetCounter.value.toLocaleString()}
            </div>
            {targetCounter.max !== null && (
              <div className="text-[11px] text-muted-foreground mt-1 tracking-wide">
                RANGE MAXIMUM: {targetCounter.max.toLocaleString()}
              </div>
            )}
          </div>

          {/* Precision Telemetry 3-Column Strip */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/60 text-center text-xs">
            <div className="space-y-0.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                TIER
              </div>
              <div className="font-bold text-[11px] text-foreground">
                LV.{String(progression.level).padStart(2, "0")}
              </div>
            </div>

            <div className="space-y-0.5 border-x border-border/60">
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                STREAK
              </div>
              <div className="font-bold text-[11px] text-foreground">
                {progression.streak} DAYS
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                LIFETIME
              </div>
              <div className="font-bold text-[11px] text-foreground tabular-nums">
                {progression.lifetimeCounts.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Authentic Industrial Footer */}
          <div className="mt-4 flex items-center justify-between text-[9px] text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium tracking-wider">
              {/* Decorative mini barcode tick pattern */}
              <span className="inline-flex gap-[2px] opacity-60">
                <span className="w-[1px] h-3 bg-foreground" />
                <span className="w-[2px] h-3 bg-foreground" />
                <span className="w-[1px] h-3 bg-foreground" />
                <span className="w-[3px] h-3 bg-foreground" />
                <span className="w-[1px] h-3 bg-foreground" />
              </span>
              <span>VERIFIED LOCAL ARCHIVE</span>
            </div>
            <span className="uppercase tracking-widest font-semibold text-foreground/70">
              COUNTLENS &bull; STUDIO
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex items-center gap-2 font-mono">
          <Button
            variant="outline"
            className="flex-1 gap-2 text-xs h-9 border-border/80 cursor-pointer"
            onClick={handleCopyText}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Telemetry</span>
              </>
            )}
          </Button>

          <Button
            className="flex-1 gap-2 text-xs h-9 bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
            onClick={handleNativeShare}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Specimen</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
