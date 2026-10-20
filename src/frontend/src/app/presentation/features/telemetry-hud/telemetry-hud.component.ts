import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryStore } from '../../../application/stores/telemetry.store';
import { RetroOsStore } from '../../../application/stores/retro-os.store';

@Component({
  selector: 'app-telemetry-hud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './telemetry-hud.component.html',
  styleUrl: './telemetry-hud.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TelemetryHudComponent {
  readonly store = inject(TelemetryStore);
  readonly retroStore = inject(RetroOsStore);
  readonly isExpanded = signal(false);

  toggleDrawer(): void {
    this.isExpanded.update(v => !v);
    if (this.isExpanded()) {
      this.store.fetchTelemetry();
    }
  }

  refresh(): void {
    this.store.fetchTelemetry();
  }

  openTracer(): void {
    this.retroStore.forceDesktop();
    this.retroStore.openWindow('api-explorer');
    this.isExpanded.set(false);
  }
}
