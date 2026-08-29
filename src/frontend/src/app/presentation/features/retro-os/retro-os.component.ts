import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  signal,
  inject
} from '@angular/core';
import { RetroOsStore } from '../../../application/stores/retro-os.store';
import { I18nService } from '../../../application/services/i18n.service';
import { WindowId, WindowPosition } from '../../../domain/models/retro-os.model';
import { RetroDesktopIconsComponent } from './components/retro-desktop-icons/retro-desktop-icons.component';
import { RetroWindowComponent } from './components/retro-window/retro-window.component';
import { RetroGameCanvasComponent } from './components/retro-game-canvas/retro-game-canvas.component';
import { RetroCvComponent } from './components/retro-cv/retro-cv.component';
import { RetroScoresComponent } from './components/retro-scores/retro-scores.component';
import { RetroSettingsComponent } from './components/retro-settings/retro-settings.component';
import { RetroStartMenuComponent } from './components/retro-start-menu/retro-start-menu.component';

@Component({
  selector: 'app-retro-os',
  standalone: true,
  imports: [
    RetroDesktopIconsComponent,
    RetroWindowComponent,
    RetroGameCanvasComponent,
    RetroCvComponent,
    RetroScoresComponent,
    RetroSettingsComponent,
    RetroStartMenuComponent
  ],
  templateUrl: './retro-os.component.html',
  styleUrl: './retro-os.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroOsComponent implements OnInit, OnDestroy {
  protected readonly store = inject(RetroOsStore);
  protected readonly i18n = inject(I18nService);

  protected readonly isStartMenuOpen = signal<boolean>(false);
  protected readonly currentTime = signal<string>('12:00');

  private clockInterval: ReturnType<typeof setInterval> | null = null;
  private readonly timeFormatter = new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  private updateClock(): void {
    this.currentTime.set(this.timeFormatter.format(new Date()));
  }

  toggleStartMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isStartMenuOpen.update(v => !v);
  }

  closeStartMenu(): void {
    if (this.isStartMenuOpen()) {
      this.isStartMenuOpen.set(false);
    }
  }

  onMoveWindow(event: { id: WindowId; position: WindowPosition }): void {
    this.store.moveWindow(event.id, event.position);
  }

  ngOnDestroy(): void {
    if (this.clockInterval !== null) {
      clearInterval(this.clockInterval);
    }
  }
}
