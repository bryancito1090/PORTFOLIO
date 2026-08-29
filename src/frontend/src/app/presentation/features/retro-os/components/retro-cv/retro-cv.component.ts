import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { I18nService } from '../../../../../application/services/i18n.service';

@Component({
  selector: 'app-retro-cv',
  standalone: true,
  templateUrl: './retro-cv.component.html',
  styleUrl: './retro-cv.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroCvComponent {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly i18n = inject(I18nService);

  readonly pdfUrl = '/assets/CV%20Bryan%20Ba%C3%B1o%20.pdf';
  readonly safePdfUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    `${this.pdfUrl}#view=FitH`
  );
}
