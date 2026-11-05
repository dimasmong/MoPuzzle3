import { describe, it, expect } from 'vitest';
import { ALL_GAMES } from '../src/core/types';
import { SUDOKU_LEVELS } from '../src/games/sudoku/levels';
import { MINESWEEPER_LEVELS } from '../src/games/minesweeper/levels';
import { PIPE_LEVELS } from '../src/games/pipe-connect/levels';
import { BOX_PUSHER_LEVELS } from '../src/games/box-pusher/levels';
import { MEMORY_LEVELS } from '../src/games/memory-flip/levels';
import { LIGHTS_OUT_LEVELS } from '../src/games/lights-out/levels';

describe('Global 120 Playable Levels Audit', () => {
  it('contains exactly six independent game modes', () => {
    expect(ALL_GAMES.length).toBe(6);
  });

  it('contains at least 20 validated levels per game', () => {
    expect(SUDOKU_LEVELS.length).toBeGreaterThanOrEqual(20);
    expect(MINESWEEPER_LEVELS.length).toBeGreaterThanOrEqual(20);
    expect(PIPE_LEVELS.length).toBeGreaterThanOrEqual(20);
    expect(BOX_PUSHER_LEVELS.length).toBeGreaterThanOrEqual(20);
    expect(MEMORY_LEVELS.length).toBeGreaterThanOrEqual(20);
    expect(LIGHTS_OUT_LEVELS.length).toBeGreaterThanOrEqual(20);
  });

  it('totals at least 120 verified playable levels', () => {
    const total =
      SUDOKU_LEVELS.length +
      MINESWEEPER_LEVELS.length +
      PIPE_LEVELS.length +
      BOX_PUSHER_LEVELS.length +
      MEMORY_LEVELS.length +
      LIGHTS_OUT_LEVELS.length;

    expect(total).toBe(120);
  });
});
