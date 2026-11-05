export function solveLightsOutGF2(
  grid: boolean[][]
): [number, number][] | null {
  const size = grid.length;
  const n = size * size;

  // Build matrix A (n x n) and vector b (n x 1)
  const A: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));
  const b: number[] = Array(n).fill(0);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const i = r * size + c;
      b[i] = grid[r][c] ? 1 : 0;

      // Cell affects itself
      A[i][i] = 1;

      // Cell affects neighbors
      const neighbors = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ];
      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const j = nr * size + nc;
          A[i][j] = 1;
        }
      }
    }
  }

  // Gaussian elimination over GF(2)
  let row = 0;
  const pivotCol: number[] = [];

  for (let col = 0; col < n && row < n; col++) {
    // Find pivot
    let pivot = -1;
    for (let r = row; r < n; r++) {
      if (A[r][col] === 1) {
        pivot = r;
        break;
      }
    }

    if (pivot === -1) {
      continue;
    }

    // Swap pivot row with current row
    if (pivot !== row) {
      const tempRow = A[row];
      A[row] = A[pivot];
      A[pivot] = tempRow;

      const tempB = b[row];
      b[row] = b[pivot];
      b[pivot] = tempB;
    }

    // Eliminate other rows using XOR
    for (let r = 0; r < n; r++) {
      if (r !== row && A[r][col] === 1) {
        for (let c = col; c < n; c++) {
          A[r][c] ^= A[row][c];
        }
        b[r] ^= b[row];
      }
    }

    pivotCol[row] = col;
    row++;
  }

  // Check for contradiction (0 = 1)
  for (let r = row; r < n; r++) {
    if (b[r] === 1) {
      return null; // No solution
    }
  }

  // Back-substitute to find x
  const x: number[] = Array(n).fill(0);
  for (let r = 0; r < row; r++) {
    const col = pivotCol[r];
    x[col] = b[r];
  }

  const solutionCells: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    if (x[i] === 1) {
      const r = Math.floor(i / size);
      const c = i % size;
      solutionCells.push([r, c]);
    }
  }

  return solutionCells;
}

export function applyToggle(grid: boolean[][], r: number, c: number): void {
  const size = grid.length;
  grid[r][c] = !grid[r][c];
  const neighbors = [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ];
  for (const [nr, nc] of neighbors) {
    if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
      grid[nr][nc] = !grid[nr][nc];
    }
  }
}
