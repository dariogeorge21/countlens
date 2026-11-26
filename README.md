# COUNTLENS

**COUNTLENS** is a premium, tactile, 3D-animated counter management single-page web application built with **Next.js 16 (App Router)**, **React 19**, **strict TypeScript**, **Tailwind CSS v4**, **Motion**, **Three.js / React Three Fiber**, **Zustand**, and **IndexedDB** local persistence.

---

## 🌟 Key Features

### 1. Physical Gestures
- **Vertical Pull-to-Count (`PullHandle`)**: Pull the bottom handle up to increment or down to decrement. Features logarithmic resistance physics, a live floating preview badge showing dynamic delta and target value, and a spring snap-back animation on release.
- **Horizontal Scrubber (`DragScrubber`)**: Drag left to decrement or right to increment across subtle ruler ticks with momentum and audio/haptic clicks.
- **Directional Swipe (`SwipeSurface`)**: Swipe right on the card surface to increment, or left to decrement, accompanied by directional visual ripple cues.
- **Accelerating Press-and-Hold (`HoldButton`)**: Hold `+` or `-` buttons to repeat; starts smoothly at 1 tick/300ms easing down to 50ms (20 ticks/sec), cleanly cancelling on pointerup, blur, or when hitting a hard limit.
- **Direct Inline Numeral Editing**: Click/tap the large tabular numeral to edit the exact count directly with keyboard input.

### 2. Tactile 3D Depth & Motion
- **CSS 3D Card Tilt**: Pointer-driven 3D perspective tilt (`perspective: 1000px`, dynamic `rotateX`/`rotateY`) with specular cursor-following radial glow.
- **Direction-Aware Odometer Numerals**: Smooth rolling digit transitions that roll upward for increments and downward for decrements (`Geist Mono`).
- **React Three Fiber 3D Background**: Floating geometric wireframes (torus, octahedron, icosahedron) rendered via client-only, lazy-loaded Three.js Canvas with DPR throttling, WebGL error boundaries, and reduced-motion fallback.

### 3. Complete Counter Management (Full CRUD)
- **Create & Edit**: Custom name, start value, step multiplier (preset or decimal custom), optional lower and upper bounds.
- **Limit Behaviors**:
  - `Stop at limit`: Visual red warning badge + tactile spring shake.
  - `Wrap around`: Seamless wrap cycling + distinct wrap sparkle animation.
- **Organization**: Pin/unpin counters to prominent top shelf, duplicate with copy suffix, and reset to initial value.
- **Search & Sort**: Instant fuzzy search (`/` shortcut), filter by pinned/limits, and sort by manual order, name, value, or recency.
- **Per-Counter History**: Timestamped delta audit log with single-click Undo and Redo.

### 4. Local Persistence & Privacy
- **IndexedDB (`idb`)**: Zero cloud tracking, zero backend dependencies. Fast local storage with versioned schema migrations.
- **Graceful Fallback**: Automatically switches to in-memory session mode if IndexedDB is blocked (e.g., incognito or iframe storage restrictions) with a subtle non-blocking banner.
- **Cross-Tab Synchronization**: Real-time cross-tab updates using `BroadcastChannel`.
- **JSON Backup & Restore**: Export all counters and preferences into human-readable JSON; import backups with Zod schema validation and a choice between "Merge" and "Replace All".

### 5. Accessibility & Audio/Haptics
- **Screen Reader Semantics**: `role="spinbutton"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and throttled polite `aria-live` region.
- **Zero-Latency Web Audio Synthesizer**: Procedural high-frequency clicks, limit thuds, and snap tones (disabled by default; toggleable in settings).
- **Mobile Vibration Haptics**: Native `navigator.vibrate` patterns for ticks, snaps, and limits.
- **Zero-Flicker Theming**: Dark / Light / System theme modes via `next-themes`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `N` | Open Create New Counter dialog |
| `/` | Focus search bar |
| `?` | Open keyboard shortcuts cheatsheet |
| `Escape` | Close dialog or unfocus active input |
| `↑` / `↓` | Increment / Decrement active counter |
| `Shift + ↑` / `Shift + ↓` | Increment / Decrement by 10× step size |
| `Cmd/Ctrl + Z` | Undo most recent counting action |

---

## 🛠️ Architecture & Tech Stack

```
countlens/
├── app/
│   ├── layout.tsx              # Root HTML, Geist fonts, ThemeProvider, Toaster
│   ├── page.tsx                # Single-page dashboard & state wiring
│   └── globals.css             # Tailwind v4 theme variables, glassmorphism styles
├── components/
│   ├── counter/                # CounterCard, CounterValue, CounterControls, CounterForm, LimitIndicator
│   ├── interactions/           # PullHandle, DragScrubber, SwipeSurface, HoldButton
│   ├── layout/                 # Header, ThemeToggle, SettingsDialog, ShortcutsDialog, CounterGrid, EmptyState
│   ├── three/                  # HeroScene, CounterOrb, SceneWrapper, ThreeHeroClient
│   └── ui/                     # Accessible Radix primitives (Dialog, Popover, Dropdown, Switch, Slider)
├── hooks/                      # useCounters, useHold, useSoundEffects, useHaptics, useReducedMotion, useKeyboardShortcuts
├── lib/
│   ├── counter-logic.ts        # Pure, testable functions (clamp, wrap, applyDelta, precisionStep, undo)
│   ├── motion-config.ts        # Centralized spring presets and easing curves
│   ├── storage/                # IndexedDB repository, migrations, sync, schema, export-import
│   └── utils.ts                # cn utility
├── store/                      # counters.store.ts, ui.store.ts (Zustand)
├── tests/                      # Vitest unit test suite
└── types/                      # TypeScript definitions (Counter, Settings, Palette)
```

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run Automated Unit Tests
```bash
npm test
```

### 3. Production Build
```bash
npm run build
```
Runs strict TypeScript validation (`noUncheckedIndexedAccess`), ESLint, and Next.js static prerendering.
