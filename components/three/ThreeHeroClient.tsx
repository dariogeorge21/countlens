"use client";

import dynamic from "next/dynamic";
import { SceneWrapper } from "./SceneWrapper";

const LazyHeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

export function ThreeHeroClient() {
  return (
    <SceneWrapper className="absolute inset-0 z-0 h-96 overflow-hidden pointer-events-none">
      <LazyHeroScene />
    </SceneWrapper>
  );
}
