import { Observable } from 'rxjs';
import { RetroScore } from '../models/retro-game.model';

export abstract class RetroScorePort {
  abstract getTopScores(gameCode: string, limit?: number): Observable<RetroScore[]>;
  abstract saveScore(score: Omit<RetroScore, 'id' | 'createdAtUtc'>): Observable<RetroScore>;
}
