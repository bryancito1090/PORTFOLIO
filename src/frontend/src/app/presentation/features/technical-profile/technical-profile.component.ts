import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { I18nService } from '../../../application/services/i18n.service';

@Component({
  selector: 'app-technical-profile',
  standalone: true,
  templateUrl: './technical-profile.component.html',
  styleUrl: './technical-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechnicalProfileComponent implements OnInit {
  protected readonly i18n = inject(I18nService);
  protected readonly asciiArt = signal('');
  protected readonly asciiLoadError = signal(false);
  protected readonly aboutParagraphs = computed(() =>
    this.i18n.t().tpAboutDescription.split('\n\n').filter((p) => p.trim().length > 0)
  );

  ngOnInit(): void {
    this.loadTextAsset('assets/portfolio.txt')
      .then((portrait) => this.asciiArt.set(portrait))
      .catch(() => this.asciiLoadError.set(true));
  }

  private loadTextAsset(path: string): Promise<string> {
    return fetch(path).then((response) => {
      if (!response.ok) {
        throw new Error(`ASCII asset request failed: ${response.status}`);
      }
      return response.text();
    });
  }
}
