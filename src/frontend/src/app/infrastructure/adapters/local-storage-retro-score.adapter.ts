import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RetroScorePort } from '../../domain/ports/retro-score.port';
import { RetroScore } from '../../domain/models/retro-game.model';

const STORAGE_KEY = 'zenos_retro_scores';

const INITIAL_SEEDS: RetroScore[] = [
  {
    id: 'seed-1',
    playerTag: 'ZEN',
    gameCode: 'MINESWEEPER',
    score: 42,
    createdAtUtc: '2026-08-28T00:00:00.000Z'
  },
  {
    id: 'seed-2',
    playerTag: 'NEO',
    gameCode: 'MINESWEEPER',
    score: 68,
    createdAtUtc: '2026-08-28T00:00:00.000Z'
  },
  {
    id: 'seed-3',
    playerTag: 'BRY',
    gameCode: 'MINESWEEPER',
    score: 95,
    createdAtUtc: '2026-08-28T00:00:00.000Z'
  }
];

@Injectable({ providedIn: 'root' })
export class LocalStorageRetroScoreAdapter implements RetroScorePort {
  private readScores(): RetroScore[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEEDS));
        return INITIAL_SEEDS;
      }
      return JSON.parse(raw) as RetroScore[];
    } catch {
      return INITIAL_SEEDS;
    }
  }

  private writeScores(scores: RetroScore[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch {
      // Ignorar fallo de cuota en entornos restringidos
    }
  }

  getTopScores(gameCode: string, limit = 10): Observable<RetroScore[]> {
    const scores = this.readScores();
    const isTimeBased = gameCode === 'MINESWEEPER';
    const filtered = scores
      .filter(s => s.gameCode === gameCode)
      .sort((a, b) =>
        isTimeBased
          ? a.score - b.score || a.createdAtUtc.localeCompare(b.createdAtUtc)
          : b.score - a.score || a.createdAtUtc.localeCompare(b.createdAtUtc)
      )
      .slice(0, limit);
    return of(filtered);
  }

  saveScore(data: Omit<RetroScore, 'id' | 'createdAtUtc'>): Observable<RetroScore> {
    const scores = this.readScores();
    const newEntry: RetroScore = {
      ...data,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `score-${Date.now()}`,
      createdAtUtc: new Date().toISOString()
    };
    scores.push(newEntry);
    this.writeScores(scores);
    return of(newEntry);
  }
}
