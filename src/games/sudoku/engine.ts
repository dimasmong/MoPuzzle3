import { SudokuLevel, SudokuCellState, SudokuMoveHistory } from './types';
import { getSudokuLevel } from './levels';
import { isBoardValid, getNextHint, isValidPlacement } from './solver';

export class SudokuEngine {
  private level: SudokuLevel;
  private cells: SudokuCellState[][] = [];
  private selectedRow: number = 0;
  private selectedCol: number = 0;
  private isNotesMode: boolean = false;
  private undoStack: SudokuMoveHistory[] = [];
  private redoStack: SudokuMoveHistory[] = [];
  private movesCount: number = 0;
  private hintsCount: number = 0;
  private mistakesCount: number = 0;
  private isCompleted: boolean = false;

  constructor(levelNum: number, savedState?: any) {
    this.level = getSudokuLevel(levelNum);
    this.initBoard(savedState);
  }

  private initBoard(savedState?: any): void {
    if (savedState && savedState.cells) {
      this.cells = savedState.cells.map((row: any[]) =>
        row.map((cell: any) => ({
          ...cell,
          notes: Array.isArray(cell.notes) ? [...cell.notes] : [],
        }))
      );
      this.movesCount = savedState.movesCount ?? 0;
      this.hintsCount = savedState.hintsCount ?? 0;
      this.mistakesCount = savedState.mistakesCount ?? 0;
      this.selectedRow = savedState.selectedRow ?? 0;
      this.selectedCol = savedState.selectedCol ?? 0;
      return;
    }

    this.cells = [];
    for (let r = 0; r < 9; r++) {
      const row: SudokuCellState[] = [];
      for (let c = 0; c < 9; c++) {
        const val = this.level.grid[r][c];
        row.push({
          row: r,
          col: c,
          value: val,
          isClue: val !== 0,
          notes: [],
          isError: false,
        });
      }
      this.cells.push(row);
    }
    this.checkErrors();
  }

  public getLevel(): SudokuLevel {
    return this.level;
  }

  public getCells(): SudokuCellState[][] {
    return this.cells;
  }

  public getSelectedPos(): { row: number; col: number } {
    return { row: this.selectedRow, col: this.selectedCol };
  }

  public setSelectedPos(row: number, col: number): void {
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      this.selectedRow = row;
      this.selectedCol = col;
    }
  }

  public toggleNotesMode(): boolean {
    this.isNotesMode = !this.isNotesMode;
    return this.isNotesMode;
  }

  public getIsNotesMode(): boolean {
    return this.isNotesMode;
  }

  public getMovesCount(): number {
    return this.movesCount;
  }

  public getHintsCount(): number {
    return this.hintsCount;
  }

  public getMistakesCount(): number {
    return this.mistakesCount;
  }

  public isWon(): boolean {
    return this.isCompleted;
  }

  public enterNumber(num: number): { success: boolean; isComplete: boolean; isError?: boolean } {
    if (this.isCompleted) return { success: false, isComplete: true };
    const cell = this.cells[this.selectedRow][this.selectedCol];
    if (cell.isClue) return { success: false, isComplete: false };

    if (this.isNotesMode) {
      const prevNotes = [...cell.notes];
      const idx = cell.notes.indexOf(num);
      let newNotes: number[];
      if (idx >= 0) {
        newNotes = cell.notes.filter((n) => n !== num);
      } else {
        newNotes = [...cell.notes, num].sort((a, b) => a - b);
      }
      cell.notes = newNotes;
      this.undoStack.push({
        row: this.selectedRow,
        col: this.selectedCol,
        prevValue: cell.value,
        newValue: cell.value,
        prevNotes,
        newNotes,
      });
      this.redoStack = [];
      return { success: true, isComplete: false };
    }

    const prevValue = cell.value;
    const prevNotes = [...cell.notes];

    if (prevValue === num) {
      // Toggling off the same number
      cell.value = 0;
    } else {
      cell.value = num;
      cell.notes = [];
      this.movesCount++;
    }

    this.undoStack.push({
      row: this.selectedRow,
      col: this.selectedCol,
      prevValue,
      newValue: cell.value,
      prevNotes,
      newNotes: cell.notes,
    });
    this.redoStack = [];

    const isWrong = cell.value !== 0 && cell.value !== this.level.solution[this.selectedRow][this.selectedCol];
    if (isWrong) {
      this.mistakesCount++;
    }

    this.checkErrors();
    const won = this.checkWin();
    return { success: true, isComplete: won, isError: isWrong };
  }

  public erase(): boolean {
    if (this.isCompleted) return false;
    const cell = this.cells[this.selectedRow][this.selectedCol];
    if (cell.isClue) return false;
    if (cell.value === 0 && cell.notes.length === 0) return false;

    this.undoStack.push({
      row: this.selectedRow,
      col: this.selectedCol,
      prevValue: cell.value,
      newValue: 0,
      prevNotes: [...cell.notes],
      newNotes: [],
    });
    this.redoStack = [];

    cell.value = 0;
    cell.notes = [];
    this.checkErrors();
    return true;
  }

  public undo(): boolean {
    if (this.isCompleted || this.undoStack.length === 0) return false;
    const move = this.undoStack.pop()!;
    const cell = this.cells[move.row][move.col];

    this.redoStack.push({
      row: move.row,
      col: move.col,
      prevValue: cell.value,
      newValue: move.prevValue,
      prevNotes: [...cell.notes],
      newNotes: [...move.prevNotes],
    });

    cell.value = move.prevValue;
    cell.notes = [...move.prevNotes];
    this.selectedRow = move.row;
    this.selectedCol = move.col;

    this.checkErrors();
    return true;
  }

  public redo(): boolean {
    if (this.isCompleted || this.redoStack.length === 0) return false;
    const move = this.redoStack.pop()!;
    const cell = this.cells[move.row][move.col];

    this.undoStack.push({
      row: move.row,
      col: move.col,
      prevValue: cell.value,
      newValue: move.newValue,
      prevNotes: [...cell.notes],
      newNotes: [...move.newNotes],
    });

    cell.value = move.newValue;
    cell.notes = [...move.newNotes];
    this.selectedRow = move.row;
    this.selectedCol = move.col;

    this.checkErrors();
    return true;
  }

  public applyHint(): { row: number; col: number; val: number; reason: string } | null {
    if (this.isCompleted) return null;
    const currentGrid = this.cells.map((row) => row.map((c) => c.value));
    const hint = getNextHint(currentGrid, this.level.solution);
    if (!hint) return null;

    this.hintsCount++;
    this.selectedRow = hint.row;
    this.selectedCol = hint.col;

    const cell = this.cells[hint.row][hint.col];
    this.undoStack.push({
      row: hint.row,
      col: hint.col,
      prevValue: cell.value,
      newValue: hint.val,
      prevNotes: [...cell.notes],
      newNotes: [],
    });
    this.redoStack = [];

    cell.value = hint.val;
    cell.notes = [];

    this.checkErrors();
    this.checkWin();
    return hint;
  }

  private checkErrors(): void {
    const grid = this.cells.map((row) => row.map((c) => c.value));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.cells[r][c];
        if (cell.value === 0) {
          cell.isError = false;
        } else {
          // A number is highlighted as an error if it conflicts with another cell in row/col/box or deviates from solution
          cell.isError = !isValidPlacement(grid, r, c, cell.value) || (!cell.isClue && cell.value !== this.level.solution[r][c]);
        }
      }
    }
  }

  private checkWin(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.cells[r][c].value !== this.level.solution[r][c]) {
          return false;
        }
      }
    }
    const currentGrid = this.cells.map((row) => row.map((c) => c.value));
    if (isBoardValid(currentGrid)) {
      this.isCompleted = true;
      return true;
    }
    return false;
  }

  public serialize(): any {
    return {
      cells: this.cells.map((row) =>
        row.map((c) => ({
          row: c.row,
          col: c.col,
          value: c.value,
          isClue: c.isClue,
          notes: [...c.notes],
          isError: c.isError,
        }))
      ),
      movesCount: this.movesCount,
      hintsCount: this.hintsCount,
      mistakesCount: this.mistakesCount,
      selectedRow: this.selectedRow,
      selectedCol: this.selectedCol,
    };
  }
}
