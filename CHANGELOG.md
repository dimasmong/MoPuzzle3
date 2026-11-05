# Changelog

All notable changes to **MoPuzzle 3** are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-11-05

### Changed
- **Brand Identity Redesign — Puzzle Six Emblem**:
  - Replaced the legacy generic "M3" letter monogram with the original, professionally designed **Puzzle Six Emblem**.
  - Cohesive geometric emblem uniting all six logic games in an interconnected, balanced puzzle ring:
    - **Sudoku**: 2×2 number-grid matrix geometry.
    - **Pipe Connect**: Sleek curved conduit with flowing connection node.
    - **Lights Out**: Radiant 4-point illuminated star tile with warm gold accents.
    - **Memory Flip**: Dual overlapping, angled card silhouettes.
    - **Box Pusher**: Movable crate cube with corner target bracket.
    - **Minesweeper**: Deduction flag beacon with safe coordinate base.
  - Balanced brand palette: Primary `#243A73`, Accent `#A1E3F9`, with subtle game-specific accents (cool blue, teal, warm gold, soft purple, emerald, coral).
  - High-contrast central logic core hub linking all six segments.
- **Responsive Logo Variants & Required Assets**:
  - Master vector SVG (`public/icons/logo.svg`, `public/icons/logo-dark.svg`, `public/icons/logo-light.svg`).
  - Streamlined compact silhouette for small surfaces (`public/favicon.svg`, `public/favicon.ico`).
  - High-DPI raster assets generated: PNG 16×16, 32×32, 64×64, 180×180 (Apple Touch Icon), 192×192, 512×512, and 512×512 Maskable PWA icon.
  - 1200×630 Open Graph / Twitter social preview image (`public/social-preview.png`).
- **Cache & PWA Refresh**:
  - Incremented Service Worker cache version to `mopuzzle3-v1.0.1`.
  - Updated Web App Manifest with maskable and standard PWA icon declarations.
  - Preserved all player LocalStorage progress and gameplay saves.

### Fixed
- **Sudoku Light Mode Contrast & Visibility**:
  - Replaced translucent cell overlays with 100% opaque, high-contrast backgrounds across all cell states in both Light and Dark themes.
  - Light mode: Clue background `#E8F0FB` with deep navy digits `#243A73`, player digits `#2563EB`, selected `#CBEFFA`, highlights `#F0F5FD`, errors `#FEE2E2` with `#B91C1C`.

## [1.0.0] - 2026-11-05

### Added
- **Six Complete Browser Games**:
  - **Sudoku**: 9×9 puzzle with real backtrack solver, pencil notes, error checking, hints, and 20 verified unique levels across 4 difficulties (Easy, Medium, Hard, Expert).
  - **Minesweeper**: Safe first-click generation, recursive flood fill, flag mode, chording, adjacent mine counts, and 20 progressive challenge levels.
  - **Pipe Connect**: 90-degree rotating pipe network puzzle, fluid flow animation, leak-free validation, and 20 verified solvable levels from 3×3 to 5×5.
  - **Box Pusher**: Sokoban crate-pushing warehouse logic puzzle with BFS state-space solver verification, deadlock prevention, undo/redo, touch D-Pad, and 20 solvable levels.
  - **Memory Flip**: Symbol-matching memory test with 3D flip animation, combo multiplier, scoring system, and 20 challenges from 2×2 up to 4×5.
  - **Lights Out**: GF(2) linear algebra matrix light switch puzzle with Gaussian elimination solver, hints, and 20 solvable boards from 3×3 to 5×5.
- **Total Level Count**: Exactly 120 verified solvable playable levels (20 per game).
- **MoPuzzle 1 Design Language**: Faithful adaptation of the MoPuzzle 1 design tokens, typography, header, mobile bottom navigation, modals, toasts, and buttons.
- **Themes**: Light theme (`#F5F8FF` background, `#243A73` primary, `#A1E3F9` accent) and Dark theme (`#101827` background, `#1E2A3D` surface).
- **Localization**: Full English and Indonesian language translations.
- **Audio Engine**: Synthesized Web Audio API sound effects and optional calm procedural background chords without external assets.
- **Shared Progression Lifecycle**: Robust `IDLE -> PLAYING -> COMPLETING -> COMPLETED -> LOADING_NEXT -> PLAYING` finite state machine preventing duplicate next-level triggers and modal re-emergence.
- **Storage & Autosave**: Versioned LocalStorage schema (`mopuzzle3_save_data`) with corruption recovery and independent per-game progression.
- **Achievements**: 24 distinct achievements covering milestones, hint-free completions, speed runs, and campaign mastery.
- **PWA & Offline Support**: Web App Manifest and versioned Service Worker with network-first navigation and cache-first static assets.
- **Testing**: Automated Vitest test suite and Playwright end-to-end tests covering all 120 levels, solvers, navigation, and mobile viewports.
