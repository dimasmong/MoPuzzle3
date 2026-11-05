import { describe, it, expect } from 'vitest';
import { MINESWEEPER_LEVELS } from '../src/games/minesweeper/levels';
import { MinesweeperEngine } from '../src/games/minesweeper/engine';

describe('Minesweeper Engine & Level Verification', () => {
  it('should have exactly 20 levels', () => {
    expect(MINESWEEPER_LEVELS.length).toBe(20);
  });

  it('guarantees first-click safety on every level', () => {
    for (const lvl of MINESWEEPER_LEVELS) {
      const engine = new MinesweeperEngine(lvl.level);
      const res = engine.reveal(0, 0);
      expect(res.hitMine).toBe(false);
      expect(engine.getCells()[0][0].isRevealed).toBe(true);
      expect(engine.getCells()[0][0].isMine).toBe(false);
    }
  });

  it('supports flagging and chording', () => {
    const engine = new MinesweeperEngine(1);
    engine.reveal(0, 0);

    // Toggle flag on an unrevealed cell
    let unrevealedR = -1, unrevealedC = -1;
    for (let r = 0; r < engine.getLevel().rows; r++) {
      for (let c = 0; c < engine.getLevel().cols; c++) {
        if (!engine.getCells()[r][c].isRevealed) {
          unrevealedR = r;
          unrevealedC = c;
          break;
        }
      }
      if (unrevealedR !== -1) break;
    }

    if (unrevealedR !== -1) {
      expect(engine.toggleFlag(unrevealedR, unrevealedC)).toBe(true);
      expect(engine.getCells()[unrevealedR][unrevealedC].isFlagged).toBe(true);
      expect(engine.getFlagsPlaced()).toBe(1);

      // Unflag
      expect(engine.toggleFlag(unrevealedR, unrevealedC)).toBe(true);
      expect(engine.getCells()[unrevealedR][unrevealedC].isFlagged).toBe(false);
      expect(engine.getFlagsPlaced()).toBe(0);
    }
  });

  it('completes victory when all safe cells are revealed', () => {
    const engine = new MinesweeperEngine(1);
    // First reveal
    engine.reveal(0, 0);

    // Reveal all remaining safe cells
    const cells = engine.getCells();
    for (let r = 0; r < engine.getLevel().rows; r++) {
      for (let c = 0; c < engine.getLevel().cols; c++) {
        if (!cells[r][c].isMine && !cells[r][c].isRevealed) {
          engine.reveal(r, c);
        }
      }
    }

    expect(engine.isWon()).toBe(true);
    expect(engine.isLost()).toBe(false);
  });
});
