import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RetroScorePort } from '../../../../../domain/ports/retro-score.port';
import { RetroScore } from '../../../../../domain/models/retro-game.model';
import { RetroAudioService } from '../../../../../application/services/retro-audio.service';
import { I18nService } from '../../../../../application/services/i18n.service';

@Component({
  selector: 'app-retro-scores',
  standalone: true,
  templateUrl: './retro-scores.component.html',
  styleUrl: './retro-scores.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroScoresComponent implements OnInit {
  private readonly scorePort = inject(RetroScorePort);
  private readonly audio = inject(RetroAudioService);
  protected readonly i18n = inject(I18nService);

  protected readonly scores = signal<RetroScore[]>([]);
  protected readonly isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadScores();
  }

  loadScores(): void {
    this.isLoading.set(true);
    this.scorePort.getTopScores('MINESWEEPER', 10).subscribe({
      next: (data) => {
        this.scores.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onRefresh(): void {
    this.audio.playClick();
    this.loadScores();
  }
}
