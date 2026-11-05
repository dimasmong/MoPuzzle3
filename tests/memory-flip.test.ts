import { describe, it, expect } from 'vitest';
import { MEMORY_LEVELS } from '../src/games/memory-flip/levels';
import { MemoryEngine } from '../src/games/memory-flip/engine';

describe('Memory Flip Engine & Level Verification', () => {
  it('should have exactly 20 levels', () => {
    expect(MEMORY_LEVELS.length).toBe(20);
  });

  it('every level has exact matching pairs and is solvable', () => {
    for (const lvl of MEMORY_LEVELS) {
      const engine = new MemoryEngine(lvl.level);
      const cards = engine.getCards();

      expect(cards.length).toBe(lvl.pairs * 2);

      // Verify each symbol appears exactly twice
      const counts: Record<string, number> = {};
      for (const c of cards) {
        counts[c.symbol] = (counts[c.symbol] || 0) + 1;
      }

      for (const count of Object.values(counts)) {
        expect(count).toBe(2);
      }

      // Solve the deck by matching pairs
      const symbolMap: Record<string, number[]> = {};
      for (const c of cards) {
        if (!symbolMap[c.symbol]) symbolMap[c.symbol] = [];
        symbolMap[c.symbol].push(c.id);
      }

      for (const ids of Object.values(symbolMap)) {
        engine.flipCard(ids[0]);
        const res = engine.flipCard(ids[1]);
        expect(res.isMatch).toBe(true);
      }

      expect(engine.isWon()).toBe(true);
      expect(engine.getScore()).toBeGreaterThan(0);
    }
  });

  it('prevents illegal clicks (same card, animation lock)', () => {
    const engine = new MemoryEngine(1);
    const firstRes = engine.flipCard(0);
    expect(firstRes.flipped).toBe(true);

    // Clicking same card again fails
    const dupRes = engine.flipCard(0);
    expect(dupRes.flipped).toBe(false);
  });
});
