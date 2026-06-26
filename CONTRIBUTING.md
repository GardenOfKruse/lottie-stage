# Contributing

Thanks for taking a look! This is a small demo, so the workflow is
intentionally lightweight.

## Running locally

```bash
pnpm install
pnpm dev
pnpm test          # one-shot Vitest run
pnpm test:watch    # watch mode while you develop
pnpm build         # production build
```

Node 20+ and pnpm 9+ are expected.

## Code style

- TypeScript everywhere. Prefer explicit types on public APIs.
- React functional components only.
- CSS Modules for component styles (`Foo.module.css` next to `Foo.tsx`).
- Comments and identifiers in **English**.
- Keep the architecture in the spec:
  - `src/lib/` holds **pure** functions only — no React, no DOM, no IO.
    These are the only modules covered by unit tests.
  - `src/hooks/` holds React hooks.
  - `src/components/` holds React components.
- Do not introduce a UI component library, a state management library,
  or a carousel/Swiper-style library — the whole point is the
  hand-rolled Cover Flow geometry.

## Opening a pull request

1. Fork the repo and create a topic branch.
2. Make your change. If you touch `src/lib/geometry.ts` or
   `src/lib/lottie-validate.ts`, run `pnpm test` before pushing.
3. Run `pnpm build` to make sure TypeScript and Vite are happy.
4. Open a PR with a short description of **what** changed and **why**.
   Screenshots are welcome for any visual change.

## Reporting issues

Open an issue with:

- What you expected / what happened.
- Browser, OS, and the Lottie file (if relevant).
- Console output if there is any.

## Replacing the bundled samples

The three files under `src/samples/` are LottieFiles *Free for Personal
Use* assets. To change the default set:

1. Replace one or more of the files in `src/samples/`.
2. Edit `BUILTIN_SAMPLES` in `src/hooks/useLottieStore.ts` so the
   filenames match the new files (the order in the array is the order
   they appear on the stage).
3. Clear your browser's IndexedDB and `localStorage` to re-seed:
   the app only seeds once, gated on `localStorage.getItem('lottie-stage.seeded.v1')`.

The source code is MIT-licensed; the bundled Lottie animations are
licensed separately under LottieFiles *Free for Personal Use*.