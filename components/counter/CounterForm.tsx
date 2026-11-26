"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Counter, COLOR_PALETTE, LimitBehavior } from "@/types/counter";
import { Check } from "lucide-react";

interface CounterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (counterData: Partial<Counter> & { name: string }) => void;
  initialCounter?: Counter | null;
}

const ICON_OPTIONS = [
  "Hash",
  "Flame",
  "Droplets",
  "Target",
  "Trophy",
  "Heart",
  "Dumbbell",
  "Coffee",
  "Book",
  "Coins",
  "Sparkles",
  "CheckCircle",
];

function CounterFormFields({
  initialCounter,
  onSubmit,
  onCancel,
}: {
  initialCounter?: Counter | null;
  onSubmit: (counterData: Partial<Counter> & { name: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialCounter?.name ?? "");
  const [initialValue, setInitialValue] = useState(
    initialCounter?.initialValue?.toString() ?? "0"
  );
  const [step, setStep] = useState(initialCounter?.step?.toString() ?? "1");
  const [hasMin, setHasMin] = useState(
    initialCounter?.min !== null && initialCounter?.min !== undefined
  );
  const [minVal, setMinVal] = useState(initialCounter?.min?.toString() ?? "0");
  const [hasMax, setHasMax] = useState(
    initialCounter?.max !== null && initialCounter?.max !== undefined
  );
  const [maxVal, setMaxVal] = useState(
    initialCounter?.max?.toString() ?? "100"
  );
  const [limitBehavior, setLimitBehavior] = useState<LimitBehavior>(
    initialCounter?.limitBehavior ?? "stop"
  );
  const [color, setColor] = useState(initialCounter?.color ?? "#6366f1");
  const [icon, setIcon] = useState(initialCounter?.icon ?? "Hash");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please provide a counter name.");
      return;
    }
    if (trimmedName.length > 40) {
      setError("Name must be 40 characters or fewer.");
      return;
    }

    const parsedInit = parseFloat(initialValue) || 0;
    const parsedStep = parseFloat(step) || 1;
    if (parsedStep <= 0) {
      setError("Step must be a positive number.");
      return;
    }

    const parsedMin = hasMin ? parseFloat(minVal) : null;
    const parsedMax = hasMax ? parseFloat(maxVal) : null;

    if (parsedMin !== null && parsedMax !== null && parsedMin >= parsedMax) {
      setError("Minimum limit must be strictly less than maximum limit.");
      return;
    }

    onSubmit({
      name: trimmedName,
      initialValue: parsedInit,
      value: initialCounter ? initialCounter.value : parsedInit,
      step: parsedStep,
      min: parsedMin,
      max: parsedMax,
      limitBehavior,
      color,
      icon,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs rounded-xl bg-destructive/15 text-destructive border border-destructive/20 font-medium">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Counter Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Daily Water, Pushups, Reading Goal"
          maxLength={40}
          required
          autoFocus
        />
      </div>

      {/* Initial Value & Step */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Start Value
          </label>
          <Input
            type="number"
            step="any"
            value={initialValue}
            onChange={(e) => setInitialValue(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step Size
          </label>
          <Input
            type="number"
            step="any"
            min="0.001"
            value={step}
            onChange={(e) => setStep(e.target.value)}
          />
        </div>
      </div>

      {/* Limits */}
      <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
          Limits & Behavior
        </span>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Lower Limit</span>
          <div className="flex items-center gap-2">
            <Switch checked={hasMin} onCheckedChange={setHasMin} />
            {hasMin && (
              <Input
                type="number"
                step="any"
                value={minVal}
                onChange={(e) => setMinVal(e.target.value)}
                className="w-24 h-7 text-xs"
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Upper Limit</span>
          <div className="flex items-center gap-2">
            <Switch checked={hasMax} onCheckedChange={setHasMax} />
            {hasMax && (
              <Input
                type="number"
                step="any"
                value={maxVal}
                onChange={(e) => setMaxVal(e.target.value)}
                className="w-24 h-7 text-xs"
              />
            )}
          </div>
        </div>

        {(hasMin || hasMax) && (
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground">At Limit</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLimitBehavior("stop")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  limitBehavior === "stop"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                Stop
              </button>
              <button
                type="button"
                onClick={() => setLimitBehavior("wrap")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  limitBehavior === "wrap"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                Wrap
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Curated Palette */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Accent Color
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
          {COLOR_PALETTE.map((pal) => (
            <button
              key={pal.value}
              type="button"
              onClick={() => setColor(pal.value)}
              className="w-full h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105 relative cursor-pointer"
              style={{ backgroundColor: pal.value }}
              title={pal.name}
            >
              {color === pal.value && (
                <Check className="w-4 h-4 text-white stroke-[3]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Curated Icons */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Icon
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map((ico) => (
            <button
              key={ico}
              type="button"
              onClick={() => setIcon(ico)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                icon === ico
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {ico}
            </button>
          ))}
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialCounter ? "Save Changes" : "Create Counter"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CounterForm({
  open,
  onOpenChange,
  onSubmit,
  initialCounter,
}: CounterFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialCounter ? "Edit Counter" : "Create New Counter"}
          </DialogTitle>
        </DialogHeader>
        {open && (
          <CounterFormFields
            key={initialCounter ? initialCounter.id : "new-counter"}
            initialCounter={initialCounter}
            onSubmit={(data) => {
              onSubmit(data);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
