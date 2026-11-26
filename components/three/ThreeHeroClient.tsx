"use client";

import dynamic from "next/dynamic";
import { SceneWrapper } from "./SceneWrapper";

const LazyHeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => null,
});

export function ThreeHeroClient() {
  return (
    <SceneWrapper className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
      <LazyHeroScene />
    </SceneWrapper>
  );
}
