export interface Point {
  readonly x: number;
  readonly y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameDifficulty = 'ZEN' | 'STANDARD' | 'TURBO';

export interface FoodItem {
  readonly position: Point;
  readonly kanji: string;
  readonly points: number;
}

export interface RetroScore {
  readonly id: string;
  readonly playerTag: string;
  readonly gameCode: string;
  readonly score: number;
  readonly createdAtUtc: string;
}

export interface GameState {
  readonly score: number;
  readonly highScore: number;
  readonly isGameOver: boolean;
  readonly isPaused: boolean;
  readonly isRunning: boolean;
  readonly difficulty: GameDifficulty;
}
