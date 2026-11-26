"use client";

import React, { Component, ReactNode, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

const emptySubscribe = () => () => {};

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[COUNTLENS 3D] WebGL Error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function SceneWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const reducedMotion = useReducedMotion();

  const canRender3D = isClient && !reducedMotion && isWebGLAvailable();

  const cssFallback = (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden ${className ?? ""}`}
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent blur-3xl rounded-full" />
    </div>
  );

  if (!canRender3D) {
    return cssFallback;
  }

  return (
    <ThreeErrorBoundary fallback={cssFallback}>
      <div className={className}>{children}</div>
    </ThreeErrorBoundary>
  );
}
