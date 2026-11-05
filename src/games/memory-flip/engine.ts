import { MemoryLevel, MemoryCard } from './types';
import { getMemoryLevel } from './levels';

export const CARD_SYMBOLS = [
  '🌟', '💎', '⚡', '🌙', '🔥', '🍀', '🪐', '⚓',
  '🎯', '👑', '🎵', '🔮', '🚀', '🌺', '🎨', '🏆',
];

export class MemoryEngine {
  private level: MemoryLevel;
  private cards: MemoryCard[] = [];
  private firstCardId: number | null = null;
  private secondCardId: number | null = null;
  private isLocked: boolean = false;
  private movesCount: number = 0;
  private comboCount: number = 0;
  private maxCombo: number = 0;
  private score: number = 0;
  private matchedPairs: number = 0;
  private isWonState: boolean = false;

  constructor(levelNum: number, savedState?: any) {
    this.level = getMemoryLevel(levelNum);
    this.initBoard(savedState);
  }

  private initBoard(savedState?: any): void {
    if (savedState && savedState.cards) {
      this.cards = savedState.cards;
      this.movesCount = savedState.movesCount ?? 0;
      this.comboCount = savedState.comboCount ?? 0;
      this.maxCombo = savedState.maxCombo ?? 0;
      this.score = savedState.score ?? 0;
      this.matchedPairs = savedState.matchedPairs ?? 0;
      this.isWonState = this.matchedPairs === this.level.pairs;
      return;
    }

    // Generate exact pairs
    const symbolsToUse = CARD_SYMBOLS.slice(0, this.level.pairs);
    const deck: { id: number; symbol: string }[] = [];
    let idCounter = 0;

    for (const sym of symbolsToUse) {
      deck.push({ id: idCounter++, symbol: sym });
      deck.push({ id: idCounter++, symbol: sym });
    }

    // Seeded shuffle using level number
    this.shuffle(deck, this.level.level * 1337);

    this.cards = deck.map((item) => ({
      id: item.id,
      symbol: item.symbol,
      isFlipped: false,
      isMatched: false,
    }));
  }

  private shuffle(array: any[], seed: number): void {
    let s = seed;
    const random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  public getLevel(): MemoryLevel {
    return this.level;
  }

  public getCards(): MemoryCard[] {
    return this.cards;
  }

  public getMovesCount(): number {
    return this.movesCount;
  }

  public getComboCount(): number {
    return this.comboCount;
  }

  public getScore(): number {
    return this.score;
  }

  public isWon(): boolean {
    return this.isWonState;
  }

  public isAnimationLocked(): boolean {
    return this.isLocked;
  }

  public getSelectedCardIds(): [number | null, number | null] {
    return [this.firstCardId, this.secondCardId];
  }

  public flipCard(
    id: number,
    onMismatchDone?: () => void
  ): {
    flipped: boolean;
    isMatch?: boolean;
    isComplete?: boolean;
    combo?: number;
  } {
    if (this.isLocked || this.isWonState) return { flipped: false };

    const card = this.cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) {
      return { flipped: false };
    }

    // First card of pair
    if (this.firstCardId === null) {
      card.isFlipped = true;
      this.firstCardId = id;
      return { flipped: true };
    }

    // Prevent clicking the same card twice
    if (this.firstCardId === id) {
      return { flipped: false };
    }

    // Second card of pair
    card.isFlipped = true;
    this.secondCardId = id;
    this.movesCount++;
    this.isLocked = true;

    const firstCard = this.cards.find((c) => c.id === this.firstCardId)!;
    const isMatch = firstCard.symbol === card.symbol;

    if (isMatch) {
      firstCard.isMatched = true;
      card.isMatched = true;
      this.matchedPairs++;
      this.comboCount++;
      if (this.comboCount > this.maxCombo) {
        this.maxCombo = this.comboCount;
      }
      this.score += 100 * this.comboCount;

      this.firstCardId = null;
      this.secondCardId = null;
      this.isLocked = false;

      const won = this.matchedPairs === this.level.pairs;
      if (won) {
        this.isWonState = true;
      }

      return {
        flipped: true,
        isMatch: true,
        isComplete: won,
        combo: this.comboCount,
      };
    } else {
      // Mismatch: delay flip back
      this.comboCount = 0;
      setTimeout(() => {
        firstCard.isFlipped = false;
        card.isFlipped = false;
        this.firstCardId = null;
        this.secondCardId = null;
        this.isLocked = false;
        if (onMismatchDone) onMismatchDone();
      }, 700);

      return {
        flipped: true,
        isMatch: false,
        isComplete: false,
        combo: 0,
      };
    }
  }

  public getStarRating(): number {
    const idealMoves = this.level.pairs;
    if (this.movesCount <= idealMoves * 1.5) return 3;
    if (this.movesCount <= idealMoves * 2.2) return 2;
    return 1;
  }

  public serialize(): any {
    return {
      cards: this.cards,
      movesCount: this.movesCount,
      comboCount: this.comboCount,
      maxCombo: this.maxCombo,
      score: this.score,
      matchedPairs: this.matchedPairs,
    };
  }
}
