import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SecurityAgentService } from '../../../services/security-agent.service';
import { RetroAudioService } from '../../../application/services/retro-audio.service';
import {
  SimulationMode,
  SecurityVerdict,
  SecurityAgentRequest,
  SecurityAgentResponse
} from '../../../domain/models/security.model';

export interface SecurityScenario {
  readonly id: string;
  readonly badge: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly mode: SimulationMode;
  readonly target: string;
  readonly targetName: string;
  readonly targetRole: string;
  readonly targetProtection: string;
  readonly attackerIp: string;
  readonly attackVector: string;
  readonly mitreTechnique: string;
  readonly autoIsolate: boolean;
}

export interface AuditorPreset {
  readonly id: string;
  readonly label: string;
  readonly email: string;
  readonly roleHint: string;
}

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

  // Navegación Stepper minimalista: 1 = Selección, 2 = Ataque en Vivo, 3 = Evidencia Forense
  readonly currentStep = signal<1 | 2 | 3>(1);

  // Modos de visualización: guiado para cualquier público vs técnico para auditores
  readonly viewMode = signal<'guided' | 'tech'>('guided');

  // Escenarios didácticos preconfigurados con explicaciones comprensibles y metadatos de ataque
  readonly scenarios: readonly SecurityScenario[] = [
    {
      id: 'purple',
      badge: '01 // RECOMENDADO',
      title: 'Intrusión & Fuga de Credenciales',
      subtitle: 'Ataque Simulado + Auto-Defensa (Purple Team)',
      description: 'Un atacante intenta vulnerar el perímetro de autenticación para robar llaves de acceso maestras. La IA analiza el vector y bloquea el host.',
      mode: 'PURPLE_TEAM',
      target: 'auth.perimeter.internal',
      targetName: 'Servidor de Login y Cuentas',
      targetRole: 'Autenticación y Sesiones de Usuario',
      targetProtection: 'Evita la extracción no autorizada de credenciales maestras y contraseñas.',
      attackerIp: '194.26.29.112',
      attackVector: 'Credential Stuffing & Token Theft',
      mitreTechnique: 'T1110.003 (Brute Force)',
      autoIsolate: true
    },
    {
      id: 'easm',
      badge: '02 // AUDITORÍA',
      title: 'Superficie de Ataque Externa',
      subtitle: 'Descubrimiento de Puertos y Fugas (EASM)',
      description: 'Inspecciona la infraestructura pública externa para detectar puertos abiertos y cabeceras vulnerables antes de que actores maliciosos las exploten.',
      mode: 'EASM',
      target: 'api.bryan-bano.com',
      targetName: 'API Pública Web (Gateway)',
      targetRole: 'Fachada Perimetral Expuesta a Internet',
      targetProtection: 'Descubre puertas traseras o servicios expuestos indebidamente al exterior.',
      attackerIp: '45.142.214.8',
      attackVector: 'Port Recon & Public Exposure Probe',
      mitreTechnique: 'T1190 (Exploit Public-Facing App)',
      autoIsolate: false
    },
    {
      id: 'soar',
      badge: '03 // SERVERLESS',
      title: 'Triage de Amenaza Interna',
      subtitle: 'Orquestación y Respuesta Rápida (SOAR)',
      description: 'Tráfico anómalo detectado dentro del clúster de base de datos. La IA correlaciona el riesgo en milisegundos y sella el segmento de red.',
      mode: 'SOAR',
      target: 'db-cluster-node-01',
      targetName: 'Base de Datos de Clientes',
      targetRole: 'Clúster Transaccional Confidencial',
      targetProtection: 'Aísla el nodo en milisegundos para impedir fugas de información bancaria o sensible.',
      attackerIp: '10.244.3.44 (Pivoting Interno)',
      attackVector: 'Database Exfiltration & Tunneling',
      mitreTechnique: 'T1078 (Valid Accounts Exfiltration)',
      autoIsolate: true
    }
  ];

  // Presets rápidos para la firma de auditoría en el reporte forense PDF
  readonly auditorPresets: readonly AuditorPreset[] = [
    {
      id: 'recruiter',
      label: 'Reclutador / Empresa',
      email: 'reclutador@empresa-invitada.com',
      roleHint: 'Evaluación de perfil profesional'
    },
    {
      id: 'auditor',
      label: 'Auditor ISO 27001',
      email: 'auditor.seguridad@iso27001.org',
      roleHint: 'Cumplimiento y trazabilidad formal'
    },
    {
      id: 'bryan',
      label: 'Bryan Baño (Demo)',
      email: 'auditor@bryan-bano.com',
      roleHint: 'Firma predeterminada del autor'
    }
  ];

  readonly activeScenarioId = signal<string>('purple');

  readonly currentScenario = computed(() => {
    return this.scenarios.find(s => s.id === this.activeScenarioId()) ?? this.scenarios[0];
  });

  readonly activeAuditorPresetId = computed(() => {
    const current = this.requestedBy().trim().toLowerCase();
    const found = this.auditorPresets.find(p => p.email.toLowerCase() === current);
    return found ? found.id : 'custom';
  });

  // Parámetros reactivos del formulario
  readonly mode = signal<SimulationMode>('PURPLE_TEAM');
  readonly target = signal<string>('auth.perimeter.internal');
  readonly requestedBy = signal<string>('auditor@bryan-bano.com');
  readonly autoIsolate = signal<boolean>(true);

  // Estados de ejecución
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly result = signal<SecurityAgentResponse | null>(null);

  goToStep(step: 1 | 2 | 3): void {
    if (this.currentStep() === step) return;
    this.audio.playClick();
    this.currentStep.set(step);
  }

  setViewMode(mode: 'guided' | 'tech'): void {
    if (this.viewMode() === mode) return;
    this.audio.playClick();
    this.viewMode.set(mode);
  }

  selectScenario(sc: SecurityScenario): void {
    this.audio.playClick();
    this.activeScenarioId.set(sc.id);
    this.mode.set(sc.mode);
    this.target.set(sc.target);
    this.autoIsolate.set(sc.autoIsolate);
    this.currentStep.set(2); // Avanza directamente al visualizador en vivo
  }

  setMode(m: SimulationMode): void {
    if (this.mode() === m) return;
    this.audio.playClick();
    this.mode.set(m);
  }

  setTargetPreset(value: string): void {
    this.audio.playClick();
    this.target.set(value);
  }

  setAuditorPreset(preset: AuditorPreset): void {
    this.audio.playClick();
    this.requestedBy.set(preset.email);
  }

  getVerdictInfo(verdict: SecurityVerdict): { title: string; subtitle: string; cssClass: string } {
    switch (verdict) {
      case 'CRITICAL_THREAT':
        return {
          title: 'AMENAZA CRÍTICA INTERCEPTADA',
          subtitle: 'Ataque de alto impacto detectado y neutralizado por el orquestador.',
          cssClass: 'critical_threat'
        };
      case 'ATTENTION_REQUIRED':
        return {
          title: 'ANOMALÍA SOSPECHOSA DETECTADA',
          subtitle: 'Comportamiento atípico registrado que requiere monitoreo preventivo.',
          cssClass: 'attention_required'
        };
      case 'SAFE':
      default:
        return {
          title: 'PERÍMETRO 100% SEGURO',
          subtitle: 'No se encontraron indicadores de compromiso ni brechas activas.',
          cssClass: 'safe'
        };
    }
  }

  getRiskLevel(score: number): { label: string; cssClass: string } {
    if (score > 70) return { label: 'Riesgo Crítico', cssClass: 'high-risk' };
    if (score > 30) return { label: 'Riesgo Moderado', cssClass: 'med-risk' };
    return { label: 'Riesgo Bajo / Nominal', cssClass: 'safe-risk' };
  }

  executeSimulation(): void {
    if (this.isLoading()) return;

    this.audio.playClick();
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.result.set(null);

    const payload: SecurityAgentRequest = {
      mode: this.mode(),
      target: this.target().trim() || 'auth.perimeter.internal',
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
        this.currentStep.set(3); // Transición automática al reporte forense
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message || 'Error al conectar con el orquestador n8n.');
        this.isLoading.set(false);
        this.audio.playGameOver();
      }
    });
  }

  restartSimulator(): void {
    this.audio.playClick();
    this.errorMessage.set(null);
    this.result.set(null);
    this.isLoading.set(false);
    this.currentStep.set(1);
  }

  resetSimulation(): void {
    this.restartSimulator();
  }
}

export {
  IncidentSimulatorComponent as CyberDefenseComponent,
  IncidentSimulatorComponent as CyberDefenseDashboardComponent
};
