"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Edit3 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface CounterValueProps {
  id: string;
  value: number;
  color: string;
  onCommitValue: (newValue: number) => void;
  className?: string;
}

export function CounterValue({
  value,
  color,
  onCommitValue,
  className,
}: CounterValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [direction, setDirection] = useState<"up" | "down" | "none">("none");
  const prevValueRef = useRef(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (value > prevValueRef.current) {
      setDirection("up");
    } else if (value < prevValueRef.current) {
      setDirection("down");
    }
    prevValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setInputValue(value.toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && isFinite(parsed)) {
      onCommitValue(parsed);
    } else {
      setInputValue(value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(value.toString());
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center py-4 my-1 select-none", className)}>
      {isEditing ? (
        <div className="flex items-center justify-center w-full max-w-[200px]">
          <input
            ref={inputRef}
            type="number"
            step="any"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full text-center text-4xl sm:text-5xl font-extrabold font-tabular bg-secondary/80 border-2 border-primary rounded-xl px-2 py-1 outline-none text-foreground shadow-inner"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStartEdit}
          className="group relative flex items-center justify-center px-4 py-2 rounded-2xl transition-all duration-200 hover:bg-accent/40 active:scale-[0.98] cursor-pointer"
          title="Click to edit value directly"
          aria-label={`Current count is ${value}. Click to edit.`}
        >
          {/* Subtle glow behind the numerals */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none"
            style={{ backgroundColor: color, opacity: 0.08 }}
          />

          {/* Directional animated digits */}
          <div className="overflow-hidden h-14 sm:h-16 flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={value}
                initial={
                  reducedMotion
                    ? { opacity: 0 }
                    : {
                        y: direction === "up" ? 28 : direction === "down" ? -28 : 0,
                        opacity: 0,
                        scale: 0.95,
                      }
                }
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={
                  reducedMotion
                    ? { opacity: 0 }
                    : {
                        y: direction === "up" ? -28 : direction === "down" ? 28 : 0,
                        opacity: 0,
                        scale: 0.95,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 0.6,
                }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-tabular"
                style={{ color }}
              >
                {value}
              </motion.span>
            </AnimatePresence>
          </div>

          <Edit3 className="w-3.5 h-3.5 ml-2.5 opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
