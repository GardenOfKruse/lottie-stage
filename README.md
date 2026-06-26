# Lottie Stage

> A pure-frontend, open-source 3D Cover Flow stage for Lottie animations.
>
> 🇨🇳 [中文文档](./README.zh-CN.md)

Upload any number of Lottie JSON files and they appear on a glassy stage
where the centered card plays while the neighbors tilt back, shrink and
fade. Drag, swipe, click, or use the arrow keys to move between clips —
the whole motion is driven by a single continuous value, so transitions
feel like real glass instead of a tick-by-tick slideshow.

> The stage ships with three bundled Lottie animations as a default set.
> Delete any of them and upload your own — they're just normal clips.

## Features

- **3D Cover Flow** layout: centered card faces you, neighbors tilt at
  45°, scale to 80%, and fade to 60% opacity.
- **One motion value, infinite smoothness.** Every card's transform is
  derived from `offset = index - scrollValue`, so dragging produces a
  continuous fan with zero discrete jumps.
- **Windowed rendering.** Only cards within `|offset| ≤ 2` mount a real
  Lottie instance; further cards show their filename as a lightweight
  placeholder. Sliding stays smooth even with dozens of clips.
- **Center plays, rest freeze.** Only the active card runs its animation
  loop. Neighbors snap to frame 0 as static previews.
- **Multiple inputs.** Drag / touch swipe, click on any visible card,
  arrow buttons, `←` / `→` keyboard, and release-velocity flick.
- **IndexedDB persistence.** Uploaded clips survive a page reload.
- **Drag-and-drop upload** with JSON validation and a 5 MB soft warning.

## Tech Stack

- React 19 + Vite 8 + TypeScript
- [lottie-react](https://github.com/Gamote/lottie-react) for Lottie playback
- [framer-motion](https://www.framer.com/motion/) for spring physics
- [idb](https://github.com/jakearchibald/idb) as a thin IndexedDB wrapper
- [Vitest](https://vitest.dev/) for the pure-function unit tests

No UI component library, no CSS framework, no backend.

## Getting Started

```bash
pnpm install
pnpm dev          # open http://127.0.0.1:5173/lottie-stage/
```

## Usage

1. Open the app in your browser — three sample animations are already on
   the stage so you have something to look at immediately.
2. Drag / swipe the stage left and right to fan the cards. Lift your
   pointer anywhere — the nearest card snaps to center with a spring.
3. Click any visible card to spring-center it.
4. Use the `←` / `→` arrow keys when the stage is focused, or the
   Prev / Next buttons below the stage.
5. Click **Delete** to remove the currently centered card. Once deleted,
   it stays deleted across reloads — the bundled defaults are seeded
   only on the very first visit.
6. Drop additional `.json` files anywhere on the page (or click the
   dropzone) to add your own. They'll persist in IndexedDB across reloads.

### Validation rules

A file is accepted as Lottie when it is a JSON object containing every
required key (`v`, `layers`, `fr`, `ip`, `op`) and `layers` is an array.
Anything else is skipped with a toast at the bottom of the page.

## Build & Deploy

```bash
pnpm build        # produces dist/
pnpm preview      # serve dist/ locally
```

A GitHub Pages workflow is included at
`.github/workflows/deploy.yml`. On every push to `main` it builds the
project and publishes `dist/` to GitHub Pages.

**Important:** `vite.config.ts` sets `base: '/lottie-stage/'` to match
the default repo name. If you fork or rename the repo, update this
string to match the new path (e.g. `/your-fork-name/`) — otherwise
asset URLs will resolve against the wrong origin on Pages.

## Testing

```bash
pnpm test         # runs Vitest once
pnpm test:watch   # watch mode
```

The current test suite covers the two pure-function modules:

- `src/lib/geometry.ts` — offset → 3D transform mapping.
- `src/lib/lottie-validate.ts` — JSON validation.

UI components are deliberately not unit-tested; verify them by running
`pnpm dev` and exercising the stage manually.

## Project Structure

```
src/
  components/         React components
    Controls.tsx      prev / next / delete buttons
    EmptyState.tsx    shown when zero clips
    LottieCard.tsx    one card: 3D transform + Lottie playback
    Stage.tsx         3D container with windowing + keyboard
    Uploader.tsx      drag-and-drop / click-to-pick file input
  hooks/
    useCarousel.ts    scrollValue MotionValue, drag, spring, flick
    useLottieStore.ts IndexedDB hydration + add/remove clips + first-run seed
  lib/
    db.ts             idb wrapper (getAllClips / addClip / deleteClip)
    geometry.ts       pure: offset → CardStyle
    lottie-validate.ts pure: isLottieData(unknown) → boolean
  samples/            bundled Lottie JSON used as the first-run default set
  types.ts            LottieClip type
  App.tsx             composition root
```

## Bundled samples

The three Lottie animations under `src/samples/` are the same files used
by the companion-feature preset in the [timeshards](https://github.com/)
project's pet module. They are LottieFiles *Free for Personal Use*
assets, bundled as a default so the stage is never empty on first
visit. They are seeded into IndexedDB **only on the very first visit**
(guarded by a `localStorage` flag); from then on they behave like
ordinary user clips — you can delete them and they stay deleted across
reloads. For commercial use, replace them with Lottie files you have a
license to ship.