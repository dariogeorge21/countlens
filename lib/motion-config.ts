export const motionConfig = {
  // Springs
  springSnappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },
  springGentle: {
    type: "spring" as const,
    stiffness: 260,
    damping: 24,
    mass: 1,
  },
  springBouncy: {
    type: "spring" as const,
    stiffness: 450,
    damping: 18,
    mass: 0.6,
  },
  springPull: {
    type: "spring" as const,
    stiffness: 500,
    damping: 28,
    mass: 0.5,
  },
  springDigit: {
    type: "spring" as const,
    stiffness: 550,
    damping: 35,
    mass: 0.5,
  },
  // Easings
  easeOutCubic: [0.33, 1, 0.68, 1] as const,
  easeInOutCubic: [0.65, 0, 0.35, 1] as const,
  // Durations
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
};

export const reducedMotionTransition = {
  duration: 0.15,
  ease: "easeOut",
};
