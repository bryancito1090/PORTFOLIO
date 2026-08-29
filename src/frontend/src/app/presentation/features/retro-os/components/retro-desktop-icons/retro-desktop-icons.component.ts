import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DesktopIcon, WindowId } from '../../../../../domain/models/retro-os.model';

@Component({
  selector: 'app-retro-desktop-icons',
  standalone: true,
  templateUrl: './retro-desktop-icons.component.html',
  styleUrl: './retro-desktop-icons.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroDesktopIconsComponent {
  readonly icons = input.required<DesktopIcon[]>();
  readonly openWindow = output<WindowId>();

  onIconClick(windowId: WindowId): void {
    this.openWindow.emit(windowId);
  }
}
