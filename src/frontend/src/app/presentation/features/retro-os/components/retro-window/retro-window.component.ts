import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  ElementRef,
  viewChild,
  inject
} from '@angular/core';
import { RetroWindow, WindowId, WindowPosition } from '../../../../../domain/models/retro-os.model';
import { I18nService } from '../../../../../application/services/i18n.service';

@Component({
  selector: 'app-retro-window',
  standalone: true,
  templateUrl: './retro-window.component.html',
  styleUrl: './retro-window.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroWindowComponent {
  protected readonly i18n = inject(I18nService);

  readonly window = input.required<RetroWindow>();
  readonly isActive = input<boolean>(false);

  readonly close = output<WindowId>();
  readonly minimize = output<WindowId>();
  readonly toggleMaximize = output<WindowId>();
  readonly focus = output<WindowId>();
  readonly move = output<{ id: WindowId; position: WindowPosition }>();

  protected readonly headerRef = viewChild<ElementRef<HTMLElement>>('windowHeader');
  protected readonly isDragging = signal<boolean>(false);

  private dragStartX = 0;
  private dragStartY = 0;
  private initialPosX = 0;
  private initialPosY = 0;

  onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return; // Solo botón principal
    this.focus.emit(this.window().id);

    // No permitir arrastrar si la ventana está maximizada
    if (this.window().isMaximized) return;

    // Si se hizo clic en un botón de control (cerrar, minimizar, etc.), no iniciar arrastre
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('.xp-caption-buttons')) {
      return;
    }

    const header = this.headerRef()?.nativeElement;
    if (!header || !target.closest('.window-header-drag-area')) return;

    this.isDragging.set(true);
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.initialPosX = this.window().position.x;
    this.initialPosY = this.window().position.y;

    header.setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) return;

    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;

    const newX = Math.max(4, this.initialPosX + dx);
    const newY = Math.max(4, this.initialPosY + dy);

    this.move.emit({
      id: this.window().id,
      position: { x: newX, y: newY }
    });
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isDragging()) return;
    this.isDragging.set(false);

    const header = this.headerRef()?.nativeElement;
    if (header && header.hasPointerCapture(event.pointerId)) {
      header.releasePointerCapture(event.pointerId);
    }
  }

  onWindowClick(): void {
    this.focus.emit(this.window().id);
  }

  onMinimize(event: MouseEvent): void {
    event.stopPropagation();
    this.minimize.emit(this.window().id);
  }

  onToggleMaximize(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleMaximize.emit(this.window().id);
  }

  onClose(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit(this.window().id);
  }
}
