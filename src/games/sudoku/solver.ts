export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  val: number
): boolean {
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === val) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === val) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cr = boxRow + r;
      const cc = boxCol + c;
      if ((cr !== row || cc !== col) && grid[cr][cc] === val) return false;
    }
  }
  return true;
}

export function findCandidates(grid: number[][], row: number, col: number): number[] {
  if (grid[row][col] !== 0) return [];
  const candidates: number[] = [];
  for (let v = 1; v <= 9; v++) {
    if (isValidPlacement(grid, row, col, v)) {
      candidates.push(v);
    }
  }
  return candidates;
}

export function countSolutions(grid: number[][], limit: number = 2): number {
  let count = 0;
  const working = grid.map((row) => [...row]);

  function backtrack(r: number, c: number): boolean {
    if (r === 9) {
      count++;
      return count >= limit;
    }
    const nextR = c === 8 ? r + 1 : r;
    const nextC = c === 8 ? 0 : c + 1;

    if (working[r][c] !== 0) {
      return backtrack(nextR, nextC);
    }

    for (let v = 1; v <= 9; v++) {
      if (isValidPlacement(working, r, c, v)) {
        working[r][c] = v;
        if (backtrack(nextR, nextC)) {
          working[r][c] = 0;
          return true;
        }
        working[r][c] = 0;
      }
    }
    return false;
  }

  backtrack(0, 0);
  return count;
}

export function solveSudoku(grid: number[][]): number[][] | null {
  const working = grid.map((row) => [...row]);

  function solve(r: number, c: number): boolean {
    if (r === 9) return true;
    const nextR = c === 8 ? r + 1 : r;
    const nextC = c === 8 ? 0 : c + 1;

    if (working[r][c] !== 0) {
      return solve(nextR, nextC);
    }

    for (let v = 1; v <= 9; v++) {
      if (isValidPlacement(working, r, c, v)) {
        working[r][c] = v;
        if (solve(nextR, nextC)) return true;
        working[r][c] = 0;
      }
    }
    return false;
  }

  return solve(0, 0) ? working : null;
}

export function isBoardValid(grid: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v === 0) return false;
      if (!isValidPlacement(grid, r, c, v)) return false;
    }
  }
  return true;
}

export function getNextHint(
  currentGrid: number[][],
  solution: number[][]
): { row: number; col: number; val: number; reason: string } | null {
  // First, check for naked singles (cells with only 1 candidate)
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (currentGrid[r][c] === 0) {
        const cand = findCandidates(currentGrid, r, c);
        if (cand.length === 1) {
          return {
            row: r,
            col: c,
            val: cand[0],
            reason: `Only ${cand[0]} can fit in row ${r + 1}, column ${c + 1}!`,
          };
        }
      }
    }
  }

  // Otherwise, find any empty cell and provide solution digit
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (currentGrid[r][c] === 0) {
        return {
          row: r,
          col: c,
          val: solution[r][c],
          reason: `Logical deduction reveals ${solution[r][c]} belongs at row ${r + 1}, column ${c + 1}.`,
        };
      }
    }
  }

  return null;
}
