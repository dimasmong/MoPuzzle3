import { BoxPusherLevel, Direction } from './types';

export interface ParsedSokoban {
  rows: number;
  cols: number;
  walls: boolean[][];
  targets: Set<string>; // "r,c"
  player: [number, number];
  boxes: [number, number][];
}

export function parseMap(map: string[]): ParsedSokoban {
  const rows = map.length;
  let cols = 0;
  for (const line of map) {
    if (line.length > cols) cols = line.length;
  }

  const walls: boolean[][] = Array(rows)
    .fill(false)
    .map(() => Array(cols).fill(false));
  const targets = new Set<string>();
  let player: [number, number] = [0, 0];
  const boxes: [number, number][] = [];

  for (let r = 0; r < rows; r++) {
    const line = map[r];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '#') {
        walls[r][c] = true;
      } else if (ch === '.') {
        targets.add(`${r},${c}`);
      } else if (ch === '@') {
        player = [r, c];
      } else if (ch === '+') {
        player = [r, c];
        targets.add(`${r},${c}`);
      } else if (ch === '$') {
        boxes.push([r, c]);
      } else if (ch === '*') {
        boxes.push([r, c]);
        targets.add(`${r},${c}`);
      }
    }
  }

  return { rows, cols, walls, targets, player, boxes };
}

export function isCornerDeadlock(
  r: number,
  c: number,
  walls: boolean[][],
  targets: Set<string>
): boolean {
  if (targets.has(`${r},${c}`)) return false;
  const up = r === 0 || walls[r - 1][c];
  const down = r === walls.length - 1 || walls[r + 1][c];
  const left = c === 0 || walls[r][c - 1];
  const right = c === walls[0].length - 1 || walls[r][c + 1];

  if ((up && left) || (up && right) || (down && left) || (down && right)) {
    return true;
  }
  return false;
}

const DIR_OFFSETS: Record<Direction, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

function stateKey(pr: number, pc: number, boxes: [number, number][]): string {
  const sortedBoxes = [...boxes]
    .sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]))
    .map((b) => `${b[0]},${b[1]}`)
    .join(';');
  return `${pr},${pc}|${sortedBoxes}`;
}

export function solveSokoban(
  level: BoxPusherLevel,
  maxStates: number = 30000
): Direction[] | null {
  const { rows, cols, walls, targets, player, boxes } = parseMap(level.map);

  interface SearchNode {
    pr: number;
    pc: number;
    boxes: [number, number][];
    path: Direction[];
  }

  const initialKey = stateKey(player[0], player[1], boxes);
  const visited = new Set<string>();
  visited.add(initialKey);

  const queue: SearchNode[] = [{ pr: player[0], pc: player[1], boxes, path: [] }];

  let states = 0;
  while (queue.length > 0) {
    const cur = queue.shift()!;
    states++;
    if (states > maxStates) return null;

    // Check if won
    let allOnTarget = true;
    for (const [br, bc] of cur.boxes) {
      if (!targets.has(`${br},${bc}`)) {
        allOnTarget = false;
        break;
      }
    }
    if (allOnTarget) {
      return cur.path;
    }

    const boxSet = new Set(cur.boxes.map((b) => `${b[0]},${b[1]}`));

    for (const dir of ['up', 'down', 'left', 'right'] as Direction[]) {
      const [dr, dc] = DIR_OFFSETS[dir];
      const npr = cur.pr + dr;
      const npc = cur.pc + dc;

      if (npr < 0 || npr >= rows || npc < 0 || npc >= cols || walls[npr][npc]) {
        continue;
      }

      if (boxSet.has(`${npr},${npc}`)) {
        // Pushing box
        const nbr = npr + dr;
        const nbc = npc + dc;
        if (
          nbr < 0 ||
          nbr >= rows ||
          nbc < 0 ||
          nbc >= cols ||
          walls[nbr][nbc] ||
          boxSet.has(`${nbr},${nbc}`)
        ) {
          continue;
        }

        // Deadlock prune
        if (isCornerDeadlock(nbr, nbc, walls, targets)) {
          continue;
        }

        const nextBoxes: [number, number][] = cur.boxes.map((b) =>
          b[0] === npr && b[1] === npc ? [nbr, nbc] : [b[0], b[1]]
        );
        const sk = stateKey(npr, npc, nextBoxes);
        if (!visited.has(sk)) {
          visited.add(sk);
          queue.push({
            pr: npr,
            pc: npc,
            boxes: nextBoxes,
            path: [...cur.path, dir],
          });
        }
      } else {
        // Normal move
        const sk = stateKey(npr, npc, cur.boxes);
        if (!visited.has(sk)) {
          visited.add(sk);
          queue.push({
            pr: npr,
            pc: npc,
            boxes: cur.boxes,
            path: [...cur.path, dir],
          });
        }
      }
    }
  }

  return null;
}
