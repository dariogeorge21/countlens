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
import {
  Copy,
  Check,
  Share2,
  Sparkles,
  Flame,
  Award,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export function ShareCardModal() {
  const isOpen = useGamificationStore((s) => s.isShareModalOpen);
  const closeModal = useGamificationStore((s) => s.closeShareModal);
  const targetCounter = useGamificationStore((s) => s.shareTargetCounter);
  const progression = useGamificationStore((s) => s.progression);

  const [copied, setCopied] = useState(false);

  if (!targetCounter) return null;

  const shareText = `🎯 CountLens Progress Update
Counter: ${targetCounter.name}
Value: ${targetCounter.value}
Level: ${progression.level} (${progression.levelTitle})
🔥 Streak: ${progression.streak} days
⚡ Lifetime Counts: ${progression.lifetimeCounts}
Tactile Studio by CountLens`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Progress card summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${targetCounter.name} on CountLens`,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed, fallback to copy
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Share2 className="w-4 h-4 text-primary" />
            Share Milestone Card
          </DialogTitle>
        </DialogHeader>

        {/* The Card Preview */}
        <div className="relative mt-2 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-secondary/30 p-6 shadow-2xl backdrop-blur-xl">
          {/* Ambient Corner Glow */}
          <div
            className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full blur-3xl opacity-25"
            style={{ backgroundColor: targetCounter.color }}
          />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />

          {/* Header Row */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: targetCounter.color }}
              >
                <CounterIcon name={targetCounter.icon} className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Counter Progress
                </div>
                <div className="font-bold text-sm leading-tight text-foreground">
                  {targetCounter.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 border border-border/60 text-[11px] font-bold text-foreground">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{progression.streak}d streak</span>
            </div>
          </div>

          {/* Giant Value Display */}
          <div className="relative z-10 my-6 text-center">
            <div
              className="text-5xl font-black font-mono tracking-tight"
              style={{ color: targetCounter.color }}
            >
              {targetCounter.value.toLocaleString()}
            </div>
            {targetCounter.max !== null && (
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                of {targetCounter.max.toLocaleString()} limit
              </div>
            )}
          </div>

          {/* User Progression Footer Strip */}
          <div className="relative z-10 grid grid-cols-2 gap-2 pt-4 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-background/50 border border-border/40">
              <Award className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground font-semibold">Tier & Level</div>
                <div className="font-bold truncate text-[11px]">
                  Lv.{progression.level} {progression.levelTitle}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-background/50 border border-border/40">
              <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground font-semibold">Lifetime Total</div>
                <div className="font-bold truncate text-[11px]">
                  {progression.lifetimeCounts.toLocaleString()} counts
                </div>
              </div>
            </div>
          </div>

          {/* Watermark branding */}
          <div className="relative z-10 mt-4 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              COUNTLENS Tactile Studio
            </span>
            <span>Local &bull; Private</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 text-xs h-10"
            onClick={handleCopyText}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Summary</span>
              </>
            )}
          </Button>

          <Button
            variant="glow"
            className="flex-1 gap-2 text-xs h-10"
            onClick={handleNativeShare}
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
