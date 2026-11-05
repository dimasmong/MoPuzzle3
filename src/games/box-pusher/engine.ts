import { BoxPusherLevel, Direction, BoxMoveRecord } from './types';
import { getBoxPusherLevel } from './levels';
import { parseMap, solveSokoban } from './solver';

export class BoxPusherEngine {
  private level: BoxPusherLevel;
  private rows: number = 0;
  private cols: number = 0;
  private walls: boolean[][] = [];
  private targets: Set<string> = new Set();
  private player: [number, number] = [0, 0];
  private boxes: [number, number][] = [];
  private undoStack: BoxMoveRecord[] = [];
  private stepsCount: number = 0;
  private pushesCount: number = 0;
  private hintsCount: number = 0;
  private isWonState: boolean = false;

  constructor(levelNum: number, savedState?: any) {
    this.level = getBoxPusherLevel(levelNum);
    this.initBoard(savedState);
  }

  private initBoard(savedState?: any): void {
    const parsed = parseMap(this.level.map);
    this.rows = parsed.rows;
    this.cols = parsed.cols;
    this.walls = parsed.walls;
    this.targets = parsed.targets;

    if (savedState && savedState.player && savedState.boxes) {
      this.player = savedState.player;
      this.boxes = savedState.boxes;
      this.stepsCount = savedState.stepsCount ?? 0;
      this.pushesCount = savedState.pushesCount ?? 0;
      this.hintsCount = savedState.hintsCount ?? 0;
      this.isWonState = this.checkWin();
      return;
    }

    this.player = parsed.player;
    this.boxes = parsed.boxes;
    this.isWonState = this.checkWin();
  }

  public getLevel(): BoxPusherLevel {
    return this.level;
  }

  public getGridDimensions(): { rows: number; cols: number } {
    return { rows: this.rows, cols: this.cols };
  }

  public getWalls(): boolean[][] {
    return this.walls;
  }

  public getTargets(): Set<string> {
    return this.targets;
  }

  public getPlayerPos(): [number, number] {
    return this.player;
  }

  public getBoxes(): [number, number][] {
    return this.boxes;
  }

  public getStepsCount(): number {
    return this.stepsCount;
  }

  public getPushesCount(): number {
    return this.pushesCount;
  }

  public getHintsCount(): number {
    return this.hintsCount;
  }

  public isWon(): boolean {
    return this.isWonState;
  }

  public move(dir: Direction): { success: boolean; wasPush: boolean; isComplete: boolean } {
    if (this.isWonState) return { success: false, wasPush: false, isComplete: true };

    const offsets: Record<Direction, [number, number]> = {
      up: [-1, 0],
      down: [1, 0],
      left: [0, -1],
      right: [0, 1],
    };

    const [dr, dc] = offsets[dir];
    const npr = this.player[0] + dr;
    const npc = this.player[1] + dc;

    // Check bounds & walls
    if (npr < 0 || npr >= this.rows || npc < 0 || npc >= this.cols || this.walls[npr][npc]) {
      return { success: false, wasPush: false, isComplete: false };
    }

    // Check box in path
    const boxIdx = this.boxes.findIndex((b) => b[0] === npr && b[1] === npc);

    if (boxIdx >= 0) {
      // Trying to push box
      const nbr = npr + dr;
      const nbc = npc + dc;

      if (
        nbr < 0 ||
        nbr >= this.rows ||
        nbc < 0 ||
        nbc >= this.cols ||
        this.walls[nbr][nbc] ||
        this.boxes.some((b) => b[0] === nbr && b[1] === nbc)
      ) {
        return { success: false, wasPush: false, isComplete: false };
      }

      // Execute push
      const oldPlayer: [number, number] = [this.player[0], this.player[1]];
      const oldBox: [number, number] = [npr, npc];

      this.player = [npr, npc];
      this.boxes[boxIdx] = [nbr, nbc];
      this.stepsCount++;
      this.pushesCount++;

      this.undoStack.push({
        playerBefore: oldPlayer,
        playerAfter: [npr, npc],
        boxBefore: oldBox,
        boxAfter: [nbr, nbc],
        wasPush: true,
      });

      const won = this.checkWin();
      return { success: true, wasPush: true, isComplete: won };
    }

    // Normal step
    const oldPlayer: [number, number] = [this.player[0], this.player[1]];
    this.player = [npr, npc];
    this.stepsCount++;

    this.undoStack.push({
      playerBefore: oldPlayer,
      playerAfter: [npr, npc],
      wasPush: false,
    });

    const won = this.checkWin();
    return { success: true, wasPush: false, isComplete: won };
  }

  public undo(): boolean {
    if (this.undoStack.length === 0) return false;
    const record = this.undoStack.pop()!;

    this.player = [record.playerBefore[0], record.playerBefore[1]];
    this.stepsCount--;

    if (record.wasPush && record.boxBefore && record.boxAfter) {
      const idx = this.boxes.findIndex(
        (b) => b[0] === record.boxAfter![0] && b[1] === record.boxAfter![1]
      );
      if (idx >= 0) {
        this.boxes[idx] = [record.boxBefore[0], record.boxBefore[1]];
      }
      this.pushesCount--;
    }

    this.isWonState = this.checkWin();
    return true;
  }

  public applyHint(): Direction | null {
    if (this.isWonState) return null;

    // Build temporary level state for solver
    const mapCopy: string[] = [];
    for (let r = 0; r < this.rows; r++) {
      let rowStr = '';
      for (let c = 0; c < this.cols; c++) {
        const isWall = this.walls[r][c];
        const isTgt = this.targets.has(`${r},${c}`);
        const isPly = this.player[0] === r && this.player[1] === c;
        const isBx = this.boxes.some((b) => b[0] === r && b[1] === c);

        if (isWall) rowStr += '#';
        else if (isBx && isTgt) rowStr += '*';
        else if (isBx) rowStr += '$';
        else if (isPly && isTgt) rowStr += '+';
        else if (isPly) rowStr += '@';
        else if (isTgt) rowStr += '.';
        else rowStr += ' ';
      }
      mapCopy.push(rowStr);
    }

    const sol = solveSokoban({ ...this.level, map: mapCopy }, 20000);
    if (sol && sol.length > 0) {
      this.hintsCount++;
      const nextDir = sol[0];
      this.move(nextDir);
      return nextDir;
    }
    return null;
  }

  private checkWin(): boolean {
    for (const [br, bc] of this.boxes) {
      if (!this.targets.has(`${br},${bc}`)) {
        return false;
      }
    }
    this.isWonState = true;
    return true;
  }

  public serialize(): any {
    return {
      player: this.player,
      boxes: this.boxes,
      stepsCount: this.stepsCount,
      pushesCount: this.pushesCount,
      hintsCount: this.hintsCount,
    };
  }
}
