import { PipeLevel, PipeCellState } from './types';
import { getPipeLevel } from './levels';
import { simulateWaterFlow, getOpenings } from './solver';

export interface PipeMoveRecord {
  row: number;
  col: number;
  prevRotation: number;
  newRotation: number;
}

export class PipeEngine {
  private level: PipeLevel;
  private cells: PipeCellState[][] = [];
  private undoStack: PipeMoveRecord[] = [];
  private redoStack: PipeMoveRecord[] = [];
  private movesCount: number = 0;
  private hintsCount: number = 0;
  private isWonState: boolean = false;

  constructor(levelNum: number, savedState?: any) {
    this.level = getPipeLevel(levelNum);
    this.initBoard(savedState);
  }

  private initBoard(savedState?: any): void {
    if (savedState && savedState.cells) {
      this.cells = savedState.cells.map((row: any[]) =>
        row.map((c: any) => ({
          ...c,
          openings: getOpenings(c.type, c.rotation),
        }))
      );
      this.movesCount = savedState.movesCount ?? 0;
      this.hintsCount = savedState.hintsCount ?? 0;
      this.updateFlow();
      return;
    }

    this.cells = [];
    for (let r = 0; r < this.level.rows; r++) {
      const row: PipeCellState[] = [];
      for (let c = 0; c < this.level.cols; c++) {
        const def = this.level.cells[r][c];
        row.push({
          row: r,
          col: c,
          type: def.type,
          rotation: def.rotation,
          openings: getOpenings(def.type, def.rotation),
          isWatered: false,
          isFixed: def.isFixed ?? false,
        });
      }
      this.cells.push(row);
    }
    this.updateFlow();
  }

  public getLevel(): PipeLevel {
    return this.level;
  }

  public getCells(): PipeCellState[][] {
    return this.cells;
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

  public rotateCell(row: number, col: number): { success: boolean; isComplete: boolean } {
    if (this.isWonState) return { success: false, isComplete: true };
    const cell = this.cells[row][col];
    if (cell.type === 'empty' || cell.isFixed) {
      return { success: false, isComplete: false };
    }

    const prevRot = cell.rotation;
    const newRot = (prevRot + 1) % 4;

    cell.rotation = newRot;
    cell.openings = getOpenings(cell.type, newRot);
    this.movesCount++;

    this.undoStack.push({
      row,
      col,
      prevRotation: prevRot,
      newRotation: newRot,
    });
    this.redoStack = [];

    this.updateFlow();
    return { success: true, isComplete: this.isWonState };
  }

  public undo(): boolean {
    if (this.isWonState || this.undoStack.length === 0) return false;
    const move = this.undoStack.pop()!;
    const cell = this.cells[move.row][move.col];

    this.redoStack.push({
      row: move.row,
      col: move.col,
      prevRotation: cell.rotation,
      newRotation: move.prevRotation,
    });

    cell.rotation = move.prevRotation;
    cell.openings = getOpenings(cell.type, move.prevRotation);
    this.updateFlow();
    return true;
  }

  public redo(): boolean {
    if (this.isWonState || this.redoStack.length === 0) return false;
    const move = this.redoStack.pop()!;
    const cell = this.cells[move.row][move.col];

    this.undoStack.push({
      row: move.row,
      col: move.col,
      prevRotation: cell.rotation,
      newRotation: move.newRotation,
    });

    cell.rotation = move.newRotation;
    cell.openings = getOpenings(cell.type, move.newRotation);
    this.updateFlow();
    return true;
  }

  public applyHint(): { row: number; col: number; targetRot: number } | null {
    if (this.isWonState) return null;

    // Find any pipe whose rotation does not match solution
    for (let r = 0; r < this.level.rows; r++) {
      for (let c = 0; c < this.level.cols; c++) {
        const cell = this.cells[r][c];
        const targetRot = this.level.solutionRotations[r][c];
        if (cell.type !== 'empty' && cell.rotation !== targetRot) {
          this.hintsCount++;
          const prevRot = cell.rotation;
          cell.rotation = targetRot;
          cell.openings = getOpenings(cell.type, targetRot);

          this.undoStack.push({
            row: r,
            col: c,
            prevRotation: prevRot,
            newRotation: targetRot,
          });
          this.redoStack = [];

          this.updateFlow();
          return { row: r, col: c, targetRot };
        }
      }
    }
    return null;
  }

  private updateFlow(): void {
    const result = simulateWaterFlow(this.cells);
    this.isWonState = result.isWon;
  }

  public serialize(): any {
    return {
      cells: this.cells.map((row) =>
        row.map((c) => ({
          row: c.row,
          col: c.col,
          type: c.type,
          rotation: c.rotation,
          isFixed: c.isFixed,
        }))
      ),
      movesCount: this.movesCount,
      hintsCount: this.hintsCount,
      isWonState: this.isWonState,
    };
  }
}
