import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityAgentService } from '../../../services/security-agent.service';
import { RetroAudioService } from '../../../application/services/retro-audio.service';
import {
  SimulationMode,
  SecurityAgentRequest,
  SecurityAgentResponse
} from '../../../domain/models/security.model';

@Component({
  selector: 'app-incident-simulator, app-cyber-defense',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-simulator.component.html',
  styleUrl: './incident-simulator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentSimulatorComponent {
  private readonly securityService = inject(SecurityAgentService);
  private readonly audio = inject(RetroAudioService);

  // Parámetros reactivos de configuración
  readonly mode = signal<SimulationMode>('PURPLE_TEAM');
  readonly target = signal<string>('local_sandbox');
  readonly requestedBy = signal<string>('auditor@bryan-bano.com');
  readonly autoIsolate = signal<boolean>(true);

  // Estados de ejecución y telemetría
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly result = signal<SecurityAgentResponse | null>(null);

  setTargetPreset(value: string): void {
    this.audio.playClick();
    this.target.set(value);
  }

  executeSimulation(): void {
    if (this.isLoading()) return;

    this.audio.playClick();
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.result.set(null);

    const payload: SecurityAgentRequest = {
      mode: this.mode(),
      target: this.target().trim() || 'local_sandbox',
      requested_by: this.requestedBy().trim() || 'auditor@bryan-bano.com',
      parameters: {
        auto_isolate: this.autoIsolate(),
        scan_depth: 'full'
      }
    };

    this.securityService.triggerSimulation(payload).subscribe({
      next: (response) => {
        this.result.set(response);
        this.isLoading.set(false);
        this.audio.playVictory();
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message || 'Error al conectar con el orquestador n8n.');
        this.isLoading.set(false);
        this.audio.playGameOver();
      }
    });
  }

  resetSimulation(): void {
    this.audio.playClick();
    this.errorMessage.set(null);
    this.result.set(null);
    this.isLoading.set(false);
  }
}

export {
  IncidentSimulatorComponent as CyberDefenseComponent,
  IncidentSimulatorComponent as CyberDefenseDashboardComponent
};
