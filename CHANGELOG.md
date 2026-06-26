# Changelog

All notable changes to Lottie Stage are documented in this file.

## [v0.6.0] — 2026-06-26

### Added
- **Card metadata footer** — every card now displays `fps · frames · duration · layer count` parsed from the Lottie JSON (`src/lib/lottie-meta.ts`, with unit tests).
- **⬇ JSON download** — `Download` button exports the currently centered clip as a `.json` file (`src/lib/download.ts`).
- **🎲 Random jump** — `Random` button spring-animates the carousel to a randomly selected card (won't pick the current one).
- **🔗 Source link** — `Source` button appears when the centered clip has a `sourceUrl`; jumps to the original asset page in a new tab.
- **Fullscreen mode** — double-click the stage (or press the area) to enlarge it; `Escape` exits at any time. CSS class drives height (`60vh → 85vh`) and perspective (`1200 → 1500`).

### Changed
- `LottieClip` now has an optional `sourceUrl?: string` field. Built-in samples carry LottieFiles URLs.
- `Controls` reorganized: Prev / ⬇ JSON / 🎲 Random / Delete / Next / 🔗 Source.
- `App.tsx` wraps the tree in an `ErrorBoundary` so a single broken upload can't freeze the whole UI.

### Tests
- `lottie-meta.test.ts` — 3 new tests covering fps, total frames, duration, layer count, null safety. Total tests: **13/13 passing**.

---

## [v0.5.0] — 2026-06-26

### Added
- **Bundled samples** — first-ever visit seeds three LottieFiles assets (cat-playing, doggie-walk, totoro-walk) so the stage is never empty by default.
- **`localStorage` seed flag** — `lottie-stage.seeded.v1`. Deleting a seeded sample is a real delete and never comes back on reload.
- `CONTRIBUTING.md`, `LICENSE` (MIT), `.github/workflows/deploy.yml` (GitHub Pages).

### Fixed
- `lottie-react` default-export compatibility — Vite 8 + CJS interop required picking `.default ?? module` to avoid `Element type is invalid` at runtime.

---

## [v0.4.0] — 2026-06-26

### Added
- `useCarousel` hook — `scrollValue` (continuous framer-motion value), drag via Pointer Events, spring snap on release, flick-across-cards on fast swipe, over-drag damping at the ends.
- `LottieCard` — `translateX / rotateY / scale / opacity / zIndex` driven by `offset = index - scrollValue`. Centered card calls `play()`; neighbors freeze on frame 0.
- `Stage` — windowed mounting (`|offset| ≤ 2`), click-to-center, keyboard ← →, focus management.
- `Uploader` — drag & drop or click, multi-select, JSON parse, Lottie validation, 5 MB soft-warn toast.
- `EmptyState`, `Controls` (Prev / Delete / Next).
- `App` composition root + dark theme.

---

## [v0.3.0] — 2026-06-26

### Added
- `lib/lottie-validate.ts` — pure validator (requires `v`, `fr`, `ip`, `op`, `layers[]`) with 4 unit tests.
- `lib/db.ts` — IndexedDB CRUD wrapper over `idb`. Schema version 1, single `clips` object store.
- `hooks/useLottieStore.ts` — hydrate-on-mount + `addClips` / `removeClip` API.

---

## [v0.2.0] — 2026-06-26

### Added
- `lib/geometry.ts` — pure mapping `offset → {translateX, rotateY, scale, opacity, zIndex}`.
- 6 unit tests covering center / right / left / midpoint interpolation / far-card invisibility / z-index ordering.

---

## [v0.1.0] — 2026-06-26

### Added
- Vite 8 + React 19.2 + TypeScript 6 scaffolding (`pnpm create vite`).
- Dependencies: `lottie-react`, `framer-motion`, `idb`, `vitest`.
- `vite.config.ts` `base: '/lottie-stage/'` for GitHub Pages.
- `vitest.config.ts`, `test` script in `package.json`.
- `src/types.ts` — `LottieClip` shape.