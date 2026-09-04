export interface MinesweeperCell {
  readonly row: number;
  readonly col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  isExploded?: boolean;
  adjacentMines: number;
}

export type MinesweeperFace = 'idle' | 'pressed' | 'dead' | 'won' | 'smile' | 'shock' | 'cool';

export interface RetroScore {
  readonly id: string;
  readonly playerTag: string;
  readonly gameCode: string;
  readonly score: number;
  readonly createdAtUtc: string;
}

