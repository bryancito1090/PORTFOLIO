import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject
} from '@angular/core';
import { OsPowerState } from '../../../../../domain/models/retro-os.model';
import { I18nService } from '../../../../../application/services/i18n.service';

@Component({
  selector: 'app-retro-power-screen',
  standalone: true,
  templateUrl: './retro-power-screen.component.html',
  styleUrl: './retro-power-screen.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroPowerScreenComponent {
  readonly powerState = input.required<OsPowerState>();
  readonly powerOn = output<void>();

  protected readonly i18n = inject(I18nService);

  onScreenClick(): void {
    if (this.powerState() === 'off') {
      this.powerOn.emit();
    }
  }
}
