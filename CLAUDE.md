# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start               # dev server at http://localhost:4200
npm run build           # production build → dist/before-docker/browser/
npm run test:ci         # run unit/integration tests once (CI mode, no watch)
npm test                # run tests in watch mode
npm run test:coverage   # run tests with coverage
npm run lint            # ESLint on src/
npm run e2e             # Playwright e2e (requires dev server or CI=true)
npm run e2e:ui          # Playwright interactive UI
npm run playwright:install  # install Playwright browsers (one-time)
```

Tests run via Angular's `@angular/build:unit-test` builder (Vitest + JSDOM). **Do not run `npx vitest` directly** — the Angular builder injects Vitest globals (`describe`, `it`, `vi`, `expect`). Always use `ng test` / `npm test`.

## Architecture

**Angular 21 standalone, zoneless, Signals-based state machine.**

- **`GameService`** (`src/app/services/game.service.ts`) — single source of truth. One `signal<GameState>` with computed projections (`phase`, `leftTech`, `rightTech`, `score`, `lives`, `playedTechs`). `startGame(categoryId)` initializes state and calls `_loadNextRound()`. `guess(pickedLeft)` evaluates correctness, decrements lives, appends played techs, advances to next round or game-over.
- **`WikipediaService`** — fetches `https://en.wikipedia.org/api/rest_v1/page/summary/{title}`, caches results in a `Map` with `shareReplay(1)`.
- **`GamePhase`** enum — `Loading | Playing | RoundResult | GameOver`.
- **Route**: `/` → `HomeComponent`, `/game/:categoryId` → `GameComponent` (both lazy-loaded).

### Component hierarchy
```
AppComponent (router-outlet only)
├── HomeComponent        — dark hero, category tiles
└── GameComponent        — flex-column 100vh layout
    ├── ScoreDisplay      — position: fixed, top-0, backdrop-blur
    ├── .panels (flex-row)
    │   ├── TechCardComponent (left)  — full-bleed bg-image, glassmorphism button
    │   ├── .vs-badge
    │   └── TechCardComponent (right)
    ├── TimelineComponent — flex: 0 0 88px at bottom, fixed 1965–2020 scale
    ├── ResultOverlayComponent  — position: fixed, inset: 0, z-index: 200
    └── .gameover-overlay       — position: fixed, inset: 0, z-index: 200
```

### Key patterns
- **Signal inputs/outputs**: `input.required<T>()`, `input(default)`, `output<T>()`
- **Zoneless**: `provideZonelessChangeDetection()` — not `provideExperimentalZonelessChangeDetection()` (removed) or `provideZoneChangeDetection()` (throws NG0908)
- **Template control flow**: `@if`, `@for (x of items; track $index)`, `@switch/@case`
- **Testing signal inputs**: `fixture.componentRef.setInput('name', value)`
- **Testing async signals**: `await vi.waitFor(() => expect(...).toBe(...))`

### BD/AD date system (`toDockerDate(year)`)
```
delta = 2013 - year
delta > 0  → "{delta} BD"   (Before Docker)
delta === 0 → "The Year of Docker"
delta < 0  → "{|delta|} AD" (After Docker)
```

### Lives system
- Start: 3 lives. Wrong guess → lives−1. `lives === 0` → `GamePhase.GameOver`.
- `playedTechs` accumulates both techs from each completed round for the timeline.

### Adding a category
1. Add `CategoryConfig` to `src/app/data/categories.data.ts`
2. Create `src/app/data/{id}.data.ts` with `Technology[]`
3. Add one entry to `CATEGORY_DATA_MAP` in `game.service.ts`

## Angular Material
Uses M3 prebuilt theme `@angular/material/prebuilt-themes/indigo-pink.css`. Do not use `mat.$indigo-palette` — it does not exist in M3 SCSS API.

## Style
Prettier config is in `package.json`: `printWidth: 100`, `singleQuote: true`, Angular HTML parser for `.html` files. Always dark design (`background: #0d0d0f`).
