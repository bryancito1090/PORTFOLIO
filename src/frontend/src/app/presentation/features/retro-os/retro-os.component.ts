import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  OnDestroy,
  signal,
  inject,
  ElementRef
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
import { RetroPowerScreenComponent } from './components/retro-power-screen/retro-power-screen.component';

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
    RetroStartMenuComponent,
    RetroPowerScreenComponent
  ],
  templateUrl: './retro-os.component.html',
  styleUrl: './retro-os.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroOsComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly store = inject(RetroOsStore);
  protected readonly i18n = inject(I18nService);
  private readonly elRef = inject(ElementRef);

  protected readonly isStartMenuOpen = signal<boolean>(false);
  protected readonly currentTime = signal<string>('12:00');

  private clockInterval: ReturnType<typeof setInterval> | null = null;
  private observer: IntersectionObserver | null = null;
  private hasBootedOnce = false;

  private readonly timeFormatter = new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          // Al entrar visible en pantalla tras bajar del Hero 3D
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            if (this.store.powerState() === 'off' && !this.hasBootedOnce) {
              this.hasBootedOnce = true;
              this.store.startBootSequence();
              // Desconectar observer: una vez encendido se queda siempre cargado
              this.observer?.disconnect();
            }
          }
        },
        { threshold: [0.25] }
      );
      this.observer.observe(this.elRef.nativeElement);
    }
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
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
