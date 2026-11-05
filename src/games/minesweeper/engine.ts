import { MinesweeperLevel, MinesweeperCellState } from './types';
import { getMinesweeperLevel } from './levels';

export class MinesweeperEngine {
  private level: MinesweeperLevel;
  private cells: MinesweeperCellState[][] = [];
  private isFirstClick: boolean = true;
  private isGameOver: boolean = false;
  private isWonState: boolean = false;
  private movesCount: number = 0;
  private flagsPlaced: number = 0;

  constructor(levelNum: number, savedState?: any) {
    this.level = getMinesweeperLevel(levelNum);
    this.initBoard(savedState);
  }

  private initBoard(savedState?: any): void {
    if (savedState && savedState.cells) {
      this.cells = savedState.cells;
      this.isFirstClick = savedState.isFirstClick ?? false;
      this.isGameOver = savedState.isGameOver ?? false;
      this.isWonState = savedState.isWonState ?? false;
      this.movesCount = savedState.movesCount ?? 0;
      this.flagsPlaced = savedState.flagsPlaced ?? 0;
      return;
    }

    this.cells = [];
    for (let r = 0; r < this.level.rows; r++) {
      const row: MinesweeperCellState[] = [];
      for (let c = 0; c < this.level.cols; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        });
      }
      this.cells.push(row);
    }
  }

  public getLevel(): MinesweeperLevel {
    return this.level;
  }

  public getCells(): MinesweeperCellState[][] {
    return this.cells;
  }

  public getMovesCount(): number {
    return this.movesCount;
  }

  public getFlagsPlaced(): number {
    return this.flagsPlaced;
  }

  public getMinesRemaining(): number {
    return this.level.mines - this.flagsPlaced;
  }

  public isLost(): boolean {
    return this.isGameOver;
  }

  public isWon(): boolean {
    return this.isWonState;
  }

  private plantMines(safeR: number, safeC: number): void {
    let planted = 0;
    while (planted < this.level.mines) {
      const r = Math.floor(Math.random() * this.level.rows);
      const c = Math.floor(Math.random() * this.level.cols);
      // Safe zone: never plant on safeR, safeC, and if small board, avoid 3x3 surrounding
      const isStartCell = r === safeR && c === safeC;
      const isNeighbor = Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1;
      const allowNeighbor = this.level.rows * this.level.cols - 9 < this.level.mines;

      if (!this.cells[r][c].isMine && !isStartCell && (allowNeighbor || !isNeighbor)) {
        this.cells[r][c].isMine = true;
        planted++;
      }
    }

    // Compute adjacent counts
    for (let r = 0; r < this.level.rows; r++) {
      for (let c = 0; c < this.level.cols; c++) {
        if (this.cells[r][c].isMine) {
          this.cells[r][c].adjacentMines = -1;
          continue;
        }
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < this.level.rows &&
              nc >= 0 &&
              nc < this.level.cols &&
              this.cells[nr][nc].isMine
            ) {
              count++;
            }
          }
        }
        this.cells[r][c].adjacentMines = count;
      }
    }
  }

  public reveal(row: number, col: number): { hitMine: boolean; isComplete: boolean } {
    if (this.isGameOver || this.isWonState) return { hitMine: false, isComplete: this.isWonState };
    const cell = this.cells[row][col];
    if (cell.isRevealed || cell.isFlagged) return { hitMine: false, isComplete: false };

    if (this.isFirstClick) {
      this.plantMines(row, col);
      this.isFirstClick = false;
    }

    this.movesCount++;

    if (cell.isMine) {
      cell.isRevealed = true;
      cell.isExploded = true;
      this.isGameOver = true;
      this.revealAllMines();
      return { hitMine: true, isComplete: false };
    }

    this.floodReveal(row, col);
    const won = this.checkWin();
    return { hitMine: false, isComplete: won };
  }

  private floodReveal(r: number, c: number): void {
    const cell = this.cells[r][c];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;

    if (cell.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < this.level.rows && nc >= 0 && nc < this.level.cols) {
            this.floodReveal(nr, nc);
          }
        }
      }
    }
  }

  public toggleFlag(row: number, col: number): boolean {
    if (this.isGameOver || this.isWonState) return false;
    const cell = this.cells[row][col];
    if (cell.isRevealed) return false;

    cell.isFlagged = !cell.isFlagged;
    if (cell.isFlagged) {
      this.flagsPlaced++;
    } else {
      this.flagsPlaced--;
    }
    return true;
  }

  public chord(row: number, col: number): { hitMine: boolean; isComplete: boolean } {
    if (this.isGameOver || this.isWonState) return { hitMine: false, isComplete: this.isWonState };
    const cell = this.cells[row][col];
    if (!cell.isRevealed || cell.adjacentMines <= 0) {
      return { hitMine: false, isComplete: false };
    }

    let flagCount = 0;
    const toReveal: [number, number][] = [];

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < this.level.rows && nc >= 0 && nc < this.level.cols) {
          const neighbor = this.cells[nr][nc];
          if (neighbor.isFlagged) flagCount++;
          else if (!neighbor.isRevealed) toReveal.push([nr, nc]);
        }
      }
    }

    if (flagCount !== cell.adjacentMines || toReveal.length === 0) {
      return { hitMine: false, isComplete: false };
    }

    this.movesCount++;
    let hitMine = false;

    for (const [nr, nc] of toReveal) {
      const neighbor = this.cells[nr][nc];
      if (neighbor.isMine) {
        neighbor.isRevealed = true;
        neighbor.isExploded = true;
        hitMine = true;
      } else {
        this.floodReveal(nr, nc);
      }
    }

    if (hitMine) {
      this.isGameOver = true;
      this.revealAllMines();
      return { hitMine: true, isComplete: false };
    }

    const won = this.checkWin();
    return { hitMine: false, isComplete: won };
  }

  private revealAllMines(): void {
    for (let r = 0; r < this.level.rows; r++) {
      for (let c = 0; c < this.level.cols; c++) {
        if (this.cells[r][c].isMine) {
          this.cells[r][c].isRevealed = true;
        }
      }
    }
  }

  private checkWin(): boolean {
    const totalCells = this.level.rows * this.level.cols;
    const requiredReveals = totalCells - this.level.mines;
    let revealedCount = 0;

    for (let r = 0; r < this.level.rows; r++) {
      for (let c = 0; c < this.level.cols; c++) {
        if (this.cells[r][c].isRevealed && !this.cells[r][c].isMine) {
          revealedCount++;
        }
      }
    }

    if (revealedCount === requiredReveals) {
      this.isWonState = true;
      // Auto flag all mines
      for (let r = 0; r < this.level.rows; r++) {
        for (let c = 0; c < this.level.cols; c++) {
          if (this.cells[r][c].isMine) {
            this.cells[r][c].isFlagged = true;
          }
        }
      }
      this.flagsPlaced = this.level.mines;
      return true;
    }
    return false;
  }

  public serialize(): any {
    return {
      cells: this.cells,
      isFirstClick: this.isFirstClick,
      isGameOver: this.isGameOver,
      isWonState: this.isWonState,
      movesCount: this.movesCount,
      flagsPlaced: this.flagsPlaced,
    };
  }
}
