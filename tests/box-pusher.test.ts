import { describe, it, expect } from 'vitest';
import { BOX_PUSHER_LEVELS } from '../src/games/box-pusher/levels';
import { BoxPusherEngine } from '../src/games/box-pusher/engine';
import { solveSokoban } from '../src/games/box-pusher/solver';

describe('Box Pusher Engine & Level Verification', () => {
  it('should have exactly 20 levels', () => {
    expect(BOX_PUSHER_LEVELS.length).toBe(20);
  });

  it('all 20 levels are solvable by BFS state-space solver', () => {
    for (const lvl of BOX_PUSHER_LEVELS) {
      const sol = solveSokoban(lvl, 40000);
      expect(sol).not.toBeNull();
      expect(sol!.length).toBeGreaterThan(0);

      // Play the solution in the engine
      const engine = new BoxPusherEngine(lvl.level);
      expect(engine.isWon()).toBe(false);

      for (const dir of sol!) {
        const res = engine.move(dir);
        expect(res.success).toBe(true);
      }

      expect(engine.isWon()).toBe(true);
    }
  });

  it('supports move, push, and undo', () => {
    const engine = new BoxPusherEngine(1);
    const startPlayer = [...engine.getPlayerPos()];

    // Move towards box and push
    const res = engine.move('right');
    expect(res.success).toBe(true);
    expect(engine.getStepsCount()).toBe(1);

    expect(engine.undo()).toBe(true);
    expect(engine.getPlayerPos()).toEqual(startPlayer);
    expect(engine.getStepsCount()).toBe(0);
  });
});
