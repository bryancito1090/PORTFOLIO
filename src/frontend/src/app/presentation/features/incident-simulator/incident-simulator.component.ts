import { Component, ChangeDetectionStrategy, signal, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { I18nService } from '../../../application/services/i18n.service';
import { RetroAudioService } from '../../../application/services/retro-audio.service';

export type SimulationStage = 'idle' | 'breach' | 'detection' | 'remediation' | 'notification' | 'contained';

export interface SecOpsLog {
  readonly timestamp: string;
  readonly level: 'WARN' | 'INFO' | 'ACTION' | 'SUCCESS';
  readonly tag: string;
  readonly message: string;
}

@Component({
  selector: 'app-incident-simulator',
  standalone: true,
  templateUrl: './incident-simulator.component.html',
  styleUrl: './incident-simulator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentSimulatorComponent implements OnInit, OnDestroy {
  protected readonly i18n = inject(I18nService);
  private readonly audio = inject(RetroAudioService);

  protected readonly stage = signal<SimulationStage>('idle');
  protected readonly logs = signal<SecOpsLog[]>([]);
  protected readonly threatIp = signal<string>('198.51.100.42');
  protected readonly executionTimeMs = signal<number>(184);

  protected readonly isSimulating = computed<boolean>(() => {
    const s = this.stage();
    return s === 'breach' || s === 'detection' || s === 'remediation' || s === 'notification';
  });

  protected readonly isContained = computed<boolean>(() => this.stage() === 'contained');

  private timeoutIds: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    this.initDefaultLogs();
  }

  private initDefaultLogs(): void {
    const time = this.getCurrentTimestamp();
    this.logs.set([
      {
        timestamp: time,
        level: 'INFO',
        tag: 'GUARDDUTY',
        message: 'Cloud perimeter telemetry nominal. 0 active security findings in us-east-1.'
      },
      {
        timestamp: time,
        level: 'INFO',
        tag: 'EVENTBRIDGE',
        message: 'Active rule pattern matched: Rule-SecOps-IAM-AutoRemediation [ENABLED].'
      }
    ]);
  }

  startSimulation(): void {
    if (this.isSimulating()) return;

    this.clearTimeouts();
    this.audio.playClick();
    this.logs.set([]);

    // Fase 1: Intento de Acceso No Autorizado (Vector de Amenaza)
    this.stage.set('breach');
    this.appendLog({
      level: 'WARN',
      tag: 'IAM-ALERT',
      message: `Anomalous API request: iam:CreateAccessKey from untrusted IP ${this.threatIp()} for principal "svc-deployer".`
    });

    // Fase 2: Captura en CloudTrail & Enrutamiento en EventBridge (después de 700ms)
    const t1 = setTimeout(() => {
      this.stage.set('detection');
      this.audio.playCellReveal();
      this.appendLog({
        level: 'INFO',
        tag: 'CLOUDTRAIL',
        message: 'Management event ingested in us-east-1. EventBridge rule "SecOps-AutoRemediate" triggered synchronously.'
      });
    }, 700);
    this.timeoutIds.push(t1);

    // Fase 3: Remediación Automatizada en AWS Lambda (después de 1500ms)
    const t2 = setTimeout(() => {
      this.stage.set('remediation');
      this.audio.playFlagToggle();
      this.appendLog({
        level: 'ACTION',
        tag: 'LAMBDA',
        message: 'Executing fn-iam-incident-response: Revoking active STS sessions & attaching inline DenyAllSecurityPolicy.'
      });
    }, 1500);
    this.timeoutIds.push(t2);

    // Fase 4: Despacho de Notificación Amazon SES (después de 2300ms)
    const t3 = setTimeout(() => {
      this.stage.set('notification');
      this.audio.playCellReveal();
      this.appendLog({
        level: 'INFO',
        tag: 'SES-ALERT',
        message: 'Dispatching cryptographic audit report to secops-team@bryan.dev via Amazon SES.'
      });
    }, 2300);
    this.timeoutIds.push(t3);

    // Fase 5: Amenaza Contenida con Éxito (después de 3100ms)
    const t4 = setTimeout(() => {
      this.stage.set('contained');
      this.audio.playVictory();
      this.appendLog({
        level: 'SUCCESS',
        tag: 'CONTAINED',
        message: `Threat neutralized successfully in ${this.executionTimeMs()}ms. Zero credentials compromised. State: SECURE.`
      });
    }, 3100);
    this.timeoutIds.push(t4);
  }

  resetSimulation(): void {
    this.clearTimeouts();
    this.audio.playClick();
    this.stage.set('idle');
    this.initDefaultLogs();
  }

  private appendLog(entry: Omit<SecOpsLog, 'timestamp'>): void {
    const timestamp = this.getCurrentTimestamp();
    this.logs.update(prev => [...prev, { ...entry, timestamp }]);
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  }

  private clearTimeouts(): void {
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds = [];
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }
}
