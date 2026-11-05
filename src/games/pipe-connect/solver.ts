import { PipeType, PipeCellState } from './types';

export const BASE_OPENINGS: Record<PipeType, boolean[]> = {
  // [Up, Right, Down, Left]
  straight: [true, false, true, false],
  corner: [true, true, false, false],
  tee: [true, true, false, true],
  cross: [true, true, true, true],
  cap: [true, false, false, false],
  source: [true, false, false, false],
  destination: [true, false, false, false],
  empty: [false, false, false, false],
};

export function getOpenings(type: PipeType, rotation: number): boolean[] {
  const base = BASE_OPENINGS[type];
  const rot = ((rotation % 4) + 4) % 4;
  const result = [false, false, false, false];
  for (let d = 0; d < 4; d++) {
    result[d] = base[(d - rot + 4) % 4];
  }
  return result;
}

export const OPPOSITE_DIR: number[] = [2, 3, 0, 1];
export const DIR_DELTA: [number, number][] = [
  [-1, 0], // 0: Up
  [0, 1],  // 1: Right
  [1, 0],  // 2: Down
  [0, -1], // 3: Left
];

export function simulateWaterFlow(grid: PipeCellState[][]): {
  wateredCount: number;
  destinationsWatered: number;
  totalDestinations: number;
  hasLeaks: boolean;
  isWon: boolean;
} {
  const rows = grid.length;
  const cols = grid[0].length;

  // Reset watered flags
  let totalDestinations = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c].isWatered = false;
      if (grid[r][c].type === 'destination') {
        totalDestinations++;
      }
    }
  }

  // Find source cells
  const queue: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type === 'source') {
        grid[r][c].isWatered = true;
        queue.push([r, c]);
      }
    }
  }

  let destinationsWatered = 0;
  let hasLeaks = false;
  let wateredCount = queue.length;

  // BFS flow propagation
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const cell = grid[r][c];
    const openings = getOpenings(cell.type, cell.rotation);

    for (let d = 0; d < 4; d++) {
      if (!openings[d]) continue;

      const [dr, dc] = DIR_DELTA[d];
      const nr = r + dr;
      const nc = c + dc;
      const opp = OPPOSITE_DIR[d];

      // Check bounds / leaks
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
        hasLeaks = true;
        continue;
      }

      const neighbor = grid[nr][nc];
      if (neighbor.type === 'empty') {
        hasLeaks = true;
        continue;
      }

      const neighborOpenings = getOpenings(neighbor.type, neighbor.rotation);
      if (neighborOpenings[opp]) {
        if (!neighbor.isWatered) {
          neighbor.isWatered = true;
          wateredCount++;
          if (neighbor.type === 'destination') {
            destinationsWatered++;
          }
          queue.push([nr, nc]);
        }
      } else {
        hasLeaks = true;
      }
    }
  }

  const isWon =
    totalDestinations > 0 &&
    destinationsWatered === totalDestinations &&
    !hasLeaks;

  return {
    wateredCount,
    destinationsWatered,
    totalDestinations,
    hasLeaks,
    isWon,
  };
}
