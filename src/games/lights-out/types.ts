export interface LightsOutLevel {
  level: number;
  size: number; // 3, 4, or 5
  grid: boolean[][]; // true = ON, false = OFF
  solutionMoves: [number, number][]; // verified legal sequence that turns all lights off
}
