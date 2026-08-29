import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RetroOsStore } from '../../../../../application/stores/retro-os.store';
import { I18nService } from '../../../../../application/services/i18n.service';
import { ZenOsTheme } from '../../../../../domain/models/retro-os.model';

@Component({
  selector: 'app-retro-settings',
  standalone: true,
  templateUrl: './retro-settings.component.html',
  styleUrl: './retro-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroSettingsComponent {
  protected readonly store = inject(RetroOsStore);
  protected readonly i18n = inject(I18nService);

  onSelectTheme(theme: ZenOsTheme): void {
    this.store.setTheme(theme);
  }

  onToggleScanlines(): void {
    this.store.toggleScanlines();
  }

  onToggleSound(): void {
    this.store.toggleSound();
  }
}
