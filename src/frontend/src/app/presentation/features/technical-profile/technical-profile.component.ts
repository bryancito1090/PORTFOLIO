import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { I18nService } from '../../../application/services/i18n.service';

@Component({
  selector: 'app-technical-profile',
  standalone: true,
  templateUrl: './technical-profile.component.html',
  styleUrl: './technical-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechnicalProfileComponent {
  protected readonly i18n = inject(I18nService);
}
