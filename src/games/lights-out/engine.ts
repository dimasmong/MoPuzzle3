import { LightsOutLevel } from './types';
import { getLightsOutLevel } from './levels';
import { applyToggle, solveLightsOutGF2 } from './solver';

export class LightsOutEngine {
  private level: LightsOutLevel;
  private grid: boolean[][] = [];
  private undoStack: [number, number][] = [];
  private redoStack: [number, number][] = [];
  private movesCount: number = 0;
  private hintsCount: number = 0;
  private isWonState: boolean = false;

  constructor(levelNum: number, savedState?: any) {
    this.level = getLightsOutLevel(levelNum);
    this.initBoard(savedState);
  }

  private initBoard(savedState?: any): void {
    if (savedState && savedState.grid) {
      this.grid = savedState.grid.map((r: boolean[]) => [...r]);
      this.movesCount = savedState.movesCount ?? 0;
      this.hintsCount = savedState.hintsCount ?? 0;
      this.isWonState = this.checkWin();
      return;
    }

    this.grid = this.level.grid.map((r) => [...r]);
    this.isWonState = this.checkWin();
  }

  public getLevel(): LightsOutLevel {
    return this.level;
  }

  public getGrid(): boolean[][] {
    return this.grid;
  }

  public getSize(): number {
    return this.level.size;
  }

  public getMovesCount(): number {
    return this.movesCount;
  }

  public getHintsCount(): number {
    return this.hintsCount;
  }

  public isWon(): boolean {
    return this.isWonState;
  }

  public toggle(row: number, col: number): { success: boolean; isComplete: boolean } {
    if (this.isWonState) return { success: false, isComplete: true };

    applyToggle(this.grid, row, col);
    this.movesCount++;
    this.undoStack.push([row, col]);
    this.redoStack = [];

    const won = this.checkWin();
    return { success: true, isComplete: won };
  }

  public undo(): boolean {
    if (this.isWonState || this.undoStack.length === 0) return false;
    const [r, c] = this.undoStack.pop()!;
    applyToggle(this.grid, r, c);
    this.redoStack.push([r, c]);
    this.movesCount--;
    this.isWonState = this.checkWin();
    return true;
  }

  public redo(): boolean {
    if (this.isWonState || this.redoStack.length === 0) return false;
    const [r, c] = this.redoStack.pop()!;
    applyToggle(this.grid, r, c);
    this.undoStack.push([r, c]);
    this.movesCount++;
    this.isWonState = this.checkWin();
    return true;
  }

  public applyHint(): [number, number] | null {
    if (this.isWonState) return null;

    const sol = solveLightsOutGF2(this.grid);
    if (sol && sol.length > 0) {
      this.hintsCount++;
      const [hr, hc] = sol[0];
      this.toggle(hr, hc);
      return [hr, hc];
    }
    return null;
  }

  private checkWin(): boolean {
    for (let r = 0; r < this.level.size; r++) {
      for (let c = 0; c < this.level.size; c++) {
        if (this.grid[r][c]) {
          return false;
        }
      }
    }
    this.isWonState = true;
    return true;
  }

  public serialize(): any {
    return {
      grid: this.grid.map((r) => [...r]),
      movesCount: this.movesCount,
      hintsCount: this.hintsCount,
    };
  }
}
