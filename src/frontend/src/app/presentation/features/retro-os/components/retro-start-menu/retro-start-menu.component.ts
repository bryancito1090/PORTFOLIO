import { Component, ChangeDetectionStrategy, output, inject } from '@angular/core';
import { WindowId } from '../../../../../domain/models/retro-os.model';
import { I18nService } from '../../../../../application/services/i18n.service';

@Component({
  selector: 'app-retro-start-menu',
  standalone: true,
  templateUrl: './retro-start-menu.component.html',
  styleUrl: './retro-start-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroStartMenuComponent {
  protected readonly i18n = inject(I18nService);

  readonly close = output<void>();
  readonly openWindow = output<WindowId>();

  onSelect(windowId?: WindowId): void {
    if (windowId) {
      this.openWindow.emit(windowId);
    }
    this.close.emit();
  }
}
