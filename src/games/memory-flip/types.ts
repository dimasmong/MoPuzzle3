export interface MemoryLevel {
  level: number;
  rows: number;
  cols: number;
  pairs: number;
}

export interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}
