import { describe, it, expect } from 'vitest';
import { SUDOKU_LEVELS, getSudokuLevel } from '../src/games/sudoku/levels';
import { countSolutions, isBoardValid, solveSudoku } from '../src/games/sudoku/solver';
import { SudokuEngine } from '../src/games/sudoku/engine';

describe('Sudoku Engine & Level Verification', () => {
  it('should have exactly 20 levels', () => {
    expect(SUDOKU_LEVELS.length).toBe(20);
  });

  it('every level has a unique solution and valid precomputed solution', () => {
    for (const level of SUDOKU_LEVELS) {
      expect(level.grid.length).toBe(9);
      expect(level.solution.length).toBe(9);
      expect(isBoardValid(level.solution)).toBe(true);

      // Verify solver generates matching solution
      const solved = solveSudoku(level.grid);
      expect(solved).not.toBeNull();
      expect(solved).toEqual(level.solution);

      // Verify unique solution
      const solutions = countSolutions(level.grid, 2);
      expect(solutions).toBe(1);
    }
  });

  it('SudokuEngine handles user moves, undo, and completion', () => {
    const engine = new SudokuEngine(1);
    const level = getSudokuLevel(1);

    // Find an empty cell
    let targetR = -1;
    let targetC = -1;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (level.grid[r][c] === 0) {
          targetR = r;
          targetC = c;
          break;
        }
      }
      if (targetR !== -1) break;
    }

    expect(targetR).toBeGreaterThanOrEqual(0);
    engine.setSelectedPos(targetR, targetC);

    const correctVal = level.solution[targetR][targetC];
    const wrongVal = correctVal === 9 ? 1 : correctVal + 1;

    // Test entering wrong value
    const wrongRes = engine.enterNumber(wrongVal);
    expect(wrongRes.success).toBe(true);
    expect(wrongRes.isError).toBe(true);

    // Test undo
    expect(engine.undo()).toBe(true);
    expect(engine.getCells()[targetR][targetC].value).toBe(0);

    // Test notes mode
    engine.toggleNotesMode();
    expect(engine.getIsNotesMode()).toBe(true);
    engine.enterNumber(3);
    expect(engine.getCells()[targetR][targetC].notes).toContain(3);
    engine.toggleNotesMode();

    // Test hint
    const hint = engine.applyHint();
    expect(hint).not.toBeNull();
  });
});
