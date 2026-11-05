# Changelog

All notable changes to **MoPuzzle 3** are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
