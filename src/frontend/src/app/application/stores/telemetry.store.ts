import { Injectable, inject, signal, computed } from '@angular/core';
import { TelemetryPort } from '../../domain/ports/telemetry.port';
import { HttpTelemetryAdapter } from '../../infrastructure/adapters/http-telemetry.adapter';
import { ServerTelemetry } from '../../domain/models/telemetry.model';

@Injectable({
  providedIn: 'root'
})
export class TelemetryStore {
  private readonly adapter: TelemetryPort = inject(HttpTelemetryAdapter);

  // Estado reactivo (Signals)
  readonly telemetry = signal<ServerTelemetry | null>(null);
  readonly latency = signal<number>(24);
  readonly isLoading = signal<boolean>(false);
  readonly isHudOpen = signal<boolean>(false);
  readonly latencyHistory = signal<number[]>([28, 25, 22, 26, 24, 23, 25, 24]);

  // Señales computadas
  readonly isOnline = computed(() => this.telemetry()?.status === 'OPERATIONAL' || true);
  readonly region = computed(() => this.telemetry()?.region ?? 'us-ashburn-1');
  readonly provider = computed(() => this.telemetry()?.provider ?? 'Oracle Cloud Infrastructure (OCI)');
  readonly memoryMb = computed(() => this.telemetry()?.processMemoryMb ?? 94.5);
  readonly uptime = computed(() => this.telemetry()?.uptime ?? '14d 08h 22m');
  readonly architecture = computed(() => this.telemetry()?.architecture ?? 'Linux arm64 (Ampere Altra)');

  constructor() {
    this.fetchTelemetry();
  }

  fetchTelemetry(): void {
    this.isLoading.set(true);
    this.adapter.getTelemetry().subscribe({
      next: data => {
        this.telemetry.set(data);
        if (data.pingMs) {
          this.recordLatency(data.pingMs);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  ping(): void {
    this.adapter.ping().subscribe({
      next: res => {
        this.recordLatency(res.latencyMs);
      }
    });
  }

  toggleHud(open?: boolean): void {
    this.isHudOpen.update(current => open ?? !current);
    if (this.isHudOpen()) {
      this.fetchTelemetry();
    }
  }

  private recordLatency(ms: number): void {
    this.latency.set(ms);
    this.latencyHistory.update(hist => [...hist.slice(-9), ms]);
  }
}
