import { describe, it, expect } from 'vitest';
import { PIPE_LEVELS } from '../src/games/pipe-connect/levels';
import { PipeEngine } from '../src/games/pipe-connect/engine';

describe('Pipe Connect Engine & Level Verification', () => {
  it('should have exactly 20 levels', () => {
    expect(PIPE_LEVELS.length).toBe(20);
  });

  it('all 20 levels are solvable under their solutionRotations', () => {
    for (const lvl of PIPE_LEVELS) {
      const engine = new PipeEngine(lvl.level);
      // Verify initial scrambled state is not won
      expect(engine.isWon()).toBe(false);

      // Rotate each cell to its solution rotation
      for (let r = 0; r < lvl.rows; r++) {
        for (let c = 0; c < lvl.cols; c++) {
          const targetRot = lvl.solutionRotations[r][c];
          while (engine.getCells()[r][c].rotation !== targetRot) {
            engine.rotateCell(r, c);
          }
        }
      }

      // Must be won now!
      expect(engine.isWon()).toBe(true);
    }
  });

  it('supports undo and hint', () => {
    const engine = new PipeEngine(1);
    const initialRot = engine.getCells()[0][0].rotation;

    engine.rotateCell(0, 0);
    expect(engine.getCells()[0][0].rotation).toBe((initialRot + 1) % 4);

    expect(engine.undo()).toBe(true);
    expect(engine.getCells()[0][0].rotation).toBe(initialRot);

    const hint = engine.applyHint();
    expect(hint).not.toBeNull();
  });
});
