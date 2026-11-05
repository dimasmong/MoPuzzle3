export function calculateAdjacentCounts(
  rows: number,
  cols: number,
  mineMatrix: boolean[][]
): number[][] {
  const counts: number[][] = Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (mineMatrix[r][c]) {
        counts[r][c] = -1;
        continue;
      }
      let sum = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && mineMatrix[nr][nc]) {
            sum++;
          }
        }
      }
      counts[r][c] = sum;
    }
  }
  return counts;
}

export function isSolvableWithoutGuess(
  rows: number,
  cols: number,
  mineMatrix: boolean[][],
  startR: number,
  startC: number
): boolean {
  const counts = calculateAdjacentCounts(rows, cols, mineMatrix);
  const revealed: boolean[][] = Array(rows)
    .fill(false)
    .map(() => Array(cols).fill(false));
  const flagged: boolean[][] = Array(rows)
    .fill(false)
    .map(() => Array(cols).fill(false));

  function revealFlood(r: number, c: number) {
    if (revealed[r][c] || flagged[r][c] || mineMatrix[r][c]) return;
    revealed[r][c] = true;
    if (counts[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            revealFlood(nr, nc);
          }
        }
      }
    }
  }

  // Start with first reveal
  revealFlood(startR, startC);

  let progress = true;
  while (progress) {
    progress = false;

    // Check satisfied or all-mine constraints
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!revealed[r][c] || counts[r][c] <= 0) continue;

        const neighbors: [number, number][] = [];
        let flagCount = 0;
        let unrevealedCount = 0;

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              if (flagged[nr][nc]) flagCount++;
              else if (!revealed[nr][nc]) {
                unrevealedCount++;
                neighbors.push([nr, nc]);
              }
            }
          }
        }

        const requiredMines = counts[r][c] - flagCount;

        // If remaining required mines === unrevealed count, all are mines!
        if (requiredMines > 0 && requiredMines === unrevealedCount) {
          for (const [nr, nc] of neighbors) {
            flagged[nr][nc] = true;
            progress = true;
          }
        }
        // If satisfied, all unrevealed are safe!
        else if (requiredMines === 0 && unrevealedCount > 0) {
          for (const [nr, nc] of neighbors) {
            revealFlood(nr, nc);
            progress = true;
          }
        }
      }
    }
  }

  // Count if all safe cells are revealed
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!mineMatrix[r][c] && !revealed[r][c]) {
        return false;
      }
    }
  }
  return true;
}
