import { describe, it, expect } from 'vitest';
import { LIGHTS_OUT_LEVELS } from '../src/games/lights-out/levels';
import { LightsOutEngine } from '../src/games/lights-out/engine';
import { solveLightsOutGF2 } from '../src/games/lights-out/solver';

describe('Lights Out Engine & Level Verification', () => {
  it('should have exactly 20 levels', () => {
    expect(LIGHTS_OUT_LEVELS.length).toBe(20);
  });

  it('all 20 levels are solvable using GF(2) solver', () => {
    for (const lvl of LIGHTS_OUT_LEVELS) {
      const engine = new LightsOutEngine(lvl.level);
      expect(engine.isWon()).toBe(false);

      // Solve with GF(2)
      const sol = solveLightsOutGF2(engine.getGrid());
      expect(sol).not.toBeNull();
      expect(sol!.length).toBeGreaterThan(0);

      // Execute solution moves
      for (const [r, c] of sol!) {
        engine.toggle(r, c);
      }

      expect(engine.isWon()).toBe(true);
    }
  });

  it('supports toggle, undo, redo, and hints', () => {
    const engine = new LightsOutEngine(1);
    const startGrid = engine.getGrid().map((r) => [...r]);

    engine.toggle(0, 0);
    expect(engine.getGrid()).not.toEqual(startGrid);
    expect(engine.getMovesCount()).toBe(1);

    expect(engine.undo()).toBe(true);
    expect(engine.getGrid()).toEqual(startGrid);
    expect(engine.getMovesCount()).toBe(0);

    expect(engine.redo()).toBe(true);
    expect(engine.getMovesCount()).toBe(1);

    // Hint
    const hint = engine.applyHint();
    expect(hint).not.toBeNull();
  });
});
